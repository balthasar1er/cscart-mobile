import {
  VENDOR_FETCH_PRODUCTS_REQUEST,
  VENDOR_FETCH_PRODUCTS_FAIL,
  VENDOR_FETCH_PRODUCTS_SUCCESS,

  VENDOR_FETCH_PRODUCT_REQUEST,
  VENDOR_FETCH_PRODUCT_FAIL,
  VENDOR_FETCH_PRODUCT_SUCCESS,

  VENDOR_DELETE_PRODUCT_SUCCESS,

  VENDOR_UPDATE_PRODUCT_REQUEST,
  VENDOR_UPDATE_PRODUCT_FAIL,
  VENDOR_UPDATE_PRODUCT_SUCCESS,

  VENDOR_PRODUCT_CHANGE_CATEGORY,
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
    case VENDOR_FETCH_PRODUCTS_REQUEST:
      return {
        ...state,
        items: action.payload === 0 ? [] : state.items,
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
        items: [...state.items, ...action.payload.items],
      };

    case VENDOR_DELETE_PRODUCT_SUCCESS:
      return {
        ...state,
        items: state.items.filter(item => item.product_id !== action.payload),
      };

    case VENDOR_UPDATE_PRODUCT_FAIL:
      return {
        ...state,
        loadingCurrent: false,
      };

    case VENDOR_UPDATE_PRODUCT_REQUEST:
      return {
        ...state,
        current: {
          ...state.current,
          ...action.payload.product,
        },
      };

    case VENDOR_UPDATE_PRODUCT_SUCCESS:
      return {
        ...state,
        current: {
          ...state.current,
          ...action.payload.product,
        },
      };

    case VENDOR_FETCH_PRODUCT_REQUEST:
      return {
        ...state,
        loadingCurrent: true,
      };

    case VENDOR_FETCH_PRODUCT_SUCCESS:
      return {
        ...state,
        current: action.payload,
        loadingCurrent: false,
      };

    case VENDOR_FETCH_PRODUCT_FAIL:
      return {
        ...state,
        loadingCurrent: true,
      };

    case VENDOR_PRODUCT_CHANGE_CATEGORY:
      return {
        ...state,
        current: {
          ...state.current,
          categories: action.payload,
        }
      };

    default:
      return state;
  }
}
