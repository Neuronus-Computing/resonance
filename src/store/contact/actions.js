// actions.js
import {
  CREATE_CONTACT_REQUEST,
  CREATE_CONTACT_SUCCESS,
  CREATE_CONTACT_FAILURE,
  CREATE_CHANNEL_REQUEST,
  CREATE_CHANNEL_SUCCESS,
  CREATE_CHANNEL_FAILURE,
  FETCH_CONTACTS_REQUEST,
  FETCH_CONTACTS_SUCCESS,
  FETCH_CONTACTS_FAILURE,
   
} from "./actionTypes";

export const createContact = (contactData,callback) => ({
  type: CREATE_CONTACT_REQUEST,
  payload: {contactData,callback},
});

export const createContactSuccess = (contact) => ({
  type: CREATE_CONTACT_SUCCESS,
  payload: contact,
});

export const createContactFailure = (error) => ({
  type: CREATE_CONTACT_FAILURE,
  payload: error,
});
export const createChannel = (channelData) => ({
  type: CREATE_CHANNEL_REQUEST,
  payload: channelData,
});

export const createChannelSuccess = (channel) => ({
  type: CREATE_CHANNEL_SUCCESS,
  payload: channel,
});

export const createChannelFailure = (error) => ({
  type: CREATE_CHANNEL_FAILURE,
  payload: error,
});

// Action creators for fetching contacts
export const fetchContactsRequest = () => ({
  type: FETCH_CONTACTS_REQUEST,
});

export const fetchContactsSuccess = (contacts) => ({
  type: FETCH_CONTACTS_SUCCESS,
  payload: contacts,
});

export const fetchContactsFailure = (error) => ({
  type: FETCH_CONTACTS_FAILURE,
  payload: error,
});
