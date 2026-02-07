// actions.js
import {
  CREATE_WALLET_REQUEST,
  CREATE_WALLET_SUCCESS,
  CREATE_WALLET_FAILURE,
  FETCH_CHART_DATA_REQUEST,
  FETCH_CHART_DATA_SUCCESS,
  FETCH_CHART_DATA_FAILURE,
  SEND_MONEY_REQUEST,
  SEND_MONEY_SUCCESS,
  SEND_MONEY_FAILURE,
  MARK_AS_PRIMARY_REQUEST,
  MARK_AS_PRIMARY_SUCCESS,
  MARK_AS_PRIMARY_FAILURE,
  UPDATE_WALLET_LABEL_REQUEST,
  UPDATE_WALLET_LABEL_SUCCESS,
  UPDATE_WALLET_LABEL_FAILURE,
  FETCH_TRANSACTIONS_BY_DATE_RANGE_REQUEST,
  FETCH_TRANSACTIONS_BY_RECEIVER_ID_REQUEST,
  FETCH_WALLET_BY_SLUG_FAILURE,
  FETCH_WALLET_BY_SLUG_SUCCESS,
  FETCH_WALLET_BY_SLUG_REQUEST,
  CREATE_WALLETS_REQUEST
} from "./actionTypes";

export const createWalletRequest = (walletData, callback) => ({
  type: CREATE_WALLET_REQUEST,
  payload: { walletData, callback },
});

export const createWalletSuccess = (wallet) => ({
  type: CREATE_WALLET_SUCCESS,
  payload: wallet,
});

export const createWalletFailure = (error) => ({
  type: CREATE_WALLET_FAILURE,
  payload: error,
});

export const fetchChartDataRequest = (blockchain, days) => ({
  type: FETCH_CHART_DATA_REQUEST,
  payload: { blockchain, days },
});

export const fetchChartDataSuccess = (prices, timestamps) => ({
  type: FETCH_CHART_DATA_SUCCESS,
  payload: { prices, timestamps },
});

export const fetchChartDataFailure = (error) => ({
  type: FETCH_CHART_DATA_FAILURE,
  payload: error,
});
export const sendMoneyRequest = (amount, receiverAddress , walletId,callback) => ({
  type: SEND_MONEY_REQUEST,
  payload:{amount, receiverAddress , walletId, callback},
});

export const sendMoneySuccess = (response) => ({
  type: SEND_MONEY_SUCCESS,
  response,
});

export const sendMoneyFailure = (error) => ({
  type: SEND_MONEY_FAILURE,
  error,
});

export const markAsPrimaryRequest = (walletId, callback) => ({
  type: MARK_AS_PRIMARY_REQUEST,
  payload: {walletId, callback},
});

export const markAsPrimarySuccess = (walletId) => ({
  type: MARK_AS_PRIMARY_SUCCESS,
  payload: walletId,
});

export const markAsPrimaryFailure = (error) => ({
  type: MARK_AS_PRIMARY_FAILURE,
  payload: error,
});

export const updateWalletLabelRequest = (walletId, label,callback) => ({
  type: UPDATE_WALLET_LABEL_REQUEST,
  payload: { walletId, label, callback},
});


export const updateWalletLabelSuccess = (wallet) => ({
  type: UPDATE_WALLET_LABEL_SUCCESS,
  payload: wallet,
});

export const updateWalletLabelFailure = (error) => ({
  type: UPDATE_WALLET_LABEL_FAILURE,
  payload: error,
});

export const fetchTransactionsByDateRange = (startDate, endDate,callback) => ({
  type: FETCH_TRANSACTIONS_BY_DATE_RANGE_REQUEST,
  payload: { startDate, endDate ,callback}
});

export const fetchTransactionsByReceiverId = (startDate, endDate, receiverId, callback) => ({
  type: FETCH_TRANSACTIONS_BY_RECEIVER_ID_REQUEST,
  payload: { startDate, endDate , receiverId, callback}
});
export const fetchWalletBySlugRequest = (slug,callback) => ({
  type: FETCH_WALLET_BY_SLUG_REQUEST,
  payload: { slug,callback },
});

export const fetchWalletBySlugSuccess = (wallet) => ({
  type: FETCH_WALLET_BY_SLUG_SUCCESS,
  payload: wallet,
});

export const fetchWalletBySlugFailure = (error) => ({
  type: FETCH_WALLET_BY_SLUG_FAILURE,
  payload: error,
});

export const createWalletsRequest = (callback) => ({
  type: CREATE_WALLETS_REQUEST,
  payload: { callback},
});
