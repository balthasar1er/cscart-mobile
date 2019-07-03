import {
  IMAGE_PICKER_CLEAR,
  IMAGE_PICKER_TOGGLE,
} from '../constants';

const initialState = {
  selected: [],
};

let selected = [];

export default function (state = initialState, action) {
  switch (action.type) {
    case IMAGE_PICKER_CLEAR:
      return {
        ...state,
        selected: [],
      };

    case IMAGE_PICKER_TOGGLE:
      selected = [
        ...state.selected,
      ];

      if (state.selected.some(item => action.payload.item === item)) {
        selected = selected.filter(item => action.payload.item !== item);
      } else {
        selected.push(
          action.payload.item,
        );
      }
      return {
        ...state,
        selected,
      };

    default:
      return state;
  }
}
