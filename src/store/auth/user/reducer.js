import {
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT_SUCCESS,
  LOGOUT_FAILURE,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAILURE,
  LOGOUT_REQUEST,
  DELETE_ACCOUNT_REQUEST,
  CHECK_AUTH_REQUEST,
  CHECK_AUTH_SUCCESS,
  CHECK_AUTH_FAILURE,
  CHANGE_AVATAR_REQUEST,
  CHANGE_AVATAR_SUCCESS,
  CHANGE_AVATAR_FAILURE,
  SET_LOADING,
  GET_WORD_POOL_SUCCESS,
  UPDATE_NICKNAME_SUCCESS,
  UPDATE_NICKNAME_FAILURE,
  WALLET_SUCCESS,
  WALLET_PRIMARY,
  UPDATE_LABEL,
  ESCROW_SUCCESS,
  UPDATE_ESCROW_STATUS_SUCCESS,
  USER_WALLET_UPDATE_SUCCESS,
  WALLET_SUCCESS_JOB,
  UPDATE_USER_SETTINGS_SUCCESS
} from "./actionTypes";

const initialState = {
  user: {},
  isAuthenticated: false,
  error: null,
  isLoading: true,
  wordPool: []
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: action.payload,
        isLoading: false,
      };
    case LOGOUT_REQUEST:
    case DELETE_ACCOUNT_REQUEST:
      return {
        ...state,
        error: null,
        isLoading: true,
      };
    case LOGOUT_SUCCESS:
    case DELETE_ACCOUNT_SUCCESS:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case LOGOUT_FAILURE:
    case DELETE_ACCOUNT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case CHECK_AUTH_REQUEST:
      return { ...state, isLoading: true, error: null };
    case CHECK_AUTH_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          identity: action.payload,
        },
        isAuthenticated: true,
        isLoading: false,
      };
    case CHECK_AUTH_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        error: action.error,
      };
    case CHANGE_AVATAR_REQUEST:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case CHANGE_AVATAR_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            avatar: action.payload
          }
        },
        isLoading: false,
        error: null,
      };
    case CHANGE_AVATAR_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case GET_WORD_POOL_SUCCESS:
      return {
        ...state,
        wordPool: action.payload,
      };
    case UPDATE_NICKNAME_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            nickname: action.payload
          }
        }
      };
    case UPDATE_NICKNAME_FAILURE:
      return {
        ...state,
        error: action.payload,
      };
    case WALLET_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            wallets: [...(state.user.identity.wallets || []), action.payload],
          },
        },
      };
    case WALLET_SUCCESS_JOB:
      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            wallets: [...(state.user.identity.wallets || []), action.payload.wallet],
          },
        },
      };
    case USER_WALLET_UPDATE_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            wallets: (state.user.identity.wallets || []).map((wallet) =>
              wallet.id === action.payload.id ? { ...wallet, ...action.payload } : wallet
            ),
          },
        },
      };
    case ESCROW_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            escrows: [...(state.user.identity.escrows || []), { ...action.payload, flag: !window.location.pathname.includes('escrow') },],
          },
        },
      };
    case WALLET_PRIMARY: {
      const { walletId } = action.payload;
      const updatedWallets = state.user.identity.wallets.map(wallet =>
        wallet.walletId === walletId
          ? { ...wallet, isPrimary: !wallet.isPrimary }
          : { ...wallet, isPrimary: false }
      );

      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            wallets: updatedWallets,
          },
        },
      };
    }
    case UPDATE_LABEL: {
      const { walletId, label } = action.payload;
      const updatedWallets = state.user.identity.wallets.map(wallet => {
        if (wallet.walletId === walletId) {
          return { ...wallet, label: label };
        }
        return wallet;
      });

      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            wallets: updatedWallets,
          },
        },
      };
    }
    case UPDATE_ESCROW_STATUS_SUCCESS: {
      const { escrow, flag } = action.payload;
      const updatedEscrows = state.user.identity.escrows.map((escrowToUpdate) => {
        if (flag && escrow === null) {
          return { ...escrowToUpdate, ...escrow, flag: false, };
        } else {
          if (escrowToUpdate.id === escrow.id) {
            return {
              ...escrowToUpdate, ...escrow, flag: !window.location.pathname.includes('escrow'),
            };
          }
          return { ...escrowToUpdate, flag: !window.location.pathname.includes('escrow'), };
        }
      });

      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            escrows: updatedEscrows,
          },
        },
      };
    }
    case UPDATE_USER_SETTINGS_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          identity: {
            ...state.user.identity,
            settings: {
              ...(state.user.identity.settings || {}),
              ...action.payload,
            },
          },
        },
      };

    default:
      return state;
  }
};

export default authReducer;
