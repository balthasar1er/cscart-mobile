import {
  VENDOR_CATEGORIES_TOGGLE,
  VENDOR_CATEGORIES_CLEAR,
} from '../../constants';

const initialState = {
  selected: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case VENDOR_CATEGORIES_CLEAR:
      return {
        ...state,
        selected: [],
      };

    case VENDOR_CATEGORIES_TOGGLE:
      return {
        ...state,
        selected: [1],
      };

    default:
      return state;
  }
}
