import { call } from 'redux-saga/effects';
import { 
  LOGIN_REQUEST,
  LOGOUT_REQUEST,
  DELETE_ACCOUNT_REQUEST,
  CHECK_AUTH_REQUEST,
  CHANGE_AVATAR_REQUEST,
  CHANGE_AVATAR_SUCCESS,
  CHANGE_AVATAR_FAILURE,
  SET_LOADING,
  GET_WORD_POOL,
  GET_WORD_POOL_SUCCESS,
  UPDATE_NICKNAME,
  UPDATE_NICKNAME_SUCCESS,
  UPDATE_NICKNAME_FAILURE,
  FETCH_IDENTITY_REQUEST,
  WALLET_PRIMARY,
  UPDATE_LABEL,
  UPDATE_ESCROW_STATUS_SUCCESS,
  WALLET_SUCCESS_JOB,
  UPDATE_USER_SETTINGS_REQUEST
} from './actionTypes';

export const login = (credentials, callback) => ({
  type: LOGIN_REQUEST,
  payload: { ...credentials, callback }
});

export const logoutRequest = (history) => ({
  type: LOGOUT_REQUEST,
  payload: { history }
});

export const deleteAccountRequest = (history) => ({
  type: DELETE_ACCOUNT_REQUEST,
  payload: { history }
});
export const checkAuth = (history) => ({
  type: CHECK_AUTH_REQUEST,
  payload: { history }
});

export const changeAvatar = (avatar) => ({
  type: CHANGE_AVATAR_REQUEST,
  payload: avatar
});

export const changeAvatarSuccess = (userData) => ({
  type: CHANGE_AVATAR_SUCCESS,
  payload: userData
});

export const changeAvatarFailure = (error) => ({
  type: CHANGE_AVATAR_FAILURE,
  payload: error
});
export const setLoading = (isLoading) => ({
  type: SET_LOADING,
  payload: isLoading,
});
export const getWordPool = () => ({
  type: GET_WORD_POOL,
});
export const getWordPoolSuccess = (wordPool) => ({
  type: GET_WORD_POOL_SUCCESS,
  payload: wordPool,
});
export const updateNickname = (nickname, callback) => ({
  type: UPDATE_NICKNAME,
  payload: { nickname, callback },
});

export const updateNicknameSuccess = (nickname) => ({
  type: UPDATE_NICKNAME_SUCCESS,
  payload: nickname,
});

export const updateNicknameFailure = (error) => ({
  type: UPDATE_NICKNAME_FAILURE,
  payload: error,
});

export const fetchIdentity = (address,nickname=null,callback) => ({
  type: FETCH_IDENTITY_REQUEST,
  address,
  nickname,
  callback,
});

export const setPrimaryWallet = (walletId) => {
  return {
    type: WALLET_PRIMARY,
    payload: { walletId },
  };
};

export const updateLabel = (walletId, label) => {
  return {
    type: UPDATE_LABEL,
    payload: { walletId,label },
  };
};

export const updateEscrowStatus = (escrow, flag=false) => {
  return {
    type: UPDATE_ESCROW_STATUS_SUCCESS,
    payload: { escrow, flag },
  };
};

export const walletSuccess = (wallet) => {
  return {
    type: WALLET_SUCCESS_JOB,
    payload: {wallet},
  };
};

export const updateUserSettings = (settings, callback) => ({
  type: UPDATE_USER_SETTINGS_REQUEST,
  payload: settings,
  callback,
});
