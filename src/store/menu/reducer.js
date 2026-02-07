import * as types from "./actionTypes";

const initialState = {
  loading: false,
  settings: {},
  slots: [],
  tools: [],
  error: null,
};

const menuManagementReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.FETCH_MENU_MANAGEMENT_REQUEST:
      return { ...state, loading: true };

    case types.FETCH_MENU_MANAGEMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        settings: action.payload.settings,
        slots: action.payload.slots,
        tools: action.payload.tools,
      };

    case types.FETCH_MENU_MANAGEMENT_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case types.ADD_MENU_SLOT_SUCCESS:
      return {
        ...state,
        slots: [...state.slots, action.payload],
      };

    case types.REMOVE_MENU_SLOT_SUCCESS:
      return {
        ...state,
        slots: state.slots.filter((s) => s.id !== action.payload),
      };

    default:
      return state;
  }
};

export default menuManagementReducer;
