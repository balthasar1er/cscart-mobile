import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as t from 'tcomb-form-native';
import {
  View,
  ScrollView,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../../config/theme';

// Import actions.
import * as authActions from '../../actions/authActions';
import * as ordersActions from '../../actions/ordersActions';

// Components
import Spinner from '../../components/Spinner';
import Section from '../../components/Section';

import i18n from '../../utils/i18n';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';

import {
  iconsMap,
  iconsLoaded,
} from '../../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
});

const Form = t.form.Form;
const formFields = t.struct({
  name: t.String,
  description: t.maybe(t.String),
  price: t.String,
  list_price: t.String,
  code: t.String,
  in_stock: t.String,
});
const formOptions = {
  disableOrder: true,
  fields: {
    description: {
      label: i18n.gettext('Description'),
      clearButtonMode: 'while-editing',
      multiline: true,
      returnKeyType: 'done',
      blurOnSubmit: true,
      stylesheet: {
        ...Form.stylesheet,
        textbox: {
          ...Form.stylesheet.textbox,
          normal: {
            ...Form.stylesheet.textbox.normal,
            height: 150,
          },
        }
      },
    },
  }
};

class AddProduct extends Component {
  static propTypes = {
    ordersActions: PropTypes.shape({
      login: PropTypes.func,
    }),
    orders: PropTypes.shape({
      fetching: PropTypes.bool,
      items: PropTypes.arrayOf(PropTypes.object),
    }),
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
  };

  static navigatorStyle = {
    navBarBackgroundColor: theme.$navBarBackgroundColor,
    navBarButtonColor: theme.$navBarButtonColor,
    navBarButtonFontSize: theme.$navBarButtonFontSize,
    navBarTextColor: theme.$navBarTextColor,
    screenBackgroundColor: theme.$screenBackgroundColor,
  };

  constructor(props) {
    super(props);

    props.navigator.setTitle({
      title: i18n.gettext('Add product').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const { navigator } = this.props;
    iconsLoaded.then(() => {
      navigator.setButtons({
        leftButtons: [
          {
            id: 'sideMenu',
            icon: iconsMap.menu,
          },
        ],
      });
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'sideMenu') {
        navigator.toggleDrawer({ side: 'left' });
      }
    }
  }

  render() {
    const { orders } = this.props;
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Section>
            <Form
              ref="form"
              type={formFields}
              options={formOptions}
            />
          </Section>
          <Spinner visible={orders.fetching} mode="content" />
        </ScrollView>
      </View>
    );
  }
}

export default connect(
  state => ({
    nav: state.nav,
    auth: state.auth,
    flash: state.flash,
    orders: state.orders,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
    ordersActions: bindActionCreators(ordersActions, dispatch),
  })
)(AddProduct);
