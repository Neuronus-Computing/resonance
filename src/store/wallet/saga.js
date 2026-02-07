import { call, put, takeLatest } from "redux-saga/effects";
import axios from "../../util/axiosConfig";
import {
  createWalletSuccess,
  createWalletFailure, 
  fetchChartDataSuccess, 
  fetchChartDataFailure,
  sendMoneySuccess,
  sendMoneyFailure,
  markAsPrimarySuccess,
  markAsPrimaryFailure,
  updateWalletLabelFailure,
  updateWalletLabelSuccess,
  fetchWalletBySlugSuccess,
  fetchWalletBySlugFailure,
 } from './actions';

import { 
  CREATE_WALLET_REQUEST,
  FETCH_CHART_DATA_REQUEST, 
  SEND_MONEY_REQUEST,
  MARK_AS_PRIMARY_REQUEST, 
  UPDATE_WALLET_LABEL_REQUEST, 
  FETCH_TRANSACTIONS_BY_DATE_RANGE_REQUEST,
  FETCH_TRANSACTIONS_BY_RECEIVER_ID_REQUEST,
  FETCH_WALLET_BY_SLUG_REQUEST,
  CREATE_WALLETS_REQUEST,
} from './actionTypes';
import {  CHANGE_PRELOADER } from "../layout/actionTypes";
import {  WALLET_SUCCESS, USER_WALLET_UPDATE_SUCCESS} from "../auth/user/actionTypes";
import {  setPrimaryWallet,updateLabel } from "../auth/user/actions";
import { toast } from "react-toastify";
function* createWallet(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.post, '/user/wallet/create', action.payload.walletData); 
    yield put(createWalletSuccess(response.data));
    if (action.payload.callback){
        action.payload.callback(true,response.data.wallet);
    }
    yield put({ type: WALLET_SUCCESS, payload: response.data.wallet });
    if(response.data.ethWallet){
      yield put({ type: WALLET_SUCCESS, payload: response.data.ethWallet });
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
    const { message }  = response.data;
    toast.success(message);
  } catch (error) {
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    action.payload.callback(false);
    yield put(createWalletFailure(error.response ? error.response.data : error.message));
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* fetchChartData(action) {
  yield put({ type: CHANGE_PRELOADER, payload: true });
  const { blockchain, days } = action.payload;
  const url = `https://api.coingecko.com/api/v3/coins/${blockchain}/market_chart?vs_currency=usd&days=${days}`;
  
  try {
    const response = yield call(fetch, url);
    if (!response.ok) throw new Error(`Unexpected response status: ${response.status}`);

    const data = yield response.json();
    const prices = data.prices.map(price => price[1]);
    const timestamps = data.prices.map(price => new Date(price[0]).toLocaleDateString());

    yield put(fetchChartDataSuccess(prices, timestamps));
    yield put({ type: CHANGE_PRELOADER, payload: false });

  } catch (error) {
    yield put(fetchChartDataFailure(error.message));
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* sendMoney(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const { amount, receiverAddress, walletId } = action.payload;
    const response = yield call(axios.post, `user/wallet/${walletId}/send-fund`, { amount, receiverAddress });
    if (response.status === 200 || response.status === 201) {
      yield put(sendMoneySuccess(response.data));
      const { message } = response.data;
      toast.success(message);
      
      if (action.payload.callback) {
        action.payload.callback(true);
      }
      yield put({ type: CHANGE_PRELOADER, payload: false });
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Unable to send money, please try again.";
    toast.error(errorMessage);
    if (action.payload.callback) {
      action.payload.callback(false);
    }    
    yield put({ type: CHANGE_PRELOADER, payload: false });
    yield put(sendMoneyFailure(error.response ? error.response.data : error.message));
  } 
}

function* markAsPrimary(action) {
  try {
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const { walletId ,callback} = action.payload;
    const response = yield call(axios.put, `/user/wallets/${walletId}/primary`);
    const { message }  = response.data;
    yield put(setPrimaryWallet(walletId));
    yield put(markAsPrimarySuccess(walletId));
    if (callback) {
      callback(false);
    }
    toast.success(message);
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    yield put({ type: CHANGE_PRELOADER, payload: false });
    yield put(markAsPrimaryFailure(error.response.data.message || 'Failed to mark wallet as primary.'));
  }
}
function* updateWalletLabel(action) {
  yield put({ type: CHANGE_PRELOADER, payload: true });
  const { walletId, label, callback } = action.payload;
  try {
    const response = yield call(axios.put, `/user/wallets/${walletId}/label`, {walletId, label});
    if(callback){
      callback();
    }
    yield put(updateLabel(walletId,response.data.wallet.label));
    yield put(updateWalletLabelSuccess(response.data.wallet));
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    yield put(updateWalletLabelFailure(error.response?.data?.message || "Error updating label"));
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* fetchWalletBySlug(action) {
  try {
    const { slug } = action.payload;
    yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.get, `/user/wallet/${slug}`);
    yield put({ type: USER_WALLET_UPDATE_SUCCESS, payload: response.data.wallet });
    if (action.payload.callback){
        action.payload.callback(response.data.wallet);
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to fetch wallet.";
    toast.error(errorMessage);
    yield put(fetchWalletBySlugFailure(errorMessage));
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* fetchTransactionsByDateRange(action) {
  const { startDate, endDate, callback } = action.payload;
  yield put({ type: CHANGE_PRELOADER, payload: true });
  try {
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    const response = yield call(axios.get, '/user/wallets/transactions', {
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    });
    if(callback){
      callback(response.data.wallets);
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}

function* fetchTransactionsByReceiverId(action) {
  const { startDate, endDate, receiverId, callback } = action.payload;
  yield put({ type: CHANGE_PRELOADER, payload: true });
  try {
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    const response = yield call(axios.get, `/user/wallets/transactions/${receiverId}`, {
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }
    });
    if(callback){
      callback(response.data.wallets);
    }
    yield put({ type: CHANGE_PRELOADER, payload: false });
  } catch (error) {
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* createWallets(action) {
  try {
    // yield put({ type: CHANGE_PRELOADER, payload: true });
    const response = yield call(axios.get, '/user/generate-wallets');
    // yield put({ type: CHANGE_PRELOADER, payload: false });
    const { message }  = response.data;
    toast.success(message);
    window.location.reload(); 
    if(action.payload.callback){
      action.payload.callback();
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "something went wrong, please try again.";
    toast.error(errorMessage);
    yield put(createWalletFailure(error.response ? error.response.data : error.message));
    if(action.payload.callback){
      action.payload.callback();
    }
    // yield put({ type: CHANGE_PRELOADER, payload: false });
  }
}
function* walletSaga() {
  yield takeLatest(CREATE_WALLET_REQUEST, createWallet);
  yield takeLatest(CREATE_WALLETS_REQUEST, createWallets);
  yield takeLatest(FETCH_CHART_DATA_REQUEST, fetchChartData);
  yield takeLatest(SEND_MONEY_REQUEST, sendMoney);
  yield takeLatest(MARK_AS_PRIMARY_REQUEST, markAsPrimary);
  yield takeLatest(UPDATE_WALLET_LABEL_REQUEST, updateWalletLabel);
  yield takeLatest(FETCH_TRANSACTIONS_BY_DATE_RANGE_REQUEST, fetchTransactionsByDateRange);
  yield takeLatest(FETCH_TRANSACTIONS_BY_RECEIVER_ID_REQUEST, fetchTransactionsByReceiverId);
  yield takeLatest(FETCH_WALLET_BY_SLUG_REQUEST, fetchWalletBySlug);
}
export default walletSaga;
