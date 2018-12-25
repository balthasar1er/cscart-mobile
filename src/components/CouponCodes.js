import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import * as t from 'tcomb-form-native';

import i18n from '../utils/i18n';
import FormBlock from './FormBlock';
import Button from './Button';

const styles = EStyleSheet.create({
  wrapper: {},
  itemContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  itemText: {
    paddingTop: 4,
    fontSize: '1rem',
  },
  itemBtn: {
    width: 30,
    height: 30
  }
});

const Form = t.form.Form;
const formFields = t.struct({
  coupon: t.maybe(t.String),
});
const formOptions = {
  disableOrder: true,
  fields: {
    coupon: {
      label: i18n.gettext('Coupon code'),
      clearButtonMode: 'while-editing',
    },
  }
};

class CouponCodes extends Component {
  static propTypes = {
    onAddPress: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.string),
  };

  state = {
    value: '',
  };

  handleAddCoupon = () => {
    const { onAddPress } = this.props;
    const value = this.refs.form.getValue();

    if (value && value !== '') {
      this.setState({
        value: '',
      });
      onAddPress(value.coupon);
    }
  };

  renderCouponItem = (item, index) => {
    return (
      <View style={styles.itemContainer} key={index}>
        <Text style={styles.itemText}>
          {item}
        </Text>
      </View>
    );
  };

  render() {
    const { value } = this.state;
    const { items } = this.props;
    return (
      <View style={styles.wrapper}>
        <FormBlock
          title={i18n.gettext('Coupon code')}
        >
          <Form
            ref="form"
            type={formFields}
            options={formOptions}
            value={value}
          />
          <Button onPress={this.handleAddCoupon}>
            {i18n.gettext('Add')}
          </Button>
          {items.map((item, index) => this.renderCouponItem(item, index))}
        </FormBlock>
      </View>
    );
  }
}

export default CouponCodes;
