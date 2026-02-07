import { call, put, takeLatest } from "redux-saga/effects";
import axios, { setAuthToken } from "../../../util/axiosConfig";
import socket from '../../../util/socket';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAILURE,
  CHECK_AUTH_REQUEST,
  CHECK_AUTH_SUCCESS,
  CHECK_AUTH_FAILURE,
  CHANGE_AVATAR_REQUEST,
  CHANGE_AVATAR_SUCCESS,
  CHANGE_AVATAR_FAILURE,
  GET_WORD_POOL,
  GET_WORD_POOL_SUCCESS,
  UPDATE_NICKNAME,
  UPDATE_NICKNAME_SUCCESS,
  UPDATE_NICKNAME_FAILURE,
  FETCH_IDENTITY_REQUEST,
  UPDATE_USER_SETTINGS_REQUEST,
  UPDATE_USER_SETTINGS_SUCCESS
} from "./actionTypes";
import { toast } from "react-toastify";
import {
  SET_LOADING,
  } from "../../contact/actionTypes";
  import {
    CHANGE_PRELOADER,
    } from "../../layout/actionTypes";
function* loginUser(action) {
  try {
    yield put({ type: SET_LOADING, payload: true });
    const response = yield call(axios.post, "/user/login", action.payload);
    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem("identityAddress", response.data.identity.address);
    const {message} = response.data;
    setAuthToken( response.data.token);
    toast.success(message);
    yield put({ type: LOGIN_SUCCESS, payload: { user: response.data } });
    socket.emit('login', {
      token: response.data.token,
      defaultIdentityAddress: response.data.identity.address
    });
    if (action.payload.callback) {
      setTimeout(() => {
        action.payload.callback();
      }, 1000);
      yield put({ type: SET_LOADING, payload: false });
    }
  } catch (error) {
    yield put({ type: SET_LOADING, payload: false });
    const errorMessage = error.response?.data?.message || "Error in login account.";
    toast.error(errorMessage);
    yield put({ type: LOGIN_FAILURE, payload: error.message });
  }
}
function* deleteUserAccount({ payload: { history } }) {
  try {
    yield put({ type: SET_LOADING, payload: true });
    const response = yield call(axios.get, "/user/delete-account");
    if (response.status === 200) {
      yield put({ type: SET_LOADING, payload: false });
      localStorage.removeItem("authToken");
      const { message } = response.data;
      toast.success(message);
      yield put({ type: DELETE_ACCOUNT_SUCCESS });
      history("/login");
    }
  } catch (error) {
    yield put({ type: SET_LOADING, payload: false });
    const errorMessage = error.response?.data?.message || "Error deleting account.";
    toast.error(errorMessage);
    yield put({ type: DELETE_ACCOUNT_FAILURE, payload: errorMessage });
  }
}
function* logoutUser({ payload: { history } }) {
  try {
    yield put({ type: SET_LOADING, payload: true });
    const response = yield call(axios.get, "/user/logout");
    if (response.status === 200) {
      yield put({ type: SET_LOADING, payload: false });
      const { message } = response.data;
      localStorage.removeItem("authToken");
      toast.success(message);
      yield put({ type: LOGOUT_SUCCESS });
      history("/login");
    }
  } catch (error) {
    yield put({ type: SET_LOADING, payload: false });
    const errorMessage = error.response?.data?.message || "Error logging out.";
    toast.error(errorMessage);
    yield put({ type: LOGOUT_FAILURE, payload: errorMessage });
  }
}
function* checkAuth({ payload: { history } }) {
  try {
    yield put({ type: SET_LOADING, payload: true });
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      throw new Error("No auth token");
    }
    const response = yield call(axios.get, "/user/authenticated", {
      headers: {
        Authorization: authToken
      }
    });
    yield put({ type: LOGIN_SUCCESS, payload: { user: response.data } });
    yield put({ type: CHECK_AUTH_SUCCESS, payload: response.data.identity });
    yield put({ type: SET_LOADING, payload: false });
  } catch (error) {
    yield put({ type: SET_LOADING, payload: false });
    const errorMessage = error.response?.data?.message || "Authentication check failed.";
    yield put({ type: CHECK_AUTH_FAILURE, payload: errorMessage });
    localStorage.removeItem("authToken");
    yield put({ type: LOGOUT_SUCCESS });
  }
}
function* changeAvatar(payload) {
  try {
    yield put({ type: SET_LOADING, payload: true });
    const formData = new FormData();
    formData.append("avatar", payload.payload);
    const response = yield call(axios.post, "/user/change-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200) {
      yield put({ type: SET_LOADING, payload: false });
      const { message,avatar } = response.data;
      toast.success(message);
      yield put({ type: CHANGE_AVATAR_SUCCESS, payload: avatar});
    }
  } catch (error) {
    yield put({ type: SET_LOADING, payload: false });
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to change avatar.";
    toast.error(errorMessage);
    yield put({ type: CHANGE_AVATAR_FAILURE, payload: errorMessage });
  }
}
function* getWordPool() {
  try {
    yield put({ type: SET_LOADING, payload: true });
    const response = yield call(axios.get,"/user/get-word-pool"); 
    if (response.status === 200) {
      yield put({ type: SET_LOADING, payload: false });
      yield put({ type: GET_WORD_POOL_SUCCESS, payload: response.data });
    }
  } catch (error) {
    yield put({ type: SET_LOADING, payload: false });
    const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to fetch word pool.";
    toast.error(errorMessage);
  }
}
function* updateNickname(action) {
  try {
    const {nickname} = action.payload
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.post, "/user/update-nickname", {
      nickname
    });
    yield put({ type: CHANGE_PRELOADER, payload: false });
    yield put({ type: UPDATE_NICKNAME_SUCCESS, payload: response.data.nickname });
    if (action.payload.callback) {
      setTimeout(()=>{
      action.payload.callback(response.data.nickname);
      },500);
    }
    toast.success(response.data.message);
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const errorMessage = error.response?.data?.message || "Error updating nickname.";
    yield put({ type: UPDATE_NICKNAME_FAILURE, payload: errorMessage });
    toast.error(errorMessage);
  } 
}
function* fetchIdentity({address,nickname,callback}) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    let response =null;
    if(address) {
     response = yield call(axios.get, `/user/identity/${address}`);
    }
    if(nickname) {
      response = yield call(axios.get, `/user/identity/${nickname}/id`);
    }
    if (callback) {
      setTimeout(()=>{
        callback(response.data.identity);
      },500);
    }
    toast.success(response.message);
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch identity.";
    toast.error(errorMessage);
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* updateSettingsSaga({ payload, callback }) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const { data } = yield call(
      axios.patch,
      "/user/update-setting",
      payload
    );

    if (data.success) {
      yield put({ type: CHANGE_PRELOADER, payload: false });
      if (callback) callback(data.settings);
      yield put({
        type: UPDATE_USER_SETTINGS_SUCCESS,
        payload: data.settings,
      });
      toast.success(data.message);
    }
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const errorMessage = error.response?.data?.message || "Failed to fetch identity.";
    toast.error(errorMessage);
    console.error("Settings update failed", error);
  }
}
export default function* authSaga() {
  yield takeLatest(CHECK_AUTH_REQUEST, checkAuth);
  yield takeLatest(LOGIN_REQUEST, loginUser);
  yield takeLatest(LOGOUT_REQUEST, logoutUser);
  yield takeLatest(DELETE_ACCOUNT_REQUEST, deleteUserAccount);
  yield takeLatest(CHANGE_AVATAR_REQUEST, changeAvatar);
  yield takeLatest(GET_WORD_POOL, getWordPool);
  yield takeLatest(UPDATE_NICKNAME, updateNickname);
  yield takeLatest(FETCH_IDENTITY_REQUEST, fetchIdentity);
  yield takeLatest(UPDATE_USER_SETTINGS_REQUEST, updateSettingsSaga);
}
