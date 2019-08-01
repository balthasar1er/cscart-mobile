import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import PropTypes from 'prop-types';

import { formatPrice, getOrderStatus } from '../utils';

const styles = EStyleSheet.create({
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
    padding: 14,
  },
  orderItemEmail: {
    fontSize: '0.7rem',
    color: 'gray'
  },
  orderItemCustomer: {
    marginRight: 20,
  },
  orderItemCustomerText: {
    fontWeight: 'bold',
  },
  orderItemStatusText: {
    textAlign: 'right',
  },
  orderItemTotal: {
    fontWeight: 'bold',
    fontSize: '0.7rem',
    textAlign: 'right',
  }
});

const OrderListItem = (props) => {
  const { onPress, item } = props;
  const status = getOrderStatus(item.status);
  return (
    <TouchableOpacity
      onPress={onPress}
    >
      <View style={styles.orderItem}>
        <View style={styles.orderItemCustomer}>
          <Text style={styles.orderItemCustomerText}>
            #{item.order_id} {item.firstname} {item.lastname}
          </Text>
          <Text style={styles.orderItemEmail}>
            {item.email}
          </Text>
        </View>
        <View style={styles.orderItemStatus}>
          <Text style={[styles.orderItemStatusText, status.style]}>
            {status.text}
          </Text>
          <Text style={styles.orderItemTotal}>
            {item.total_formatted ? formatPrice(item.total_formatted.price) : item.total}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

OrderListItem.propTypes = {
  onPress: PropTypes.func.isRequired,
  item: PropTypes.shape({
    order_id: PropTypes.string,
    firstname: PropTypes.string,
    lastname: PropTypes.string,
    total_formatted: PropTypes.string,
  }),
};

export default OrderListItem;
