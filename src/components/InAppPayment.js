import React from 'react';
import {
  Alert,
  Platform,
  View,
  Image,
  TouchableOpacity,
  Text
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PaymentRequest, ApplePayButton } from 'react-native-payments';
import EStyleSheet from 'react-native-extended-stylesheet';

import config from '../config';
import i18n from '../utils/i18n';

import * as ordersActions from '../actions/ordersActions';
import * as cartActions from '../actions/cartActions';
import * as paymentsActions from '../actions/paymentsActions';

const styles = EStyleSheet.create({
  androidPayBtn: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 4,
  },
  androidPayBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  androidPayBtnIco: {
    width: 60,
    height: 24,
    marginLeft: 6,
  },
  androidPayBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: '1rem',
  }
});

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
    const methodData = [];

    if (Platform.OS === 'ios') {
      methodData.push(
        {
          supportedMethods: ['apple-pay'],
          data: {
            merchantIdentifier: config.applePayMerchantIdentifier,
            supportedNetworks: config.applePaySupportedNetworks,
            countryCode: 'US',
            currencyCode: 'USD'
          }
        }
      );
    } else {
      methodData.push(
        {
          supportedMethods: ['android-pay'],
          data: {
            supportedNetworks: config.googlePaySupportedNetworks,
            currencyCode: 'USD',
            environment: 'TEST', // defaults to production
            paymentMethodTokenizationParameters: {
              tokenizationType: 'NETWORK_TOKEN',
              parameters: {
                publicKey: config.googlePayApiKey
              }
            }
          }
        }
      );
    }

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
    const { cartActions, paymentsActions, navigator } = this.props;
    this.paymentRequest.show()
      .then((paymentResponse) => {
        const { transactionIdentifier, paymentData } = paymentResponse.details;
        paymentsActions
          .applePay(transactionIdentifier, paymentData)
          .then((data) => {
            paymentResponse.complete('success');
            cartActions.clear();
            navigator.push({
              screen: 'CheckoutComplete',
              backButtonTitle: '',
              backButtonHidden: true,
              passProps: {
                orderId: 104, // FIXME
              }
            });
          })
          .catch((error) => {
            this.paymentRequest.abort();
            Alert.alert(
              i18n.gettext('Error'),
              i18n.gettext('There was an error processing your payment.'),
              { cancelable: true }
            );
          });
        return true;
      })
      .catch((error) => {
        console.log('canceled', error);
      });
  };

  handleGooglePay = () => {
    const { cartActions, paymentsActions, navigator } = this.props;
    console.log(this.paymentRequest);
    this.paymentRequest.show()
      .then((paymentResponse) => {
        const { transactionIdentifier, paymentData } = paymentResponse.details;
        paymentsActions
          .applePay(transactionIdentifier, paymentData)
          .then((data) => {
            paymentResponse.complete('success');
            cartActions.clear();
            navigator.push({
              screen: 'CheckoutComplete',
              backButtonTitle: '',
              backButtonHidden: true,
              passProps: {
                orderId: 104, // FIXME
              }
            });
          })
          .catch((error) => {
            this.paymentRequest.abort();
            Alert.alert(
              i18n.gettext('Error'),
              i18n.gettext('There was an error processing your payment.'),
              { cancelable: true }
            );
          });
        return true;
      })
      .catch((error) => {
        console.log('canceled', error);
      });
  }

  handlePayPresed = () => {
    if (Platform.OS === 'ios' && config.applePay) {
      this.initPaymentRequest();
      this.handleApplePay();
    } else if (config.googlePay) {
      this.initPaymentRequest();
      this.handleGooglePay();
    }
  }

  render() {
    if (Platform.OS === 'ios') {
      return (
        <ApplePayButton
          buttonStyle="black"
          buttonType="buy"
          onPress={this.handlePayPresed}
        />
      );
    }
    return (
      <TouchableOpacity
        style={styles.androidPayBtn}
        onPress={this.handlePayPresed}
      >
        <View style={styles.androidPayBtnWrapper}>
          <Text style={styles.androidPayBtnText}>
            {i18n.gettext('Buy with')}
          </Text>
          <Image
            source={require('../assets/google_pay.png')}
            style={styles.androidPayBtnIco}
          />
        </View>
      </TouchableOpacity>
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
    paymentsActions: bindActionCreators(paymentsActions, dispatch),
  })
)(InAppPayment);
