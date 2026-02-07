import * as types from "./actionTypes";

export const fetchMenuManagement = () => ({
  type: types.FETCH_MENU_MANAGEMENT_REQUEST,
});

export const fetchMenuManagementSuccess = (data) => ({
  type: types.FETCH_MENU_MANAGEMENT_SUCCESS,
  payload: data,
});

export const fetchMenuManagementFailure = (error) => ({
  type: types.FETCH_MENU_MANAGEMENT_FAILURE,
  payload: error,
});

export const addMenuSlot = (payload, callback) => ({
  type: types.ADD_MENU_SLOT_REQUEST,
  payload,
  callback,
});

export const addMenuSlotSuccess = (slot) => ({
  type: types.ADD_MENU_SLOT_SUCCESS,
  payload: slot,
});

export const addMenuSlotFailure = (error) => ({
  type: types.ADD_MENU_SLOT_FAILURE,
  payload: error,
});

export const removeMenuSlot = (slotId) => ({
  type: types.REMOVE_MENU_SLOT_REQUEST,
  payload: slotId,
});

export const removeMenuSlotSuccess = (slotId) => ({
  type: types.REMOVE_MENU_SLOT_SUCCESS,
  payload: slotId,
});

export const removeMenuSlotFailure = (error) => ({
  type: types.REMOVE_MENU_SLOT_FAILURE,
  payload: error,
});
