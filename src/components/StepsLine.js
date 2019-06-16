import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  text: {
    fontSize: '0.8rem',
    color: '$primaryColor',
  }
});

export default class extends Component {
  static propTypes = {
    step: PropTypes.number,
    total: PropTypes.number,
  }

  render() {
    const { step, total, } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {i18n.gettext(`Step ${step} from ${total}`)}
        </Text>
      </View>
    );
  }
}
