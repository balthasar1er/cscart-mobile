import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet from 'react-native-actionsheet';
import i18n from '../utils/i18n';

const styles = EStyleSheet.create({
  btn: {
    justifyContent: 'center',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 6,
    paddingBottom: 6,
  },
  text: {
    color: '$primaryColor',
    fontSize: '0.9rem',
  }
});

const CANCEL_INDEX = 5;
const DESTRUCTIVE_INDEX = 5;

const itemsList = [
  {
    name: i18n.gettext('Newest Items First'),
    params: {
      sort_by: 'timestamp',
      sort_order: 'desc'
    },
  },
  {
    name: i18n.gettext('Sort Alphabetically: A to Z'),
    params: {
      sort_by: 'product',
      sort_order: 'asc'
    },
  },
  {
    name: i18n.gettext('Sort Alphabetically: Z to A'),
    params: {
      sort_by: 'product',
      sort_order: 'desc'
    },
  },
  {
    name: i18n.gettext('Sort by Price: Low to High'),
    params: {
      sort_by: 'price',
      sort_order: 'asc'
    },
  },
  {
    name: i18n.gettext('Sort by Price: High to Low'),
    params: {
      sort_by: 'price',
      sort_order: 'desc'
    },
  },
  {
    name: i18n.gettext('Sort by Popularity'),
    params: {
      sort_by: 'popularity',
      sort_order: 'desc'
    },
  },
  {
    name: i18n.gettext('Cancel'),
    params: {
      sort_by: '',
      sort_order: ''
    },
  }
];

class SortProducts extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    sortParams: PropTypes.shape({
      sort_by: PropTypes.string,
      sort_order: PropTypes.string,
    })
  };

  showActionSheet = () => {
    this.ActionSheet.show();
  }

  handleChange = (itemText) => {
    const { onChange } = this.props;
    const items = itemsList.map(item => item.name);
    const foundIndex = items.findIndex(item => item === itemText);

    if (foundIndex === CANCEL_INDEX + 1) {
      return;
    }

    onChange(itemsList[foundIndex].params, foundIndex);
  };

  render() {
    const { sortParams } = this.props;
    const activeIndex = itemsList
      .findIndex(item => (
        item.params.sort_by === sortParams.sort_by
        && item.params.sort_order === sortParams.sort_order
      ));

    const items = itemsList.map(item => item.name);
    const filteredItems = items.filter(item => item !== items[activeIndex]);

    return (
      <View>
        <TouchableOpacity
          style={styles.btn}
          onPress={this.showActionSheet}
        >
          <Text style={styles.text}>
            {items[activeIndex]}
          </Text>
        </TouchableOpacity>
        <ActionSheet
          ref={(ref) => { this.ActionSheet = ref; }}
          options={filteredItems}
          cancelButtonIndex={DESTRUCTIVE_INDEX}
          destructiveButtonIndex={CANCEL_INDEX}
          onPress={index => this.handleChange(filteredItems[index])}
        />
      </View>
    );
  }
}

export default SortProducts;
