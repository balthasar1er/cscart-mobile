import {
  FETCH_DISCUSSION_REQUEST,
  FETCH_DISCUSSION_SUCCESS,
  FETCH_DISCUSSION_FAIL,
} from '../constants';

const initialState = {
  empty: true,
  average_rating: 0,
  posts: [],
  search: {
    page: 1,
    total_items: 0,
  }
};

let newState = null;

export default function (state = initialState, action) {
  switch (action.type) {
    case FETCH_DISCUSSION_REQUEST:
      return {
        ...state,
        empty: true,
      };

    case FETCH_DISCUSSION_SUCCESS:
      newState = action.payload.discussion;
      if (action.payload.page !== 1) {
        newState = {
          ...state,
          ...action.payload.discussion,
          posts: [
            ...state.posts,
            ...action.payload.discussion.posts,
          ],
        };
      }
      return {
        ...state,
        ...newState,
        empty: action.payload.discussion.average_rating == '',
      };

    case FETCH_DISCUSSION_FAIL:
      return {
        ...state,
        empty: true,
      };

    default:
      return state;
  }
}