import {
  VENDOR_FETCH_PRODUCTS_REQUEST,
  VENDOR_FETCH_PRODUCTS_FAIL,
  VENDOR_FETCH_PRODUCTS_SUCCESS,

  VENDOR_FETCH_PRODUCT_REQUEST,
  VENDOR_FETCH_PRODUCT_FAIL,
  VENDOR_FETCH_PRODUCT_SUCCESS,

  VENDOR_DELETE_PRODUCT_REQUEST,
  VENDOR_DELETE_PRODUCT_FAIL,
  VENDOR_DELETE_PRODUCT_SUCCESS,

  VENDOR_UPDATE_PRODUCT_REQUEST,
  VENDOR_UPDATE_PRODUCT_FAIL,
  VENDOR_UPDATE_PRODUCT_SUCCESS,

  NOTIFICATION_SHOW,
} from '../../constants';
import * as vendorService from '../../services/vendors';
import i18n from '../../utils/i18n';

export function fetchProducts(page = 0) {
  return async (dispatch) => {
    dispatch({ type: VENDOR_FETCH_PRODUCTS_REQUEST });
    const nextPage = page + 1;

    try {
      const result = await vendorService.getProductsList(nextPage);
      dispatch({
        type: VENDOR_FETCH_PRODUCTS_SUCCESS,
        payload: {
          items: result.data.products,
          page: nextPage,
          hasMore: result.data.products.length !== 0,
        },
      });
    } catch (error) {
      dispatch({
        type: VENDOR_FETCH_PRODUCTS_FAIL,
        error,
      });
    }
  };
}

export function fetchProduct(id = 0) {
  return async (dispatch) => {
    dispatch({ type: VENDOR_FETCH_PRODUCT_REQUEST });

    try {
      const result = await vendorService.getProductDetail(id);
      dispatch({
        type: VENDOR_FETCH_PRODUCT_SUCCESS,
        payload: result.data.products,
      });
    } catch (error) {
      dispatch({
        type: VENDOR_FETCH_PRODUCT_FAIL,
        error,
      });
    }
  };
}

export function deleteProduct(id = null) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_DELETE_PRODUCT_REQUEST,
    });

    try {
      await vendorService.deleteProduct(id);
      dispatch({
        type: VENDOR_DELETE_PRODUCT_SUCCESS,
        payload: id,
      });
      dispatch({
        type: NOTIFICATION_SHOW,
        payload: {
          type: 'success',
          title: i18n.gettext('Success'),
          text: i18n.gettext('The product was deleted.'),
          closeLastModal: false,
        },
      });
    } catch (error) {
      dispatch({
        type: VENDOR_DELETE_PRODUCT_FAIL,
        error,
      });
    }
  };
}

export function updateProduct(id = null, product = {}) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_UPDATE_PRODUCT_REQUEST,
    });

    try {
      await vendorService.updateProduct(id, product);
      dispatch({
        type: VENDOR_UPDATE_PRODUCT_SUCCESS,
        payload: {
          id,
          product
        },
      });
      dispatch({
        type: NOTIFICATION_SHOW,
        payload: {
          type: 'success',
          title: i18n.gettext('Success'),
          text: i18n.gettext('The product was updated.'),
          closeLastModal: false,
        },
      });
    } catch (error) {
      dispatch({
        type: VENDOR_UPDATE_PRODUCT_FAIL,
        error,
      });
    }
  };
}
