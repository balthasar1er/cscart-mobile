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

  componentDidMount() {
    if (Platform.OS === 'ios' && config.applePay) {
      this.initPayment();
    }
  }

  componentWillUnmount() {
    // this.paymentRequest.removeEventListener('shippingaddresschange', this.handleShippingAddressChange);
    // this.paymentRequest.removeEventListener('shippingoptionchange', this.handleShippingOptionChange);
  }

  initPayment = () => {
    const { cart } = this.props;
    const vendorNames = [];

    this.methodData = [{
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

    this.details = {
      id: vendorNames.join(', '),
      displayItems,
      shippingOptions,
      total: {
        label: config.applePayMerchantName,
        amount: {
          currency: 'USD',
          value: 14
        },
      }
    };

    this.options = {
      requestShipping: true,
    };

    this.paymentRequest = new PaymentRequest(this.methodData, this.details, this.options);

    this.paymentRequest.addEventListener('shippingaddresschange', this.handleShippingAddressChange);
    this.paymentRequest.addEventListener('shippingoptionchange', this.handleShippingOptionChange);
  };

  handleShippingAddressChange = (event) => {
    const { cartActions, cart } = this.props;
    
    cartActions.saveUserData({
      ...cart.user_data,
    });

    // event.updateWith(this.details);
  }

  handleShippingOptionChange = (event) => {
    console.log(event, 'handleShippingOptionChange', this.paymentRequest.shippingOption);
    // event.updateWith(this.paymentRequest.shippingOption);
  };

  handleApplePay = () => {
    this.paymentRequest.show().then((paymentResponse) => {
      const { transactionIdentifier, paymentData } = paymentResponse.details;
      console.log(transactionIdentifier, paymentData, paymentResponse);
      setTimeout(() => paymentResponse.complete('success'), 400);
    }).catch((error) => console.log(error, 'error'));
  };

  render() {
    return (
      <ApplePayButton
        buttonStyle="black"
        buttonType="buy"
        onPress={this.handleApplePay}
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
