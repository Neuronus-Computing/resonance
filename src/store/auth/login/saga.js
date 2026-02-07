import { takeEvery, fork, put, all } from 'redux-saga/effects';

// Login Redux States
import { CHECK_LOGIN, LOGOUT_USER } from './actionTypes';
import { apiError} from './actions';

function* logoutUser({ payload: { history } }) {
    try {
        localStorage.removeItem("authUser");
        history('/login');
    } catch (error) {
        yield put(apiError(error));
    }
}


export function* watchUserLogout() {
    yield takeEvery(LOGOUT_USER, logoutUser);
}

function* loginSaga() {
    yield all([
        fork(watchUserLogout),
    ]);
}

export default loginSaga;