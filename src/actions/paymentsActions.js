import {
  BILLING_REQUEST,
  BILLING_SUCCESS,
  BILLING_FAIL,

  SETTLEMENTS_REQUEST,
  SETTLEMENTS_SUCCESS,
  SETTLEMENTS_FAIL,

  NOTIFICATION_SHOW,
} from '../constants';

import Api from '../services/api';
import i18n from '../utils/i18n';

export function fetchAll() {
  return (dispatch) => {
    dispatch({ type: BILLING_REQUEST });
    return Api.get('/payments')
      .then((response) => {
        dispatch({
          type: BILLING_SUCCESS,
          payload: response.data,
        });
      })
      .catch((error) => {
        dispatch({
          type: BILLING_FAIL,
          error,
        });
      });
  };
}

export function settlements(data) {
  return (dispatch) => {
    dispatch({ type: SETTLEMENTS_REQUEST });
    return Api.post('/sra_settlements', data)
      .then((response) => {
        dispatch({
          type: SETTLEMENTS_SUCCESS,
          payload: response.data,
        });

        return response;
      })
      .catch((error) => {
        dispatch({
          type: NOTIFICATION_SHOW,
          payload: {
            type: 'error',
            title: i18n.gettext('Error'),
            text: i18n.gettext('Something went wrong. Please try again later.'),
          },
        });
        dispatch({
          type: SETTLEMENTS_FAIL,
          error,
        });
      });
  };
}
