import { call, put, takeLatest } from "redux-saga/effects";
import axios from "../../util/axiosConfig";
import socket from '../../util/socket';
import {
  CREATE_CONTACT_REQUEST,
  CREATE_CONTACT_SUCCESS,
  CREATE_CONTACT_FAILURE,
  FETCH_CONTACTS_REQUEST,
  FETCH_CONTACTS_SUCCESS,
  FETCH_CONTACTS_FAILURE,
  CREATE_CHANNEL_REQUEST,
  CREATE_CHANNEL_FAILURE,
} from "./actionTypes";
import { toast } from "react-toastify";
import {
    CHANGE_PRELOADER,
  } from "../layout/actionTypes";
    
import { createChannelSuccess } from "./actions";

// Worker Sagas
function* createContact(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.post, "/user/contact/create", action.payload.contactData);
    const { message } = response.data;
    toast.success(message);
    yield put({ type: CREATE_CONTACT_SUCCESS, payload: response.data.contact });
    socket.emit('requestedContact',{
      to:response.data.contact.address,
      id:response.data.requestId
    });
    if (action.payload.callback) {
      setTimeout(() => {
        action.payload.callback();
      }, 30);
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const errorMessage = error.response?.data?.error || "Failed to create contact.";
    toast.error(errorMessage);
    yield put({ type: CREATE_CONTACT_FAILURE, payload: errorMessage });
  }
}
function* createChannel(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    yield put({ type: CREATE_CHANNEL_FAILURE, payload: {} });
    const formData = new FormData();
    formData.append('name', action.payload.name);
    formData.append('avatar', action.payload.avatar); 
    formData.append('description', action.payload.description);
    formData.append('fileExtension', action.payload.fileExtension);
    formData.append('createdBy', action.payload.createdBy);
    formData.append('type', action.payload.type);

    const response = yield call(axios.post, "/user/channel/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
     if (response.status !== 200 || response.data.error) {
      toast.error ("An error occurred while creating the channel.");
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const { channel } = response.data;
    let message =response?.data?.message || 'Channel created successfully.';
    toast.success(message);
    yield put(createChannelSuccess(channel));
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const errorMessage = error.response?.data?.message || "Failed to create channel.";
    toast.error(errorMessage);
    yield put({ type: CREATE_CHANNEL_FAILURE, payload: errorMessage });
  }
}
function* fetchContacts() {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.get, "/contacts");
    yield put({ type: CHANGE_PRELOADER, payload: false });
    yield put({ type: FETCH_CONTACTS_SUCCESS, payload: response.data });
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const errorMessage = error.response?.data?.error || "Failed to fetch contacts.";
    toast.error(errorMessage);
    yield put({ type: FETCH_CONTACTS_FAILURE, payload: errorMessage });
  }
}

// Watcher Sagas
function* contactSaga() {
  yield takeLatest(CREATE_CONTACT_REQUEST, createContact);
  yield takeLatest(FETCH_CONTACTS_REQUEST, fetchContacts);
  yield takeLatest(CREATE_CHANNEL_REQUEST, createChannel);

}

export default contactSaga;
