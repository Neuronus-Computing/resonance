import { takeEvery, put, call ,fork, take, select, all } from "redux-saga/effects"
import axios from "../../util/axiosConfig";
import { toast } from "react-toastify";
import socket from '../../util/socket';
import { eventChannel } from 'redux-saga';
import {
  CHANGE_PRELOADER,
  } from "../layout/actionTypes";
import {
  GET_CHATS,
  GET_CONTACTS,
  GET_GROUPS,
  GET_MESSAGES,
  GET_CHANNEL_MESSAGES,
  POST_ADD_MESSAGE,
  UPDATE_BLOCKED,
  UPDATE_MUTED,
  UPDATE_NOTE,
  DELETE_CHAT,
  UPDATE_CONTACT,
  CLEAR_CHAT,
  SELECT_USER,
  SOCKET_MESSAGE_RECEIVED,
  PAYMENT_RECEIVED,
  SOCKET_ERROR_RECEIVED,
  MESSAGE_SEEN_RECEIVED,
  ADD_MEMBER_REQUEST,
  REMOVE_CHANNEL_USER,
  CHANNEL_AVATAR_SUCCESS,
  CHANNEL_AVATAR_REQUEST,
  UPDATE_CHANNEL_REQUEST,
  UPDATE_CHANNEL_SUCCESS,
  UPDATE_CHANNEL_FAILURE,
  MESSAGE_STATUS_UPDATE,
  MESSAGE_READ,
  UPDATE_UNREAD_COUNT,
  REMOVE_MEMBER,
  UPDATE_LAST_MESSAGE,
  GET_CHANNEL_BY_SLUG,
  GET_FOLLOW_CHANNEL,
  PAY_MESSAGE,
  UPDATE_PAYMENT_REQUEST,
  UPDATE_PAYMENT_SUCCESS,
  UPDATE_PAYMENT_FAILURE,
  MESSAGE_DESTROYED
} from "./actionTypes"
import {
  getChatsSuccess,
  getChatsFail,
  getGroupsSuccess,
  getGroupsFail,
  getContactsFail,
  getMessagesSuccess,
  getMessagesFail,
  getChannelMessagesSuccess,
  getChannelMessagesFail,
  addMessageSuccess,
  payMessageSuccess,
  updateBlockedSuccess,
  updateBlockedFail,
  updateMutedSuccess,
  updateMutedFail,
  updateNoteSuccess,
  updateNoteFail,
  deleteChatSuccess, 
  updateFail,
  updateSuccess,
  setSelectedUser,
  socketMessageReceived,
  paymentReceived,
  socketErrorReceived,
  messageSeenReceived,
  addMemberFail,
  updatePaymentSuccess
} from "./actions"
import { deselectOptions } from "@testing-library/user-event/dist/cjs/setup/directApi.js";
function* onGetChats() {
  try {
    const response = yield call(axios.get,"/user/contacts");
    console.log(response);
  } catch (error) {
    yield put(getChatsFail(error))
  }
}

// function* onGetGroups() {
//   try {
//     const response = yield call(getGroups)
//     yield put(getGroupsSuccess(response))
//   } catch (error) {
//     yield put(getGroupsFail(error))
//   }
// }

function* onGetContacts(action) {
  try {
    const searchQuery = action.payload?.searchQuery || "";  
    const response = yield call(axios.get, '/user/contacts', { params: { searchQuery }, 
    });   
   yield put(getChatsSuccess(response.data))
} catch (error) {
    yield put(getContactsFail(error))
  }
}

function* onGetMessages({ receiver, sender,channelId }) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    let response ="";
    if (channelId){
      response = yield call(axios.get, `/user/channel-messages/${channelId}`);
    }
    else{
     response = yield call(axios.get, `/user/messages/${receiver}/${sender}`);
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
    yield put(getMessagesSuccess(response.data.messages))
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    yield put(getMessagesFail(error))
  }
}
function* onGetChannelMessages({ channelName,callback }) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.get, `/user/channel/messages/${channelName}`);
    const { channel }  = response.data;
    yield put(getChannelMessagesSuccess(response.data.messages))
    if (callback) {
      callback(channel);
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    yield put(getChannelMessagesFail(error))
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
  }
}
function* onGetChannelBySlug({ channelName,callback }) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.get, `/user/channel/${channelName}`);
    const { channel }  = response.data;
    if (callback) {
      callback(channel);
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
  }
}
function* onGetFollowChannel({ channelName,callback }) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.get, `/user/channel/${channelName}/follow`);
    const { message, channel }  = response.data;
    toast.success(message);
    if (callback) {
      callback(channel);
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    // const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error("Please login to Resonance to follow this channel.");
    if (callback) {
      callback(null ,"login");
    }
  }
}
function* clearChat({ receiver, sender, channelId }) {
  try {
    let response = null;
    if(channelId){
      response = yield call(axios.get, `/user/messages/channel/${channelId}/${sender}/clear`);
    }
    else{
      response = yield call(axios.get, `/user/messages/clear/${receiver}/${sender}`);
    }
    yield put(getMessagesSuccess(response.data.messages))
    onGetMessages({ receiver, sender });
  } catch (error) {
    yield put(getMessagesFail(error))
  }
}
function* onAddMessage({ message, id }) {
  try {
    const messageData = {
      content: message.content,
      file: message.file,
      fileType: message.fileType,
      fileName: message.fileName,
      fileExtension: message.fileExtension,
      type:message.type,
      amount:message.paymentAmount,
      description:message.paymentDescription,
      walletId:message.walletId,
      currency:message.currency,
      fileSize:message.fileSize
    };
    if (message.channelId) {
      const updatedMessageData = {
        ...messageData,
        sender: message.sender ?? null,
      };
      socket.emit('channelMessage', {
        channelId: message.channelId,
        ...updatedMessageData
      });
    } else {
      socket.emit('privateMessage', {
        ...messageData,
        sender: message.sender,
        receiver: message.receiver,
      });
    }

    const response = yield new Promise((resolve) => {
      socket.once('privateMessageReceived', (message) => {
        resolve(message);
      });
    });  
    if (id) {
      let {message} = response
      yield put({type: UPDATE_LAST_MESSAGE,payload: { id, message: message }});
    }  
  } catch (error) {
    yield put({ type: 'ADD_MESSAGE_FAIL', error });
  }
}
function* onPayMessage({ message, id ,callback}) {
  try {   
      socket.emit('payMessage', {
        ...message,
      });
    const response = yield new Promise((resolve) => {
      socket.once('paymentConfirmed', (message) => {
        resolve(message);
        if(callback){
          callback(true);
        }
      });
      socket.once('errorMessage', (message) => {
        if(callback){
          callback(false);
        }
      });
    });  
    if (message.id) {
      let {message} = response
      yield put({type: UPDATE_LAST_MESSAGE,payload: { id, message: message }});
    }  
  } catch (error) {
    if(callback){
      callback(false);
    }
    yield put({ type: 'PAY_MESSAGE_FAIL', error });
  }
}
function* onUpdateBlocked({ contactId, blocked }) {
  try {
    const response = yield call(axios.patch, `/user/contact/${contactId}/block`, { blocked });
    yield put(updateBlockedSuccess(response.data.contact));
    const { message } = response.data;
    toast.success(message);
  } catch (error) {
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    yield put(updateBlockedFail(errorMessage));
  }
}
function* deleteChat(action) {
  const { id , type} = action.payload;
  yield put({ type: CHANGE_PRELOADER, payload: true });
  try {
    let response ="";
    if(type === "contact") {
      response = yield call(axios.delete, `/user/contact/${id}/delete`);
    }
    else{
      response = yield call(axios.delete, `/user/channel/${id}/delete`);
    }
    yield put(deleteChatSuccess(id));
    const { message } = response.data;
    toast.success(message);
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* onUpdateMuted({ contactId, muted }) {
  try {
    const response = yield call(axios.patch, `/user/contact/${contactId}/mute`, { muted });
    yield put(updateMutedSuccess(response.data.contact));
    const { message } = response.data;
    toast.success(message);
  } catch (error) {
    const errorMessage =
    error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    yield put(updateMutedFail(errorMessage));
  }
}
function* updateContact({ contactId, value, field ,itemType,callback}) {
  yield put({ type: CHANGE_PRELOADER, payload: true });
  let response=null ;
  try {
    if(itemType === "channel" || itemType === "group") {
      response = yield call(axios.patch, `/user/channel/${contactId}/user/update`, { value , field, itemType});
    }
    else{
      response = yield call(axios.patch, `/user/contact/${contactId}/user/update`, { value , field, itemType});
      if(field === "name" || field === "note" ){
        yield put(updateSuccess(response.data.contact));
      }
      const [currentUser] = yield all([
        select((state) => state.User.user),
      ]);
      let contactAddress = currentUser.identity.address;
      socket.emit('contactUpdated', {
        ...response.data.contact, contactAddress
      });
    }
    if(response){
      const { message } = response.data;
      yield put({ type: CHANGE_PRELOADER, payload: false });
      if (callback) {
        setTimeout(() => {
          callback();
        }, 30);
      }
      toast.success(message);
    }
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    yield put(updateFail(errorMessage));
  }
}
function* onUpdateNote({ contactId, note }) {
  try {
    const response = yield call(axios.patch, `/user/contact/${contactId}/note`, { note });
    yield put(updateNoteSuccess(response.data));
    const { message } = response.data;
    toast.success(message);
  } catch (error) {
    const errorMessage =
    error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    yield put(updateNoteFail(errorMessage));
  }
}
function* addChannelUser({ channelId, members, callback }) {
  try {
    const response = yield call(axios.post, `/user/channel/add-users`, { channelId, members });
    // yield put(addMemberSuccess(response));
    const { message, users }  = response.data;
    if (callback) {
      setTimeout(() => {
         callback(users);
      }, 300);
    }
    toast.success(message);
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Something went wrong, please try again.";
    toast.error(errorMessage);
    yield put(addMemberFail(errorMessage));
  }
}
function* removeChannelUser({ channelId, address }) {
  try {
    const response = yield call(axios.post, `/user/channel/remove-user`, { channelId, address });
    const { message } = response.data;
    toast.success(message);
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Something went wrong, please try again.";
    toast.error(errorMessage);
  }
}
function* selectUser(action) {
  try {
    const user = action.payload;
    yield put(setSelectedUser(user));
  } catch (error) {
   toast.error('Failed to select user', error);
  }
}
function* changeChannelAvatar(payload) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const formData = new FormData();
    formData.append("avatar", payload.payload.avatar);
    const response = yield call(axios.post, `/user/channel/${payload.payload.id}/change-avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.status === 200) {
      const { message } = response.data;
      toast.success(message);
      yield put({ type: CHANNEL_AVATAR_SUCCESS, payload: response.data});
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });

  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to change avatar.";
    toast.error(errorMessage);
    // yield put({ type: CHANNEL_AVATAR_FAILURE, payload: errorMessage });
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* updateChannel(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.patch, `/user/channel/${action.payload.id}/update`, action.payload);
    yield put({ type: UPDATE_CHANNEL_SUCCESS, payload: response.data});
    if (action.callback) {
      setTimeout(() => {
        action.callback(); 
      }, 30);
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const { message } = response.data;
    toast.success(message); 
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to update channel.';
    yield put({ type: UPDATE_CHANNEL_FAILURE, payload: error.response.data});
    yield put({ type: CHANGE_PRELOADER, payload: false });
    toast.error(errorMessage);
  }
}
function* removeMember({ channelId, address,callback }) {
  try {
    const response = yield call(axios.post, `/user/channel/remove-member`, { channelId, address });
    const { message,users } = response.data;
    if (callback) {
      setTimeout(() => {
        callback(users);
      }, 300);
    }
    toast.success(message);
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Something went wrong, please try again.";
    toast.error(errorMessage);
  }
}
function* messageRead(action) {
  try {
    const message = action.payload;
    socket.emit('markAsRead', {
      message
    });    
    // yield put({ type: MESSAGE_STATUS_UPDATE, payload: message });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}
function* updatePayment(action) {
  try {
    const { paymentData ,callback} = action;
    socket.emit("updatePaymentMessage", paymentData.message);
    const response = yield new Promise((resolve) => {
      socket.once('paymentUpdated', (message) => {
        resolve(message);
        if(callback){
          callback(true);
        }
      });
      socket.once('errorMessage', (message) => { });
    });
  } catch (error) {
    yield put({
      type: UPDATE_PAYMENT_FAILURE,
      payload: error.message || "An error occurred while updating the payment.",
    });
  }
}
function createSocketChannel() {
  return eventChannel((emit) => {
    const messageHandler = (message) => {
      emit(socketMessageReceived(message));
    };

    const messageSeenHandler = (message) => {
      emit(messageSeenReceived(message));
    };
    const paymentHandler = (error) => {
      emit(paymentReceived(error));
    };
    const errorHandler = (error) => {
      emit(socketErrorReceived(error));
    };
    const paymentUpdatedHandler = (error) => {
      emit(updatePaymentSuccess(error));
    };
    const messageDestroyedHandler = (payload) => {
      emit({ type: MESSAGE_DESTROYED, payload });
    };
    
    
    socket.on('privateMessageReceived', messageHandler);
    socket.on('paymentUpdated', paymentUpdatedHandler);
    socket.on('paymentConfirmed', paymentHandler);
    socket.on('messageSeen', messageSeenHandler);
    socket.on('errorMessage', errorHandler);
    socket.on('messageDestroyed', messageDestroyedHandler);

    return () => {
      socket.off('privateMessageReceived', messageHandler);
      socket.off('paymentConfirmed', paymentHandler);
      socket.off('messageSeen', messageSeenHandler);
      socket.off('errorMessage', errorHandler);
      socket.off('paymentUpdated', paymentUpdatedHandler);
      socket.off('messageDestroyed', messageDestroyedHandler);

    };
  });
}
function* watchSocketMessages() {
  const socketChannel = yield call(createSocketChannel);

  while (true) {
    const action = yield take(socketChannel);
    switch (action.type) {
      case SOCKET_ERROR_RECEIVED:
        handleSocketError(action.payload);
        break;
      case SOCKET_MESSAGE_RECEIVED:
        yield call(handleSocketMessage, action.payload);
        break;
      case PAYMENT_RECEIVED:
        yield call(handlePaymentReceived, action.payload);
        break;
      case UPDATE_PAYMENT_SUCCESS:
        yield call(handleUpdatePaymentMessage, action.payload);
        break;
      case MESSAGE_STATUS_UPDATE:
        yield put({ type: MESSAGE_STATUS_UPDATE, payload: { seenMessage: action.payload.message } });
        break;
      case MESSAGE_SEEN_RECEIVED:
        yield call(handleMessageSeen, action.payload);
        break;
      case MESSAGE_DESTROYED:
        yield put({ type: MESSAGE_DESTROYED, payload: action.payload });
        break;        
      default:
        break;
    }
  }
}
function handleSocketError(payload) {
  const { message } = payload;
  toast.error(message);
}
function* handleSocketMessage(payload) {
  const { message } = payload;
  const [selectedUser, currentUser, chats] = yield all([
    select((state) => state.chat.selectedUser),
    select((state) => state.User.user),
    select((state) => state.chat.chats)
  ]);

  if (isContactMessage(selectedUser, currentUser, message)) {
    if (window.location.pathname !== '/messages') {
      yield call(handleUnreadMessages, message, currentUser, chats);
    }else{
      yield put(addMessageSuccess(message));
    }
  } else if (isChannelMessage(selectedUser, message)) {
    yield put(addMessageSuccess(message));
    yield call(updateChatMessages, message.channelId, message, chats);
  } else {
    yield call(handleUnreadMessages, message, currentUser, chats);
  }
}
function isContactMessage(selectedUser, currentUser, message) {
  return (
    selectedUser.type === "contact" &&
    (
      (message.receiver === selectedUser.address && message.sender === currentUser.identity.address) ||
      (message.receiver === currentUser.identity.address && message.sender === selectedUser.address)
    )
  );
}
function isChannelMessage(selectedUser, message) {
  return (selectedUser.type === "channel" || selectedUser.type === "group") && message.channelId === selectedUser.id;
}
function* handleUnreadMessages(message, currentUser, chats) {
  let chatToUpdate = null;
  if (message.channelId) {
    chatToUpdate = chats.find((chat) => chat.id === message.channelId);
  } else if (message.receiver === currentUser.identity.address) {
    chatToUpdate = chats.find((chat) => chat.address === message.sender);
  }

  if (chatToUpdate) {
    const { id } = chatToUpdate;
    const unreadCount = chatToUpdate.unreadCount ? chatToUpdate.unreadCount + 1 : 1;
    yield put({ type: UPDATE_UNREAD_COUNT, payload: { id, unreadCount } });
    yield put({ type: UPDATE_LAST_MESSAGE, payload: { id, message } });
  }
}
function* updateChatMessages(channelId, message, chats) {
  const chatToUpdate = chats.find((chat) => chat.id === channelId);

  if (chatToUpdate) {
    const { id } = chatToUpdate;
    yield put({ type: UPDATE_LAST_MESSAGE, payload: { id, message } });
  }
}
function* handleMessageSeen(payload) {
  const { message: seenMessage } = payload;
  const chats = yield select((state) => state.chat.chats);
  const message = seenMessage.message;
  const chatToUpdate = chats.find((chat) => chat.address === message.sender);

  if (chatToUpdate) {
    const { id } = chatToUpdate;
    yield put({ type: UPDATE_LAST_MESSAGE, payload: { id, message } });
  }

  yield put({ type: MESSAGE_STATUS_UPDATE, payload: { seenMessage } });
}
function* handlePaymentReceived(payload) {
  const { message } = payload;
  const [selectedUser, currentUser, chats] = yield all([
    select((state) => state.chat.selectedUser),
    select((state) => state.User.user),
    select((state) => state.chat.chats)
  ]);

  if (isContactMessage(selectedUser, currentUser, message)) {
    if (window.location.pathname !== '/messages') {
      // yield call(handleUnreadMessages, message, currentUser, chats);
    }else{
      yield put(payMessageSuccess(message));
    }
  }
}
function* handleUpdatePaymentMessage(payload) {
  const { message } = payload;
  const [selectedUser, currentUser, chats] = yield all([
    select((state) => state.chat.selectedUser),
    select((state) => state.User.user),
    select((state) => state.chat.chats)
  ]);

  if (isContactMessage(selectedUser, currentUser, message)) {
    if (window.location.pathname !== '/messages') {
      // yield call(handleUnreadMessages, message, currentUser, chats);
    }else{
      yield put(updatePaymentSuccess(message));
      toast.success("Payment details updated.");
    }
  }
}
function* chatSaga() {
  yield takeEvery(UPDATE_CONTACT, updateContact);
  yield takeEvery(ADD_MEMBER_REQUEST, addChannelUser);
  yield takeEvery(GET_CHATS, onGetChats)
  // yield takeEvery(GET_GROUPS, onGetGroups)
  yield takeEvery(GET_CONTACTS, onGetContacts)
  yield takeEvery(GET_MESSAGES, onGetMessages)
  yield takeEvery(GET_CHANNEL_MESSAGES, onGetChannelMessages)
  yield takeEvery(POST_ADD_MESSAGE, onAddMessage)
  yield takeEvery(PAY_MESSAGE, onPayMessage)
  yield takeEvery(CLEAR_CHAT, clearChat)
  yield takeEvery(UPDATE_BLOCKED, onUpdateBlocked);
  yield takeEvery(UPDATE_MUTED, onUpdateMuted);
  yield takeEvery(UPDATE_NOTE, onUpdateNote);
  yield takeEvery(DELETE_CHAT, deleteChat);
  yield takeEvery(SELECT_USER, selectUser);
  yield takeEvery(REMOVE_CHANNEL_USER, removeChannelUser);
  yield takeEvery(CHANNEL_AVATAR_REQUEST, changeChannelAvatar);
  yield takeEvery(UPDATE_CHANNEL_REQUEST, updateChannel);
  yield takeEvery(MESSAGE_READ, messageRead);
  yield takeEvery(REMOVE_MEMBER, removeMember);
  yield takeEvery(GET_CHANNEL_BY_SLUG, onGetChannelBySlug);
  yield takeEvery(GET_FOLLOW_CHANNEL, onGetFollowChannel);
  yield takeEvery(UPDATE_PAYMENT_REQUEST, updatePayment);
  yield fork(watchSocketMessages); 

}

export default chatSaga
