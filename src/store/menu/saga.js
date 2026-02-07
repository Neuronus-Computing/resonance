import { call, put, takeLatest } from "redux-saga/effects";
import axios from "../../util/axiosConfig";
import { CHANGE_PRELOADER } from "../layout/actionTypes";
import * as types from "./actionTypes";
import {
  fetchMenuManagementSuccess,
  fetchMenuManagementFailure,
  addMenuSlotSuccess,
  addMenuSlotFailure,
  removeMenuSlotSuccess,
  removeMenuSlotFailure,
} from "./actions";
import { toast } from "react-toastify";

/* ---------------- FETCH MENU MANAGEMENT ---------------- */

function* handleFetchMenuManagement() {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });

    const response = yield call(axios.get, "/user/menu-management");
    yield put(fetchMenuManagementSuccess(response.data.data));

    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to load menu management";
    toast.error(errorMessage);
    yield put(fetchMenuManagementFailure(errorMessage));
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}

/* ---------------- ADD SLOT ---------------- */

function* handleAddMenuSlot(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });

    const response = yield call(
      axios.post,
      "/user/menu-management/slots",
      action.payload
    );

    yield put(addMenuSlotSuccess(response.data));
    toast.success(response.data.message || "Slot added");
    yield put({ type: CHANGE_PRELOADER, payload: false });
    if (action.callback) {
      action.callback(response.data.slot);
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to add slot";
    toast.error(errorMessage);
    yield put(addMenuSlotFailure(errorMessage));
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}

/* ---------------- REMOVE SLOT ---------------- */

function* handleRemoveMenuSlot(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });

    const response = yield call(
      axios.delete,
      `/user/menu-management/slots/${action.payload}`
    );

    yield put(removeMenuSlotSuccess(action.payload));
    toast.success(response.data.message || "Slot removed");

    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to remove slot";
    toast.error(errorMessage);
    yield put(removeMenuSlotFailure(errorMessage));
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
export default function* menuManagementSaga() {
  yield takeLatest(types.FETCH_MENU_MANAGEMENT_REQUEST, handleFetchMenuManagement);
  yield takeLatest(types.ADD_MENU_SLOT_REQUEST, handleAddMenuSlot);
  yield takeLatest(types.REMOVE_MENU_SLOT_REQUEST, handleRemoveMenuSlot);
}
