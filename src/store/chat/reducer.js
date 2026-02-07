import {
  GET_GROUPS_SUCCESS,
  GET_CHATS_SUCCESS,
  GET_GROUPS_FAIL,
  GET_CHATS_FAIL,
  GET_CONTACTS_SUCCESS,
  GET_CONTACTS_FAIL,
  GET_MESSAGES_SUCCESS,
  GET_MESSAGES_FAIL,
  GET_CHANNEL_MESSAGES_SUCCESS,
  GET_CHANNEL_MESSAGES_FAIL,
  POST_ADD_MESSAGE_SUCCESS,
  POST_ADD_MESSAGE_FAIL,
  UPDATE_BLOCKED_SUCCESS,
  UPDATE_MUTED_SUCCESS,
  UPDATE_NOTE_SUCCESS,
  DELETE_CHAT_SUCCESS,
  DELETE_CHAT_FAILURE,
  UPDATE_CONTACT_SUCCESS,
  SET_SELECTED_USER,
  GET_CONTACTS,
  MESSAGE_READ_SUCCESS,
  MESSAGE_SEEN_RECEIVED,
  SOCKET_ERROR_RECEIVED,
  ADD_MEMBER_REQUEST,
  ADD_MEMBER_SUCCESS,
  ADD_MEMBER_FAIL,
  REMOVE_CHANNEL_USER,
  CHANNEL_AVATAR_SUCCESS,
  UPDATE_CHANNEL_SUCCESS,
  MESSAGE_STATUS_UPDATE,
  UPDATE_UNREAD_COUNT,
  UPDATE_LAST_MESSAGE,
  PAY_MESSAGE_SUCCESS,
  PAY_MESSAGE_FAIL,
  UPDATE_PAYMENT_SUCCESS,
  MESSAGE_DESTROYED
} from "./actionTypes";

const INIT_STATE = {
  chats: [],
  groups: [],
  contacts: [],
  messages: [],
  error: {},
  selectedUser: {},
  searchQuery: "",
  members: [],
};

const Calendar = (state = INIT_STATE, action) => {
  switch (action.type) {
    case GET_CHATS_SUCCESS:
      return {
        ...state,
        chats: action.payload,
      };

    case GET_CHATS_FAIL:
      return {
        ...state,
        error: action.payload,
      };
    case GET_CONTACTS:
      return {
        ...state,
        searchQuery: action.payload.searchQuery || "",
      };
    case GET_GROUPS_SUCCESS:
      return {
        ...state,
        groups: action.payload,
      };

    case GET_GROUPS_FAIL:
      return {
        ...state,
        error: action.payload,
      };

    case GET_CONTACTS_SUCCESS:
      return {
        ...state,
        contacts: action.payload,
      };

    case GET_CONTACTS_FAIL:
      return {
        ...state,
        error: action.payload,
      };

    case GET_MESSAGES_SUCCESS:
      return {
        ...state,
        messages: action.payload,
      };

    case GET_MESSAGES_FAIL:
      return {
        ...state,
        error: action.payload,
      };
      case GET_CHANNEL_MESSAGES_SUCCESS:
      return {
        ...state,
        messages: action.payload,
      };

    case GET_CHANNEL_MESSAGES_FAIL:
      return {
        ...state,
        error: action.payload,
      };
    case POST_ADD_MESSAGE_SUCCESS:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case POST_ADD_MESSAGE_FAIL:
      return {
        ...state,
        error: action.payload,
      };
    case UPDATE_BLOCKED_SUCCESS:
      return {
        ...state,
        contacts: state.contacts.map((contact) =>
          contact.id === action.payload.id
            ? { ...contact, blocked: action.payload.blocked }
            : contact
        ),
        loading: false,
      };
    case UPDATE_CONTACT_SUCCESS:
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.id
            ? {
                ...chat,
                ...(action.payload.name !== undefined && {
                  name: action.payload.name,
                }),
                ...(action.payload.note !== undefined && {
                  note: action.payload.note,
                }),
                ...(action.payload.muted !== undefined && {
                  muted: action.payload.muted,
                }),
                ...(action.payload.blocked !== undefined && {
                  blocked: action.payload.blocked,
                }),
                ...(action.payload.status !== undefined && {
                  state: action.payload.status,
                }),
              }
            : chat
        ),
        loading: false,
      };
    case UPDATE_LAST_MESSAGE:
      return {
        ...state,
        chats: state.chats.map((chat) =>
          chat.id === action.payload.id
            ? {
                ...chat,
                message: action.payload.message, 
                lastMessageTimestamp:action.payload.message.timestamp,
              }
            : chat
        ),
        loading: false,
      };      
    case UPDATE_MUTED_SUCCESS:
      return {
        ...state,
        contacts: state.contacts.map((contact) =>
          contact.id === action.payload.id
            ? { ...contact, muted: action.payload.muted }
            : contact
        ),
        loading: false,
      };
    case UPDATE_NOTE_SUCCESS:
      return {
        ...state,
        contacts: state.contacts.map((contact) =>
          contact.id === action.payload.id
            ? { ...contact, note: action.payload.note }
            : contact
        ),
        loading: false,
      };
    case DELETE_CHAT_SUCCESS:
      return {
        ...state,
        chats: state.chats.filter(
          (chat) => chat.id !== action.payload.id
        ),
        loading: false,
      };

    case DELETE_CHAT_FAILURE:
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };
    case SET_SELECTED_USER:
      return {
        ...state,
        selectedUser: action.payload,
      };
    case SOCKET_ERROR_RECEIVED:
      return {
        ...state,
        error: action.payload,
      };

    case MESSAGE_READ_SUCCESS:
    case MESSAGE_SEEN_RECEIVED:
      return {
        ...state,
        messages: state.messages.map((message) => {
          return message.id === action.payload.message.id
            ? { ...message, status: action.payload.message.status }
            : message;
        }),
      };
    case ADD_MEMBER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ADD_MEMBER_SUCCESS:
      return {
        ...state,
        loading: false,
        members: [...state.members, ...action.payload.members], 
      };
    case ADD_MEMBER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.error,
      };
    case REMOVE_CHANNEL_USER:
      return {
        ...state,
        loading: true,
        error: null,
      };
      case CHANNEL_AVATAR_SUCCESS:
        return {
          ...state,
          chats: state.chats.map(chat =>
            chat.id === action.payload.id
              ? { ...chat, avatar: action.payload.avatar }
              : chat
          ),
          error: null,
        };
      case UPDATE_CHANNEL_SUCCESS:
        return {
          ...state,
          chats: state.chats.map(chat =>
            chat.id === action.payload.id
              ? { ...chat, name: action.payload.name, description: action.payload.description}
              : chat
          ),
          error: null,
        };
        case MESSAGE_STATUS_UPDATE:
          const { seenMessage } = action.payload;
          return {
            ...state,
            messages: state.messages.map(message =>
              message.id === seenMessage.message.id ? { ...message, status: seenMessage.message.status } : message
            ),
          };
          case UPDATE_UNREAD_COUNT: {
            const { id, unreadCount } = action.payload;
            const updatedChats = state.chats.map((chat) =>
              chat.id === id ? { ...chat, unreadCount } : chat
            );
            return {
              ...state,
              chats: updatedChats,
            };
          };
          case PAY_MESSAGE_SUCCESS:
            return {
              ...state,
              messages: state.messages.map((message) =>
                message.id === action.payload.id ? action.payload : message
              ),
            };
          case UPDATE_PAYMENT_SUCCESS:
            return {
              ...state,
              messages: state.messages.map((message) =>
                message.id === action.payload.id ? action.payload : message
              ),
            };
        case MESSAGE_DESTROYED: {
          const { id, content, isDestroyed } = action.payload;
          return {
            ...state,
            messages: state.messages.map((m) =>
              m.id === id
                ? {
                    ...m,
                    content,
                    isDestroyed,
                    fileUrl: null,
                    fileName: null,
                    fileType: null,
                    fileExtension: null,
                    fileSize: null,
                  }
                : m
            ),
          };
        };            
        default:
          return state;
        }
};

export default Calendar;
