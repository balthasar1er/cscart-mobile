import {
  IMAGE_PICKER_TOGGLE,
  IMAGE_PICKER_CLEAR,
} from '../constants';

export function clear() {
  return async (dispatch) => {
    dispatch({
      type: IMAGE_PICKER_CLEAR,
    });
  };
}

export function toggle(images) {
  return async (dispatch) => {
    dispatch({
      type: IMAGE_PICKER_TOGGLE,
      payload: images,
    });
  };
}
