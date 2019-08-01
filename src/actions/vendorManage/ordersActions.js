import {
  VENDOR_ORDERS_REQUEST,
  VENDOR_ORDERS_FAIL,
  VENDOR_ORDERS_SUCCESS,
} from '../../constants';
import * as vendorService from '../../services/vendors';

export function fetch(page = 0) {
  return async (dispatch) => {
    dispatch({
      type: VENDOR_ORDERS_REQUEST,
      payload: page,
    });
    const nextPage = page + 1;

    try {
      const result = await vendorService.getOrdersList(nextPage);
      dispatch({
        type: VENDOR_ORDERS_SUCCESS,
        payload: {
          items: result.data.orders,
          page: nextPage,
          hasMore: result.data.orders.length !== 0,
        },
      });
    } catch (error) {
      dispatch({
        type: VENDOR_ORDERS_FAIL,
        error,
      });
    }
  };
}

export function dummy(page = 0) {}
