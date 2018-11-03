import { Platform } from 'react-native';
import isDate from 'date-fns/is_date';
import format from 'date-fns/format';
import DeviceInfo from 'react-native-device-info';

import {
  AUTH_LOGIN_REQUEST,
  AUTH_LOGIN_SUCCESS,
  AUTH_LOGIN_FAIL,
  AUTH_RESET_STATE,

  AUTH_REGESTRATION_REQUEST,
  AUTH_REGESTRATION_SUCCESS,
  AUTH_REGESTRATION_FAIL,

  NOTIFICATION_SHOW,

  REGISTER_DEVICE_REQUEST,
  REGISTER_DEVICE_SUCCESS,
  REGISTER_DEVICE_FAIL,

  FETCH_PROFILE_FIELDS_REQUEST,
  FETCH_PROFILE_FIELDS_SUCCESS,
  FETCH_PROFILE_FIELDS_FAIL,

  FETCH_PROFILE_REQUEST,
  FETCH_PROFILE_SUCCESS,
  FETCH_PROFILE_FAIL,

  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,

  AUTH_LOGOUT,
} from '../constants';
import Api from '../services/api';
import i18n from '../utils/i18n';
import config from '../config';
import store from '../store';

import * as cartActions from './cartActions';
import * as layoutsActions from './layoutsActions';
import * as wishListActions from './wishListActions';

export function fetchProfile() {
  const sl = DeviceInfo.getDeviceLocale().split('-')[0];
  const params = {
    lang_code: sl,
  };

  return (dispatch) => {
    dispatch({ type: FETCH_PROFILE_REQUEST });
    return Api.get('/sra_profile', { params })
      .then((response) => {
        dispatch({
          type: FETCH_PROFILE_SUCCESS,
          payload: {
            ...response.data,
          },
        });
        return response.data;
      })
      .catch((error) => {
        dispatch({
          type: FETCH_PROFILE_FAIL,
          payload: error,
        });
      });
  };
}

export function profileFields(data = {}) {
  const sl = DeviceInfo.getDeviceLocale().split('-')[0];
  const params = {
    location: 'profile',
    action: 'add',
    lang_code: sl,
    ...data,
  };

  return (dispatch) => {
    dispatch({ type: FETCH_PROFILE_FIELDS_REQUEST });
    return Api.get('/sra_profile_fields', { params })
      .then((response) => {
        dispatch({
          type: FETCH_PROFILE_FIELDS_SUCCESS,
          payload: {
            ...data,
            ...response.data,
          },
        });
        return response.data;
      })
      .catch((error) => {
        dispatch({
          type: FETCH_PROFILE_FIELDS_FAIL,
          payload: error,
        });
      });
  };
}

export function updateProfile(id, params) {
  const data = { ...params };
  Object.keys(data).forEach((key) => {
    if (isDate(data[key])) {
      data[key] = format(data[key], 'MM/DD/YYYY');
    }
  });

  console.log(data);

  return (dispatch) => {
    dispatch({ type: UPDATE_PROFILE_REQUEST });
    return Api.put(`/sra_profile/${id}`, data)
      .then((response) => {
        dispatch({
          type: UPDATE_PROFILE_SUCCESS,
          payload: {},
        });
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'success',
            title: i18n.gettext('Profile'),
            text: i18n.gettext('The profile data has been updated successfully'),
            closeLastModal: true,
          },
        });
      })
      .then(() => cartActions.fetch(false)(dispatch))
      .catch((error) => {
        dispatch({
          type: UPDATE_PROFILE_FAIL,
          payload: error,
        });
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'warning',
            title: i18n.gettext('Profile update fail'),
            text: error.response.data.message,
            closeLastModal: false,
          },
        });
      });
  };
}

export function createProfile(params) {
  const data = { ...params };
  Object.keys(data).forEach((key) => {
    if (isDate(data[key])) {
      data[key] = format(data[key], 'MM/DD/YYYY');
    }
  });

  return (dispatch) => {
    dispatch({ type: AUTH_REGESTRATION_REQUEST });
    return Api.post('/sra_profile', data)
      .then((response) => {
        dispatch({
          type: AUTH_REGESTRATION_SUCCESS,
          payload: {
            token: response.data.auth.token,
            ttl: response.data.auth.ttl,
            profile_id: response.data.profile_id,
            user_id: response.data.user_id,
          },
        });
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'success',
            title: i18n.gettext('Registration'),
            text: i18n.gettext('Registration complete.'),
            closeLastModal: true,
          },
        });
      })
      .then(() => cartActions.fetch(false)(dispatch))
      .catch((error) => {
        dispatch({
          type: AUTH_REGESTRATION_FAIL,
          payload: error,
        });
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'warning',
            title: i18n.gettext('Registration fail'),
            text: error.response.data.message,
            closeLastModal: false,
          },
        });
      });
  };
}

export function deviceInfo(data) {
  return (dispatch) => {
    dispatch({ type: REGISTER_DEVICE_REQUEST });
    return Api.post('/sra_notifications', data)
      .then((response) => {
        dispatch({
          type: REGISTER_DEVICE_SUCCESS,
          payload: {
            ...data,
            ...response.data,
          },
        });
      })
      .catch((error) => {
        dispatch({
          type: REGISTER_DEVICE_FAIL,
          payload: error,
        });
      });
  };
}

export function login(data) {
  return (dispatch) => {
    dispatch({ type: AUTH_LOGIN_REQUEST });

    return Api.post('/auth_tokens', data)
      .then((response) => {
        cartActions.fetch(false)(dispatch);
        wishListActions.fetch(false)(dispatch);
        dispatch({
          type: AUTH_LOGIN_SUCCESS,
          payload: response.data,
        });

        // Delay send refresh token.
        setTimeout(() => {
          const { auth } = store.getState();
          deviceInfo({
            token: auth.deviceToken,
            platform: Platform.OS,
            locale: DeviceInfo.getDeviceLocale(),
            device_id: DeviceInfo.getUniqueID(),
          })(dispatch);
        }, 1000);
      })
      .then(() => layoutsActions.fetch(config.layoutId, 'index.index')(dispatch))
      .catch((error) => {
        dispatch({
          type: AUTH_LOGIN_FAIL,
          payload: error.response.data,
        });
      });
  };
}

export function registration(token) {
  return (dispatch) => {
    dispatch({
      type: AUTH_REGESTRATION_SUCCESS,
      payload: {
        token,
        ttl: null,
      }
    });
    cartActions.fetch(false)(dispatch);
    dispatch({
      type: NOTIFICATION_SHOW,
      payload: {
        type: 'success',
        title: i18n.gettext('Registration'),
        text: i18n.gettext('Registration complete.'),
        closeLastModal: true,
      },
    });
  };
}

export function logout() {
  return (dispatch) => {
    dispatch({
      type: AUTH_LOGOUT,
    });
  };
}

export function resetState() {
  return dispatch => dispatch({ type: AUTH_RESET_STATE });
}
