import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as t from 'tcomb-form-native';

// Import actions.
import * as authActions from '../actions/authActions';

// theme
import theme from '../config/theme';

// Icons
import {
  iconsMap,
  iconsLoaded,
} from '../utils/navIcons';

// Components
import Spinner from '../components/Spinner';
import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
});

const Form = t.form.Form;
const FormFields = t.struct({
  email: t.String,
  password: t.String,
});
const options = {
  disableOrder: true,
  fields: {
    email: {
      label: i18n.gettext('Email'),
      keyboardType: 'email-address',
      clearButtonMode: 'while-editing',
    },
    password: {
      label: i18n.gettext('Password'),
      secureTextEntry: true,
      clearButtonMode: 'while-editing',
    },
  }
};

class Registration extends Component {
  static propTypes = {
    authActions: PropTypes.shape({
      registration: PropTypes.func,
    }),
    navigator: PropTypes.shape({
      setOnNavigatorEvent: PropTypes.func,
      setTitle: PropTypes.func,
      dismissModal: PropTypes.func,
      showInAppNotification: PropTypes.func,
      push: PropTypes.func,
    }),
    auth: PropTypes.shape({
      logged: PropTypes.bool,
      fetching: PropTypes.bool,
    }),
    showClose: PropTypes.bool,
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

    this.state = {
      fetching: true,
    };
  }

  componentWillMount() {
    const { navigator, showClose } = this.props;

    navigator.setTitle({
      title: i18n.gettext('Registration')
    });
    navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

    if (showClose) {
      iconsLoaded.then(() => {
        navigator.setButtons({
          leftButtons: [
            {
              id: 'close',
              icon: iconsMap.close,
            },
          ],
        });
      });
    }
  }

  componentDidMount() {
    const { navigator, authActions } = this.props;
    navigator.setTitle({
      title: i18n.gettext('Registration').toUpperCase(),
    });
    authActions.profileFields({}, (fields) => {
      console.log('fields', fields);
      this.setState({
        fetching: false,
      });
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'close') {
        navigator.dismissModal();
      }
    }
  }

  render() {
    const { fetching } = this.state;

    return (
      <View style={styles.container}>
        <Form
          ref="form"
          type={FormFields}
          options={options}
          value={{}}
        />
        <TouchableOpacity
          style={styles.btn}
        >
          <Text style={styles.btnText}>
            {i18n.gettext('Register')}
          </Text>
        </TouchableOpacity>
        <Spinner visible={fetching} />
      </View>
    );
  }
}

export default connect(
  state => ({
    auth: state.auth,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
  })
)(Registration);
