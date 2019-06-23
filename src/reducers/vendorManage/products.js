import {
  VENDOR_FETCH_PRODUCTS_REQUEST,
  VENDOR_FETCH_PRODUCTS_FAIL,
  VENDOR_FETCH_PRODUCTS_SUCCESS,

  VENDOR_DELETE_PRODUCT_SUCCESS,

  VENDOR_UPDATE_PRODUCT_REQUEST,
  VENDOR_UPDATE_PRODUCT_FAIL,
  VENDOR_UPDATE_PRODUCT_SUCCESS,
} from '../../constants';

const initialState = {
  items: [],
  loading: true,
  hasMore: true,
  page: 1,
  current: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case VENDOR_FETCH_PRODUCTS_REQUEST:
      return {
        ...state,
      };

    case VENDOR_FETCH_PRODUCTS_FAIL:
      return {
        ...state,
        loading: false,
        ...action.payload,
      };

    case VENDOR_FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        hasMore: action.payload.hasMore,
        page: action.payload.page,
        items: [
          ...state.items,
          ...action.payload.items,
        ],
      };

    case VENDOR_DELETE_PRODUCT_SUCCESS:
      return {
        ...state,
        items: state.items.filter(item => item.product_id !== action.payload),
      };

    case VENDOR_UPDATE_PRODUCT_REQUEST:
    case VENDOR_UPDATE_PRODUCT_FAIL:
      return {
        ...state,
      };

    case VENDOR_UPDATE_PRODUCT_SUCCESS:
      return {
        ...state,
        current: action.payload,
      };

    default:
      return state;
  }
}
