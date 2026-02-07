import {
  CREATE_CONTACT_REQUEST,
  CREATE_CONTACT_SUCCESS,
  CREATE_CONTACT_FAILURE,
  FETCH_CONTACTS_REQUEST,
  FETCH_CONTACTS_SUCCESS,
  FETCH_CONTACTS_FAILURE,
  CREATE_CHANNEL_REQUEST,  
  CREATE_CHANNEL_SUCCESS,
  CREATE_CHANNEL_FAILURE,
} from './actionTypes';

const initialState = {
  contacts: [],
  channel: "",
  loading: false,
  error: null,
  createContactSuccess: "",
  createContactError: "",
  channelSuccess:false,
};

const contactReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_CONTACT_REQUEST:
    case FETCH_CONTACTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_CONTACT_SUCCESS:
      return {
        ...state,
        loading: false,
        contacts: [...state.contacts, action.payload],
        createContactSuccess: true,
        createContactError: null,
      };

    case FETCH_CONTACTS_SUCCESS:
      return {
        ...state,
        loading: false,
        contacts: action.payload,
        error: null,
      };

    case CREATE_CONTACT_FAILURE:
    case FETCH_CONTACTS_FAILURE:
      return {
        ...state,
        loading: false,
        createContactSuccess: false,
        createContactError: true,
      };
    case CREATE_CHANNEL_SUCCESS:
      return {
        ...state,
        loading: false,
        channel: action.payload,
        channelSuccess:true,
        error: null,
      };

    case CREATE_CHANNEL_REQUEST:
      return {
        ...state,
        loading: false,
        channel: action.payload,
        error: null,
      };
      case CREATE_CHANNEL_FAILURE:
        return {
          ...state,
          channelSuccess:false,
        };
    default:
      return state;
  }
};

export default contactReducer;
