import {
  VENDOR_ORDERS_REQUEST,
  VENDOR_ORDERS_FAIL,
  VENDOR_ORDERS_SUCCESS,

  VENDOR_ORDER_REQUEST,
  VENDOR_ORDER_FAIL,
  VENDOR_ORDER_SUCCESS,

} from '../../constants';

const initialState = {
  items: [],
  loading: true,
  hasMore: true,
  page: 0,
  loadingCurrent: true,
  current: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case VENDOR_ORDERS_REQUEST:
      return {
        ...state,
        items: action.payload === 0 ? [] : state.items,
      };

    case VENDOR_ORDERS_FAIL:
      return {
        ...state,
        loading: false,
        ...action.payload,
      };

    case VENDOR_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        hasMore: action.payload.hasMore,
        page: action.payload.page,
        items: [...state.items, ...action.payload.items],
      };

    case VENDOR_ORDER_REQUEST:
      return {
        ...state,
        loadingCurrent: true,
      };

    case VENDOR_ORDER_SUCCESS:
      return {
        ...state,
        loadingCurrent: false,
        current: action.payload,
      };

    case VENDOR_ORDER_FAIL:
      return {
        ...state,
        loadingCurrent: false,
      };

    default:
      return state;
  }
}
