import React from 'react';
import { Platform } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PaymentRequest, ApplePayButton } from 'react-native-payments';

import config from '../config';

import * as ordersActions from '../actions/ordersActions';
import * as cartActions from '../actions/cartActions';

class InAppPayment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.paymentRequest = null;
    this.methodData = [];
    this.details = {};
    this.options = {};
  }

  getPaymentData = (cart) => {
    const vendorNames = [];

    const methodData = [{
      supportedMethods: ['apple-pay'],
      data: {
        merchantIdentifier: config.applePayMerchantIdentifier,
        supportedNetworks: config.applePaySupportedNetworks,
        countryCode: 'US',
        currencyCode: 'USD'
      }
    }];

    const shippingOptions = [];
    const displayItems = [];
    cart.product_groups.forEach((group) => {
      vendorNames.push(group.name);

      Object.keys(group.shippings)
        .forEach((k) => {
          const shipping = group.shippings[k];
          shippingOptions.push({
            id: k,
            label: shipping.shipping,
            amount: {
              currency: 'USD',
              value: shipping.rate,
            },
            detail: shipping.delivery_time,
          });
        });

      Object.keys(group.products)
        .map(k => group.products[k])
        .forEach((p) => {
          displayItems.push({
            label: p.product,
            amount: {
              currency: 'USD',
              value: p.price,
            },
          });
        });
    });

    if (cart.discount) {
      displayItems.push({
        label: 'Discount',
        amount: {
          currency: 'USD',
          value: cart.discount,
        }
      });
    }
    if (cart.tax_subtotal) {
      displayItems.push({
        label: 'Tax',
        amount: {
          currency: 'USD',
          value: cart.tax_subtotal,
        },
      });
    }
    if (cart.subtotal) {
      displayItems.push({
        label: 'Subtotal',
        amount: {
          currency: 'USD',
          value: cart.subtotal,
        },
      });
    }

    const details = {
      id: vendorNames.join(', '),
      displayItems,
      shippingOptions,
      total: {
        label: config.applePayMerchantName,
        amount: {
          currency: 'USD',
          value: cart.total,
        },
      }
    };

    const options = {
      requestShipping: true,
    };

    return {
      methodData,
      details,
      options,
    };
  };

  initPaymentRequest = () => {
    const { cart } = this.props;
    const { methodData, details, options } = this.getPaymentData(cart);
    this.paymentRequest = new PaymentRequest(methodData, details, options);

    this.paymentRequest.addEventListener('shippingaddresschange', this.handleShippingAddressChange);
    this.paymentRequest.addEventListener('shippingoptionchange', this.handleShippingOptionChange);
  }

  handleShippingAddressChange = (event) => {
    const { cart, cartActions } = this.props;
    const { shippingAddress } = this.paymentRequest;
    const data = {
      ...cart.user_data,
      b_county: shippingAddress.country,
      s_county: shippingAddress.country,
      b_city: shippingAddress.city,
      s_city: shippingAddress.city,
      b_address: shippingAddress.addressLine,
      s_address: shippingAddress.addressLine,
      phone: shippingAddress.phone,
      s_phone: shippingAddress.phone,
      b_phone: shippingAddress.phone,
      b_zipcode: shippingAddress.postalCode,
      s_zipcode: shippingAddress.postalCode,
    };
    cartActions.getUpdatedDetailsForShippingAddress(data, (error, result) => {
      if (error) {
        this.paymentRequest.fail();
        return;
      }
      const updatedDetail = this.getPaymentData(result).details;
      event.updateWith(updatedDetail);
    });
  }

  handleShippingOptionChange = (event) => {
    const { cartActions } = this.props;
    const { shippingOption } = this.paymentRequest;
    cartActions.getUpdatedDetailsForShippingOption([shippingOption], (error, result) => {
      if (error) {
        this.paymentRequest.fail();
        return;
      }

      const updatedDetail = this.getPaymentData(result).details;
      event.updateWith(updatedDetail);
    });
  };

  handleApplePay = () => {
    this.paymentRequest.show()
      .then((paymentResponse) => {
        const { transactionIdentifier, paymentData } = paymentResponse.details;
        console.log(transactionIdentifier, paymentData, paymentResponse);
        setTimeout(() => paymentResponse.complete('success'), 400);
      }).catch((error) => {
        this.paymentRequest.abort();
        this.initPaymentRequest();
        console.log(error, 'error');
      });
  };

  handlePayPresed = () => {
    if (Platform.OS === 'ios' && config.applePay) {
      if (!this.paymentRequest) {
        this.initPaymentRequest();
        this.handleApplePay();
      }
    }
  }

  render() {
    return (
      <ApplePayButton
        buttonStyle="black"
        buttonType="buy"
        onPress={this.handlePayPresed}
      />
    );
  }
}

export default connect(
  state => ({
    cart: state.cart,
  }),
  dispatch => ({
    ordersActions: bindActionCreators(ordersActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  })
)(InAppPayment);
