import { combineReducers } from 'redux';

// Front
import Layout from './layout/reducer';

// Authentication Module
import Login from './auth/login/reducer';
import User from './auth/user/reducer';
import chat from "./chat/reducer";
import contact from "./contact/reducer";
import wallet from "./wallet/reducer";
import escrow from "./escrow/reducer";
import cash from "./cash/reducer";
import menu from "./menu/reducer";


const rootReducer = combineReducers({

    // public
    Layout,
    Login,
    chat,
    User,
    contact,
    wallet,
    escrow,
    cash,
    menu
});

export default rootReducer;
