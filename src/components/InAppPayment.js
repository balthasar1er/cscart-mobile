import React from 'react';
import { PaymentRequest, ApplePayButton } from 'react-native-payments';

export default class InAppPayment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleApplePay = () => {
    const METHOD_DATA = [{
      supportedMethods: ['apple-pay'],
      data: {
        merchantIdentifier: 'merchant.com.cscart',
        supportedNetworks: ['visa'],
        countryCode: 'US',
        currencyCode: 'USD'
      }
    }];

    const DETAILS = {
      id: 'basic-example',
      displayItems: [
        {
          label: 'Movie Ticket',
          amount: { currency: 'USD', value: '15.00' }
        }
      ],
      shippingOptions: [{
        id: 'economy',
        label: 'Economy Shipping',
        amount: { currency: 'USD', value: '0.00' },
        detail: 'Arrives in 3-5 days' // `detail` is specific to React Native Payments
      },
      {
        id: 'economy2',
        label: 'Economy Shipping3',
        amount: { currency: 'USD', value: '10.00' },
        detail: 'Arrives in 3-5 days' // `detail` is specific to React Native Payments
      },
      {
        id: 'economy3',
        label: 'Economy Shipping3',
        amount: { currency: 'USD', value: '20.00' },
        detail: 'Arrives in 3-5 days' // `detail` is specific to React Native Payments
      }],
      total: {
        label: 'CSCartmultivendor',
        amount: { currency: 'USD', value: '15.00' }
      }
    };
    const OPTIONS = {
      requestShipping: true,
    };
    const paymentRequest = new PaymentRequest(METHOD_DATA, DETAILS, OPTIONS);
    paymentRequest.show().then((paymentResponse) => {
      const { transactionIdentifier, paymentData } = paymentResponse.details;
      console.log(transactionIdentifier, paymentData, paymentResponse);
      paymentResponse.complete('success');
    });
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
