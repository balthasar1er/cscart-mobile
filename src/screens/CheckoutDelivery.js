import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Import components
import CheckoutSteps from '../components/CheckoutSteps';
import Spinner from '../components/Spinner';

// Import actions.
import * as authActions from '../actions/authActions';
import * as cartActions from '../actions/cartActions';

import i18n from '../utils/i18n';
import { formatPrice } from '../utils';

// theme
import theme from '../config/theme';
import ProfileForm from '../components/ProfileForm';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 14
  },
});

class Checkout extends Component {
  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  static propTypes = {
    navigator: PropTypes.shape({
      push: PropTypes.func,
      pop: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
    cart: PropTypes.shape(),
  };

  constructor(props) {
    super(props);
    this.state = {
      fieldsFetching: true
    };
    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    const { authActions } = this.props;
    const { fieldsFetching } = this.state;

    if (fieldsFetching) {
      authActions
        .profileFields({
          location: 'checkout',
          action: 'update'
        })
        .then(({ fields }) => {
          // eslint-disable-next-line no-param-reassign
          delete fields.E;

          this.setState({
            fields,
            fieldsFetching: false,
          });
        });
    }
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'back') {
        navigator.pop();
      }
    }
  }

  handleNextPress(values) {
    const { navigator, cart, cartActions } = this.props;

    cartActions.saveUserData({
      ...cart.user_data,
      ...values
    });

    navigator.push({
      screen: 'CheckoutShipping',
      backButtonTitle: '',
      title: i18n.gettext('Checkout').toUpperCase(),
      passProps: {
        total: cart.subtotal,
      },
    });
  }

  render() {
    const { cart } = this.props;
    const { fieldsFetching, fields } = this.state;

    if (fieldsFetching) {
      return (
        <View style={styles.container}>
          <Spinner visible mode="content" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <CheckoutSteps step={1} />
        </View>

        <ProfileForm
          fields={fields}
          cartFooterEnabled={true}
          showTitles={true}
          totalPrice={formatPrice(cart.subtotal_formatted.price)}
          btnText={i18n.gettext('Next').toUpperCase()}
          onBtnPress={(values, validateCb) => { validateCb(); }}
          onSubmit={(values) => { this.handleNextPress(values); }}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
    cart: state.cart,
    state,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
    cartActions: bindActionCreators(cartActions, dispatch),
  })
)(Checkout);
