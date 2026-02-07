import {
  GET_CHATS,
  GET_CHATS_FAIL,
  GET_CHATS_SUCCESS,
  GET_GROUPS,
  GET_GROUPS_FAIL,
  GET_GROUPS_SUCCESS,
  GET_CONTACTS_FAIL,
  GET_CONTACTS_SUCCESS,
  GET_MESSAGES,
  GET_MESSAGES_FAIL,
  GET_MESSAGES_SUCCESS,
  GET_CHANNEL_MESSAGES,
  GET_CHANNEL_MESSAGES_FAIL,
  GET_CHANNEL_MESSAGES_SUCCESS,
  POST_ADD_MESSAGE,
  POST_ADD_MESSAGE_FAIL,
  POST_ADD_MESSAGE_SUCCESS,
  UPDATE_BLOCKED,
  UPDATE_BLOCKED_SUCCESS,
  UPDATE_BLOCKED_FAIL,
  UPDATE_MUTED,
  UPDATE_MUTED_SUCCESS,
  UPDATE_MUTED_FAIL,
  UPDATE_NOTE,
  UPDATE_NOTE_SUCCESS,
  UPDATE_NOTE_FAIL,
  DELETE_CHAT_FAILURE ,
  DELETE_CHAT_SUCCESS,
  DELETE_CHAT,
  UPDATE_CONTACT_SUCCESS,
  UPDATE_CONTACT,
  CLEAR_CHAT,
  SET_SELECTED_USER,
  SELECT_USER,
  SOCKET_MESSAGE_RECEIVED,
  PAYMENT_RECEIVED,
  SOCKET_ERROR_RECEIVED,
  MESSAGE_READ_SUCCESS,
  MESSAGE_SEEN_RECEIVED,
  ADD_MEMBER_REQUEST,
  ADD_MEMBER_SUCCESS,
  ADD_MEMBER_FAIL,
  REMOVE_CHANNEL_USER,
  CHANNEL_AVATAR_REQUEST, 
  CHANNEL_AVATAR_SUCCESS, 
  CHANNEL_AVATAR_FAILURE,
  UPDATE_CHANNEL_REQUEST,
  UPDATE_CHANNEL_SUCCESS,
  UPDATE_CHANNEL_FAILURE,
  MESSAGE_READ,
  UPDATE_UNREAD_COUNT,
  REMOVE_MEMBER,
  UPDATE_LAST_MESSAGE,
  GET_CHANNEL_BY_SLUG,
  GET_FOLLOW_CHANNEL,
  PAY_MESSAGE,
  PAY_MESSAGE_FAIL,
  PAY_MESSAGE_SUCCESS,
  UPDATE_PAYMENT_REQUEST,
  UPDATE_PAYMENT_SUCCESS,
  UPDATE_PAYMENT_FAILURE,
  MESSAGE_DESTROYED
} from "./actionTypes"

export const getChats = () => ({
  type: GET_CHATS,
})

export const getChatsSuccess = chats => ({
  type: GET_CHATS_SUCCESS,
  payload: chats,
})

export const getChatsFail = error => ({
  type: GET_CHATS_FAIL,
  payload: error,
})

export const getGroups = () => ({
  type: GET_GROUPS,
})

export const getGroupsSuccess = groups => ({
  type: GET_GROUPS_SUCCESS,
  payload: groups,
})

export const getGroupsFail = error => ({
  type: GET_GROUPS_FAIL,
  payload: error,
})

export const getContacts = (searchQuery = "") => ({
  type: 'GET_CONTACTS',
  payload: { searchQuery },
});

export const getContactsSuccess = contacts => ({
  type: GET_CONTACTS_SUCCESS,
  payload: contacts,
})

export const getContactsFail = error => ({
  type: GET_CONTACTS_FAIL,
  payload: error,
})

export const getMessages = (receiver, sender, channelId) => ({
  type: GET_MESSAGES,
  receiver,
  sender,
  channelId,
})

export const clearChat = (receiver,sender,channelId) => ({
  type: CLEAR_CHAT,
  receiver,
  sender,
  channelId
})
export const getMessagesSuccess = messages => ({
  type: GET_MESSAGES_SUCCESS,
  payload: messages,
})

export const getMessagesFail = error => ({
  type: GET_MESSAGES_FAIL,
  payload: error,
})
export const getChannelBySlug = (channelName,callback) => ({
  type: GET_CHANNEL_BY_SLUG,
  channelName,
  callback
})
export const getFollowChannel = (channelName,callback) => ({
  type: GET_FOLLOW_CHANNEL,
  channelName,
  callback
})
export const getChannelMessages = (channelName,callback) => ({
  type: GET_CHANNEL_MESSAGES,
  channelName,
  callback
})
export const getChannelMessagesSuccess = messages => ({
  type: GET_CHANNEL_MESSAGES_SUCCESS,
  payload: messages,
})


export const getChannelMessagesFail = error => ({
  type: GET_CHANNEL_MESSAGES_FAIL,
  payload: error,
})
export const addMessage = (message,id) => ({
  type: POST_ADD_MESSAGE,
  message,
  id
})
export const addMessageSuccess = message => ({
  type: POST_ADD_MESSAGE_SUCCESS,
  payload: message,
})

export const addMessageFail = error => ({
  type: POST_ADD_MESSAGE_FAIL,
  payload: error,
})
export const payMessage = (message,id,callback) => ({
  type: PAY_MESSAGE,
  message,
  id,
  callback
})
export const payMessageSuccess = message => ({
  type: PAY_MESSAGE_SUCCESS,
  payload: message,
})

export const payMessageFail = error => ({
  type: PAY_MESSAGE_FAIL,
  payload: error,
})
export const updateBlocked = (contactId, blocked) => ({
  type: UPDATE_BLOCKED,
  contactId,
  blocked,
});

export const updateBlockedSuccess = (contact) => ({
  type: UPDATE_BLOCKED_SUCCESS,
  contact,
});

export const updateBlockedFail = (error) => ({
  type: UPDATE_BLOCKED_FAIL,
  error,
});

export const updateMuted = (contactId, muted) => ({
  type: UPDATE_MUTED,
  contactId,
  muted,
});

export const updateContact = (contactId, value, field,itemType,callback) => ({
  type: UPDATE_CONTACT,
  contactId,
  value,
  field,
  itemType,
  callback
});
export const updateMutedSuccess = (contact) => ({
  type: UPDATE_MUTED_SUCCESS,
  contact,
});

export const updateSuccess = (contact) => ({
  type: UPDATE_CONTACT_SUCCESS,
  payload: contact,
});

export const updateMutedFail = (error) => ({
  type: UPDATE_MUTED_FAIL,
  error,
});
export const updateFail = (error) => ({
  type: UPDATE_MUTED_FAIL,
  error,
});

export const updateNote = (contactId, note) => ({
  type: UPDATE_NOTE,
  contactId,
  note,
});

export const updateNoteSuccess = (contact) => ({
  type: UPDATE_NOTE_SUCCESS,
  contact,
});

export const updateNoteFail = (error) => ({
  type: UPDATE_NOTE_FAIL,
  error,
});
export const deleteChat = (id ,type) => ({
  type: DELETE_CHAT,
  payload: { id ,type},
});

export const deleteChatSuccess = (id) => ({
  type: DELETE_CHAT_SUCCESS,
  payload: { id },
});

export const deleteChatFailure = (error) => ({
  type: DELETE_CHAT_FAILURE,
  payload: { error },
});

export const setSelectedUser = (user) => ({
  type: SET_SELECTED_USER,
  payload: user,
});

export const selectUser = (user) => ({
  type: SELECT_USER,
  payload: user,
});
export const socketMessageReceived = (message) => ({
  type: SOCKET_MESSAGE_RECEIVED,
  payload: message,
});
export const paymentReceived = (message) => ({
  type: PAYMENT_RECEIVED,
  payload: message,
});
export const socketErrorReceived = (error) => ({
  type: SOCKET_ERROR_RECEIVED,
  payload: error,
});

export const messageReadSuccess = (message) => ({
  type: MESSAGE_READ_SUCCESS,
  payload: message,
});

export function messageSeenReceived(message) {
  return {
    type: MESSAGE_SEEN_RECEIVED,
    payload: { message },
  };
}
export const addChannelUser = (channelId, members , callback) => ({
  type: ADD_MEMBER_REQUEST,
  channelId,
  members,
  callback
});

export const addMemberSuccess = (data) => ({
  type: ADD_MEMBER_SUCCESS,
  payload: data,
});

export const addMemberFail = (error) => ({
  type: ADD_MEMBER_FAIL,
  error,
});


export const removeChannelUser = (channelId, address) => ({
  type: REMOVE_CHANNEL_USER,
  channelId,
  address,
});
export const changeChannelAvatar = (avatar, id) => ({
  type: CHANNEL_AVATAR_REQUEST,
  payload: { avatar, id },
});

export const changeChannelAvatarSuccess = (avatar) => ({
  type: CHANNEL_AVATAR_SUCCESS,
  payload: avatar,
});

export const changeChannelAvatarFailure = (error) => ({
  type: CHANNEL_AVATAR_FAILURE,
  payload: error,
});

export const updateChannel = (channelData, callback) => ({
  type: UPDATE_CHANNEL_REQUEST,
  payload: channelData,
  callback,
});

export const updateChannelSuccess = (response) => ({
  type: UPDATE_CHANNEL_SUCCESS,
  payload: response,
});

export const updateChannelFailure = (error) => ({
  type: UPDATE_CHANNEL_FAILURE,
  payload: error,
});
export const messageRead = (message) => ({
  type: MESSAGE_READ,
  payload: message,
});

export const updateUnreadCount = (id, unreadCount) => ({
  type: UPDATE_UNREAD_COUNT,
  payload: { id, unreadCount }
});

export const removeMember = (channelId, address,callback) => ({
  type: REMOVE_MEMBER,
  channelId,
  address,
  callback
});

export const updateLastMessage = (id, message) => ({
  type: UPDATE_LAST_MESSAGE,
  payload: { id, message },
});

export const updatePaymentRequest = (paymentData,callback) => ({
  type: UPDATE_PAYMENT_REQUEST,
  paymentData,
  callback,
});

export const updatePaymentSuccess = (message) => ({
  type: UPDATE_PAYMENT_SUCCESS,
  payload: message,
});

export const updatePaymentFailure = (error) => ({
  type: UPDATE_PAYMENT_FAILURE,
  payload: error,
});

export const messageDestroyed = (payload) => ({
  type: MESSAGE_DESTROYED,
  payload,
});
