// actions.js
import { 
  CREATE_ESCROW_SUCCESS, 
  CREATE_ESCROW_FAILURE, 
  CREATE_ESCROW_REQUEST, 
  ESCROW_RECEIVED,
  UPDATE_ESCROW_FAILURE,
  ESCROW_STATUS_UPDATE_REQUEST,
  ACCEPT_TERMS_REQUEST,
  CLEAR_MESSAGE,
  ESCROW_DISPUTE_REQUEST,
  ESCROW_DISPUTE_SUCCESS,
  ESCROW_DISPUTE_FAILURE,
  ACCEPT_CANCEL,
} from './actionTypes';

export const createEscrowSuccess = (data) => ({
  type: CREATE_ESCROW_SUCCESS,
  payload: data,
});

export const createEscrowFailure = (error) => ({
  type: CREATE_ESCROW_FAILURE,
  payload: error,
});

export const createEscrowRequest = (escrowData, callback) => ({
  type: CREATE_ESCROW_REQUEST,
  payload: { escrowData, callback },
});

export const escrowReceived = (escrowData) => ({
  type: ESCROW_RECEIVED,
  payload: escrowData, 
});
export const escrowStatusUpdateRequest = (escrowId, status,file, filename, sellerWallet,recipient, callback) => ({
  type: ESCROW_STATUS_UPDATE_REQUEST,
  payload: { escrowId, status,file, filename, sellerWallet, recipient, callback },
});
export const acceptTermsRequest = (escrowId, callback) => ({
  type: ACCEPT_TERMS_REQUEST,
  payload: { escrowId,callback },
});
export const cencelRequest = (escrowId, callback) => ({
  type: ACCEPT_CANCEL,
  payload: { escrowId,callback },
});
export const clearMessage = (escrowId, callback) => ({
  type: CLEAR_MESSAGE,
  payload: { escrowId,callback },
});

export const UpdateEscrowFailure = (error) => ({
  type: UPDATE_ESCROW_FAILURE,
  payload: {error},
});
export const createDisputeRequest = (escrowId, identityId,reason, file, callback) => ({
  type: ESCROW_DISPUTE_REQUEST,
  payload: { escrowId, identityId, reason, file,callback }
});

export const createDisputeSuccess = (escrow) => ({
  type: ESCROW_DISPUTE_SUCCESS,
  payload: escrow
});

export const createDisputeFailure = (error) => ({
  type: ESCROW_DISPUTE_FAILURE,
  payload: error
});