import { call, put, takeLatest } from "redux-saga/effects";
import axios from "../../util/axiosConfig";
import {  CHANGE_PRELOADER } from "../layout/actionTypes";
import {
  CREATE_CASH_REQUEST
} from "./actionTypes";
import { createCashRequestSuccess, createCashRequestFailure } from "../actions";
import { toast } from "react-toastify";

function* handleCreateCashRequest(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.post, "/user/cash/create", action.payload);
    yield put(createCashRequestSuccess(response.data));
    toast.success(response.data.message);
    yield put({ type: CHANGE_PRELOADER, payload: false });
    if (action.callback) {
      action.callback(response.data.cash);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Something went wrong, please try again.";
    toast.error(errorMessage);
    yield put(createCashRequestFailure(errorMessage));
    // if (action.callback) {
    //   action.callback(error);
    // }
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}

export default function* cashSaga() {
  yield takeLatest(CREATE_CASH_REQUEST, handleCreateCashRequest);
}
