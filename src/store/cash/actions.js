// actions.js
import {
  CREATE_CASH_REQUEST,
  CREATE_CASH_REQUEST_SUCCESS,
  CREATE_CASH_REQUEST_FAILURE,
} from "./actionTypes";

// Action to trigger the saga
export const createCashRequest = (payload, callback) => ({
  type: CREATE_CASH_REQUEST,
  payload,
  callback, // Optional: Callback to handle success or failure
});

// Action dispatched when the request succeeds
export const createCashRequestSuccess = (response) => ({
  type: CREATE_CASH_REQUEST_SUCCESS,
  response,
});

// Action dispatched when the request fails
export const createCashRequestFailure = (error) => ({
  type: CREATE_CASH_REQUEST_FAILURE,
  error,
});
