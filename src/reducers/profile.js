import {
  FETCH_PROFILE_SUCCESS,
  AUTH_LOGOUT,
} from '../constants';

const initialState = {
  user_type: 'C'
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_PROFILE_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };

    case AUTH_LOGOUT:
      return initialState;

    default:
      return state;
  }
}
