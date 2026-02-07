// reducer.js
import {
    CREATE_WALLET_REQUEST,
    CREATE_WALLET_SUCCESS,
    CREATE_WALLET_FAILURE,
    FETCH_CHART_DATA_SUCCESS, 
    FETCH_CHART_DATA_FAILURE,
    UPDATE_WALLET_LABEL_REQUEST,
    UPDATE_WALLET_LABEL_SUCCESS,
    UPDATE_WALLET_LABEL_FAILURE,
  } from './actionTypes';
  
  const initialState = {
    loading: false,
    wallet: null,
    error: null,
    series: [],
    options: {
        xaxis: {
            categories: []
        }
    },
  };
  
  const walletReducer = (state = initialState, action) => {
    switch (action.type) {
      case CREATE_WALLET_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case CREATE_WALLET_SUCCESS:
        return {
          ...state,
          loading: false,
          wallet: action.payload,
        };
      case CREATE_WALLET_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      case FETCH_CHART_DATA_SUCCESS:
          return {
              ...state,
              series: [{ name: "Price", data: action.payload.prices }],
              options: { ...state.options, xaxis: { categories: action.payload.timestamps } },
              error: null
          };
      case FETCH_CHART_DATA_FAILURE:
        return {
            ...state,
            error: action.payload
        };
      case UPDATE_WALLET_LABEL_REQUEST:
        return {
          ...state,
          loading: true,
          error: null,
        };
      case UPDATE_WALLET_LABEL_SUCCESS:
        return {
          ...state,
          loading: false,
          wallets: state.wallets.map((wallet) =>
            wallet.walletId === action.payload.walletId ? action.payload : wallet
          ),
        };
      case UPDATE_WALLET_LABEL_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default walletReducer;
  