import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as t from 'tcomb-form-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import _ from 'lodash';

// Import components
import CheckoutSteps from '../components/CheckoutSteps';
import FormBlock from '../components/FormBlock';
import CartFooter from '../components/CartFooter';
import Spinner from '../components/Spinner';

// Import actions.
import * as authActions from '../actions/authActions';
import * as cartActions from '../actions/cartActions';

import i18n from '../utils/i18n';
import { formatPrice } from '../utils';

// theme
import theme from '../config/theme';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    padding: 14,
  },
});

const { Form } = t.form;

const fieldTypes = {
  ADDRESS_TYPE: 'N',
  CHECKBOX: 'C',
  COUNTRY: 'O',
  DATE: 'D',
  EMAIL: 'E',
  HEADER: 'H',
  INPUT: 'I',
  PASSWORD: 'W',
  PHONE: 'P',
  POSTAL_CODE: 'Z',
  RADIO: 'R',
  SELECT_BOX: 'S',
  STATE: 'A',
  TEXT_AREA: 'T',
  USER_GROUP: 'U',
  VENDOR_TERMS: 'B',
};

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
      sections: {},
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
          location: 'checkout'
        })
        .then((sections) => {
          this.convertSections(sections, ['S', 'C']); // Shipping & Contact information
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

  handleChange = (value, type, containerPath) => {
    const container = _.get(this.state.sections, containerPath);
    container.values = value;

    if (container.origins[type].field_type === fieldTypes.COUNTRY) {
      container.selectedCountryCode = value[type];

      Object.values(container.origins).forEach((field) => {
        if (field.field_type !== fieldTypes.STATE) {
          return;
        }

        if (_.has(field, `values.${container.selectedCountryCode}`)) {
          container.types[field.field_id] = t.enums(field.values[container.selectedCountryCode]);
        } else {
          container.types[field.field_id] = t.String;
          container.values[field.field_id] = null;
        }
      });
    }

    const containerCopy = {};
    containerCopy[containerPath] = container;
    const sections = Object.assign({}, this.state.sections, containerCopy);
    this.setState({ sections });
  }

  convertSections(sections, allowedSections) {
    function createSection(section) {
      const fieldsTypes = {};
      const fieldsOptions = {};
      const fieldsValues = {};
      const fieldsOrigin = {};
      let selectedCountryCode;

      section.fields.forEach((field) => {
        let fieldType;
        let fieldOptions = {
          label: i18n.gettext(field.description)
        };
        let fieldValue = null;

        switch (field.field_type) {
          case fieldTypes.ADDRESS_TYPE:
            fieldType = t.String;
            break;

          case fieldTypes.CHECKBOX:
            fieldType = t.Boolean;
            break;

          case fieldTypes.COUNTRY:
            fieldType = t.enums(field.values);
            break;

          case fieldTypes.DATE:
            fieldType = t.Date;
            break;

          case fieldTypes.EMAIL:
            fieldType = t.String;
            break;

          case fieldTypes.INPUT:
            fieldType = t.String;
            break;

          case fieldTypes.PASSWORD:
            fieldType = t.String;
            break;

          case fieldTypes.PHONE:
            fieldType = t.String;
            break;

          case fieldTypes.POSTAL_CODE:
            fieldType = t.String;
            break;

          case fieldTypes.RADIO:
            fieldType = t.list(field.values);
            break;

          case fieldTypes.SELECT_BOX:
            fieldType = t.enums(field.values);
            break;

          case fieldTypes.STATE:
            fieldType = selectedCountryCode 
              ? t.list(field.values[selectedCountryCode])
              : t.String;
            break;

          case fieldTypes.TEXT_AREA:
            fieldType = t.String;
            break;

          case fieldTypes.VENDOR_TERMS:
            fieldType = t.Boolean;
            break;

          default:
            fieldType = t.String;
            break;
        }

        // optional or required
        if (!field.required) {
          fieldsTypes[field.field_id] = t.maybe(fieldType);
        } else {
          fieldsTypes[field.field_id] = fieldType;
        }

        // etc
        fieldsOptions[field.field_id] = fieldOptions;
        fieldsValues[field.field_id] = fieldValue;
        fieldsOrigin[field.field_id] = field;
      });

      return {
        description: i18n.gettext(section.description),
        selectedCountryCode,
        values: fieldsValues,
        types: fieldsTypes,
        origins: fieldsOrigin,
        options: {
          disableOrder: true,
          fields: { ...fieldsOptions }
        }
      };
    }

    const [shipping, contact] = [
      allowedSections.includes('S') && _.has(sections, 'S') ? createSection(sections.S) : null,
      allowedSections.includes('C') && _.has(sections, 'C') ? createSection(sections.C) : null
    ];

    const stateSections = {};
    if (shipping) {
      stateSections.shipping = shipping;
    }

    if (contact) {
      stateSections.contact = contact;
    }

    this.setState({
      sections: stateSections,
      fieldsFetching: false,
    });
  }

  handleNextPress() {
    const { navigator, cart, cartActions } = this.props;
    let shippingForm = {};
    let contactForm = {};

    if ('shippingForm' in this.refs) {  // eslint-disable-line
      shippingForm = this.refs.shippingForm.pureValidate();  // eslint-disable-line
      this.refs.shippingForm.getValue();

      if (!shippingForm.errors.length) {
        return;
      }
    }

    if ('contactForm' in this.refs) {  // eslint-disable-line
      contactForm = this.refs.contactForm.pureValidate();  // eslint-disable-line
      this.refs.contactForm.getValue();

      if (!contactForm.errors.length) {
        return;
      }
    }

    if (!shippingForm.errors.length && !contactForm.errors.length) {
      cartActions.saveUserData({
        ...cart.user_data,
        ...this.state.sections.shipping.values,
        ...this.state.sections.contact.values,
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
  }

  render() {
    const { cart } = this.props;
    const { fieldsFetching, sections } = this.state;

    if (fieldsFetching) {
      return (
        <View style={styles.container}>
          <Spinner visible mode="content" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.contentContainer}
        >
          <CheckoutSteps step={1} />

          {sections.shipping
            ? (
              <FormBlock
                title={sections.shipping.description}
              >
                <Form
                  ref="shippingForm" // eslint-disable-line
                  type={t.struct(sections.shipping.types)}
                  options={sections.shipping.options}
                  value={sections.shipping.values}
                  onChange={(value, type) => { this.handleChange(value, type, 'shipping'); }}
                />
              </FormBlock>
            )
            : null
          }

          {sections.contact
            ? (
              <FormBlock
                title={sections.contact.description}
              >
                <Form
                  ref="contactForm" // eslint-disable-line
                  type={t.struct(sections.contact.types)}
                  options={sections.contact.options}
                  onChange={(value, type) => { this.handleChange(value, type, 'contact'); }}
                />
              </FormBlock>
            )
            : null
          }
        </KeyboardAwareScrollView>
        <CartFooter
          totalPrice={formatPrice(cart.subtotal_formatted.price)}
          btnText={i18n.gettext('Next').toUpperCase()}
          onBtnPress={() => this.handleNextPress()}
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
