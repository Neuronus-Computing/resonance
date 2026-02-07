// reducers/cashRequestReducer.js
import {
  CREATE_CASH_REQUEST,
  CREATE_CASH_REQUEST_SUCCESS,
  CREATE_CASH_REQUEST_FAILURE,
} from "./actionTypes";

const initialState = {
  loading: false,
  success: false,
  error: null,
  data: null,
};

const cashReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_CASH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };

    case CREATE_CASH_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        data: action.response,
      };

    case CREATE_CASH_REQUEST_FAILURE:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.error,
      };

    default:
      return state;
  }
};

export default cashReducer;
