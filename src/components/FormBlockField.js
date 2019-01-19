import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  I18nManager,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const writingDirection = {
  writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
};

const styles = EStyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 4,
  },
  title: {
    fontWeight: 'bold',
    paddingRight: 4,
    fontSize: '0.9rem',
    ...writingDirection,
  },
  text: {
    color: '#7C7C7C',
    fontSize: '0.9rem',
    flex: 1,
    ...writingDirection,
  },
});

export default class extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.node,
      PropTypes.string,
      PropTypes.array,
    ]),
  };

  render() {
    const { title, children } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          {title}
        </Text>
        <Text
          style={styles.text}
          numberOfLines={4}
        >
          {children}
        </Text>
      </View>
    );
  }
}
