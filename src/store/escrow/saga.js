import { call, put, takeLatest, fork, select, take } from "redux-saga/effects";
import axios from "../../util/axiosConfig";
import { createEscrowSuccess, createEscrowFailure } from './actions';
import { 
  CREATE_ESCROW_REQUEST, 
  ESCROW_RECEIVED,
  ESCROW_STATUS_UPDATE,
  ESCROW_STATUS_UPDATE_REQUEST,
  UPDATE_ESCROW_FAILURE,
  ACCEPT_TERMS_REQUEST,
  ACCEPTED_TERMS,
  CLEARED_MESSAGE,
  CLEAR_MESSAGE,
  ESCROW_DISPUTE_REQUEST,
  ESCROW_DISPUTE_SUCCESS,
  ESCROW_DISPUTE_FAILURE,
  ACCEPT_CANCEL,
  ACCEPTED_CANCEL
} from './actionTypes';
import { CHANGE_PRELOADER } from "../layout/actionTypes";
import { toast } from "react-toastify";
import { ESCROW_SUCCESS,UPDATE_ESCROW_STATUS_SUCCESS } from "../auth/user/actionTypes";
import socket from '../../util/socket';
import { eventChannel } from 'redux-saga';
import { createDisputeSuccess, createDisputeFailure } from './actions';

function* createEscrow(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const formData = new FormData();
    for (const key in action.payload.escrowData) {
      formData.append(key, action.payload.escrowData[key]);
    }
    const response = yield call(axios.post, '/user/escrow/create', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    yield put(createEscrowSuccess(response.data));
    yield put({ type: ESCROW_SUCCESS, payload: response.data.escrow });
    toast.success(response.data.message);
    socket.emit('escrow', { escrow: response.data.escrow });

    if (action.payload.callback) {
      setTimeout(() => {
        action.payload.callback(response.data.escrow);
      }, 300);
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Something went wrong, please try again.";
    yield put(createEscrowFailure(errorMessage));
    toast.error(errorMessage);
    if (action.payload.callback) {
      action.payload.callback(false);
    }
  } finally {
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* emitEscrowStatusUpdate(action) {
  const { escrowId, status, file, filename, sellerWallet, recipient } = action.payload;
  const formData = new FormData();
  formData.append('escrowId', escrowId);
  formData.append('status', status);
  formData.append('filename', filename);
  formData.append('sellerWallet', sellerWallet);
  formData.append('attachment', file);
  formData.append('recipient', recipient);
  yield put({ type: CHANGE_PRELOADER, payload: true });
  try {
    // socket.emit('escrowStatusUpdate', { escrowId, status, file, filename, sellerWallet });
    const response = yield call(axios.post, `/user/escrow/${escrowId}/update`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    yield put({ type: CHANGE_PRELOADER, payload: true });
    if(response.status == 201){
      const {escrow} = response.data;
      if(escrow.status != "pending"){
        socket.emit('escrowUpdated', { escrow });
        yield new Promise((resolve, reject) => {
          socket.once('escrowStatusUpdated', (updatedEscrow) => {
            resolve();
            put({ type: UPDATE_ESCROW_STATUS_SUCCESS, payload: updatedEscrow });
          });
        });  
        if (action.payload.callback) {
          setTimeout(() => {
            action.payload.callback(escrowId,true);
          }, 500);
        }
        yield put({ type: CHANGE_PRELOADER, payload: false });
      }
    }
  } 
  catch (error) {
    const message = error.response?.data?.message || "Something went wrong, please try again.";
    const escrow = error.response?.data?.escrow || {};
    if (escrow) {
      socket.emit('onError', { escrow,message});
      yield new Promise((resolve, reject) => {
        socket.once('error', (escrow,message) => {
          resolve();
          put({ type: UPDATE_ESCROW_FAILURE,  payload: {
            escrow,
            message
          },});
        });
      });
      if(escrow.status != "pending"){
        if (action.payload.callback) {
          action.payload.callback(escrow.id,false);
        }
      }
      yield put({ type: CHANGE_PRELOADER, payload: false });
    } 
  }
  
}
function* emitAcceptedTerms(action) {
  yield put({ type: CHANGE_PRELOADER, payload: true });
  const { escrowId} = action.payload;
  try {
    socket.emit('escrowAcceptTerms', { escrowId});
    if (action.payload.callback) {
      setTimeout(() => {
        action.payload.callback(escrowId);
      }, 500);
    }
    yield new Promise((resolve, reject) => {
      socket.once('escrowAcceptedTerms', (updatedEscrow) => {
        resolve();
        put({ type: ACCEPTED_TERMS, payload: updatedEscrow });
      });
    });
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    toast.error('Error while updating escrow status.');
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* emitCancel(action) {
  const { escrowId} = action.payload;
  try {
    socket.emit('acceptCancel', { escrowId});
    if (action.payload.callback) {
      setTimeout(() => {
        action.payload.callback(escrowId);
      }, 500);
    }
    yield new Promise((resolve, reject) => {
      socket.once('acceptedCancel', (updatedEscrow) => {
        resolve();
        put({ type:ACCEPTED_CANCEL, payload: updatedEscrow });
      });
    });
  } catch (error) {
    toast.error('Error while updating escrow status.');
  }
}
function* clearMessage(action) {
  yield put({ type: CHANGE_PRELOADER, payload: true });
  const { escrowId} = action.payload;
  try {
    socket.emit('clearMessage',{ escrowId});
    if (action.payload.callback) {
      setTimeout(() => {
        action.payload.callback(escrowId);
      }, 500);
    }
    yield new Promise((resolve, reject) => {
      socket.once('clearedMessage', (updatedEscrow) => {
        resolve();
        put({ type: CLEARED_MESSAGE, payload: updatedEscrow });
      });
    });
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    toast.error('Error while updating escrow status.');
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* createDisputeSaga(action) {
  const { escrowId, reason, file,identityId } = action.payload;
  yield put({ type: CHANGE_PRELOADER, payload: true });
  const formData = new FormData();
  formData.append('reason', reason);
  formData.append('attachment', file); 
  formData.append('identityId', identityId); 
  try {
    const response = yield call(axios.post, `/user/escrow/${escrowId}/dispute`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
     const {escrow} = response.data;
     socket.emit('disputed', { escrow });
     yield new Promise((resolve, reject) => {
      socket.once('escrowStatusUpdated', (updatedEscrow) => {
        resolve();
        put({ type: UPDATE_ESCROW_STATUS_SUCCESS, payload: updatedEscrow });
      });
    });
    if (action.payload.callback) {
      setTimeout(() => {
        action.payload.callback(escrowId);
      }, 500);
    }
    toast.success(response.data.message);
    yield put(createDisputeSuccess(response.data.escrow));
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const errorMessage = error.response?.data?.message || "Something went wrong, please try again.";
    yield put(createDisputeFailure(errorMessage));
    toast.error(errorMessage);
  }
}
function createSocketEscrow() {
  return eventChannel((emit) => {
    const escrowHandler = (escrowData) => {
      emit({ type: ESCROW_RECEIVED, payload: escrowData });
    };
    const escrowStatusUpdatedHandler = (escrow) => {
      emit({ type: ESCROW_STATUS_UPDATE, payload: escrow });
    };
    const handleTermsAccepted = (escrow) => {
      emit({ type: ACCEPTED_TERMS, payload: escrow });
    };
    const handleCancelled = (escrow) => {
      emit({ type: ACCEPTED_CANCEL, payload: escrow });
    };
    const handleClearMessage = (escrow) => {
      emit({ type: CLEARED_MESSAGE, payload: escrow });
    };
    const errorHandler = (escrow,error) => {
      emit({ type: UPDATE_ESCROW_FAILURE, payload: {escrow,error} });
    };
    socket.on('escrowCreated', escrowHandler);
    socket.on('escrowStatusUpdated', escrowStatusUpdatedHandler);
    socket.on('error', errorHandler);
    socket.on('termsAccepted', handleTermsAccepted);
    socket.on('cancelAccepted', handleCancelled);
    socket.on('clearedMessage', handleClearMessage);
    return () => {
      socket.off('escrowCreated', escrowHandler);
      socket.off('escrowStatusUpdated', escrowStatusUpdatedHandler);
      socket.off('termsAccepted', handleTermsAccepted);
      socket.off('clearedMessage', handleClearMessage);
      socket.off('cancelAccepted', handleCancelled);
    };
  });
}

function* watchEscrowEvent() {
  const escrowChannel = yield call(createSocketEscrow);
  while (true) {
    const action = yield take(escrowChannel);
    const user = yield select((state) => state.User.user); 
    if (action.type === ESCROW_RECEIVED) {      
      const { escrow } = action.payload;
      if (user && escrow.sellerIdentity === user.identity.address) {
        yield put({ type: ESCROW_SUCCESS, payload: escrow });
        toast.success('New escrow request received.');
      }
    }
    if (action.type === ESCROW_STATUS_UPDATE ) {
        const { escrow } = action.payload;
        if (escrow.sellerIdentity === user.identity.address || escrow.buyerIdentity === user.identity.address || user.identity.type ==="admin"){
          const updatedEscrow = {escrow}; 
          toast.success(`Escrow ${escrow.status}.`);
          yield put({ type: UPDATE_ESCROW_STATUS_SUCCESS, payload: updatedEscrow });        
        }
    }
    if (action.type === ACCEPTED_TERMS ) {
      const { escrow } = action.payload;
      if (escrow.sellerIdentity === user.identity.address){
        const updatedEscrow = {escrow}; 
        toast.success(`You accepted escrow terms and conditions.`);
        yield put({ type: UPDATE_ESCROW_STATUS_SUCCESS, payload: updatedEscrow });        
      }
    }
    if (action.type === ACCEPTED_CANCEL ) {
      const { escrow } = action.payload;
      if (escrow.buyerIdentity === user.identity.address){
        const updatedEscrow = {escrow}; 
        // toast.success(`You accepted escrow terms and conditions.`);
        yield put({ type: UPDATE_ESCROW_STATUS_SUCCESS, payload: updatedEscrow });        
      }
    }
    if (action.type === CLEARED_MESSAGE ) {
      const { escrow } = action.payload;
      if (escrow.buyerIdentity === user.identity.address){
        const updatedEscrow = {escrow}; 
        yield put({ type: UPDATE_ESCROW_STATUS_SUCCESS, payload: updatedEscrow });        
      }
    }
    if (action.type === UPDATE_ESCROW_FAILURE ) {
      const { escrow,error } = action.payload;
      if (escrow.sellerIdentity === user.identity.address || escrow.buyerIdentity === user.identity.address){
        const updatedEscrow = {escrow}; 
        yield put({ type: UPDATE_ESCROW_STATUS_SUCCESS, payload: updatedEscrow });   
        toast.error(error);
      }
    }
  }

}

function* escrowSaga() {
  yield takeLatest(CREATE_ESCROW_REQUEST, createEscrow);
  yield takeLatest(ESCROW_STATUS_UPDATE_REQUEST, emitEscrowStatusUpdate);
  yield takeLatest(ACCEPT_TERMS_REQUEST, emitAcceptedTerms);
  yield takeLatest(ACCEPT_CANCEL, emitCancel);
  yield takeLatest(CLEAR_MESSAGE, clearMessage);
  yield takeLatest(ESCROW_DISPUTE_REQUEST, createDisputeSaga);
  yield fork(watchEscrowEvent); 
}

export default escrowSaga;
