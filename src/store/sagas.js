import { all } from 'redux-saga/effects'

//public
import loginSaga from './auth/login/saga';
import userSaga from './auth/user/saga';
import LayoutSaga from './layout/saga';
import chatSaga from "./chat/saga";
import contactSaga from "./contact/saga";
import walletSaga from "./wallet/saga";
import escrowSaga from "./escrow/saga";
import cashSaga from "./cash/saga";
import menuSaga from "./menu/saga";

export default function* rootSaga() {
    yield all([

        //public
        loginSaga(),
        LayoutSaga(),
        chatSaga(),
        userSaga(),
        contactSaga(),
        walletSaga(),
        escrowSaga(),
        cashSaga(),
        menuSaga(),
    ])
}
