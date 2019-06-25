import {
  FETCH_PROFILE_SUCCESS,
} from '../constants';

const initialState = {
  user_type: 'A'
};

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_PROFILE_SUCCESS:
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}
