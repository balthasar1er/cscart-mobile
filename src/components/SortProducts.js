import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { sortBy, uniqWith, isEqual } from 'lodash';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet from 'react-native-actionsheet';
import RBSheet from 'react-native-raw-bottom-sheet';
import Button from './Button';
import i18n from '../utils/i18n';
import Icon from './Icon';

const styles = EStyleSheet.create({
  wrapper: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    padding: 8,
    paddingLeft: 14,
    paddingRight: 14,
    marginBottom: 10,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btn: {
    justifyContent: 'center',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 6,
    paddingBottom: 6,
  },
  btnFilter: {
    justifyContent: 'center',
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 6,
    paddingBottom: 6,
    marginRight: 20,
  },
  text: {
    color: '$primaryColor',
    fontSize: '0.9rem',
  },
  filterText: {
    color: '#8e8e8e',
    fontSize: '0.9rem',
  },
  filterIcon: {
    fontSize: '1.2rem',
    color: '#8e8e8e',
    position: 'absolute',
    top: 4,
    left: -20,
  },
  badge: {
    backgroundColor: '#0093ff',
    minWidth: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: -16,
  },
  badgeText: {
    color: '#fff',
  },
  filterHeaderSection: {
    borderBottomWidth: 0.5,
    borderColor: '#f1f1f1',
    padding: 10,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    width: '100%'
  },
  scrollWrapper: {
    paddingTop: 4,
    marginLeft: 20,
  },
  filterFooterSection: {
    borderTopWidth: 0.5,
    borderColor: '#f1f1f1',
    padding: 40,
    paddingTop: 16,
    paddingBottom: 14,
  },
  scrollWrapperContent: {
    minHeight: 310,
  },
  pickerWrapper: {
    padding: 20,
    borderTopWidth: 0.5,
    borderColor: '#f1f1f1',
  },
  pickerOpenBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  pickerOpenBtnText: {
    fontSize: 20,
    color: '#000'
  },
});

const CANCEL_INDEX = 5;
const DESTRUCTIVE_INDEX = 5;

const itemsList = [
  {
    name: i18n.gettext('Sorting: Newest items first'),
    params: {
      sort_by: 'timestamp',
      sort_order: 'desc'
    },
  },
  {
    name: i18n.gettext('Sorting: A to Z'),
    params: {
      sort_by: 'product',
      sort_order: 'asc'
    },
  },
  {
    name: i18n.gettext('Sorting: Z to A'),
    params: {
      sort_by: 'product',
      sort_order: 'desc'
    },
  },
  {
    name: i18n.gettext('Sorting: Lowest prices first'),
    params: {
      sort_by: 'price',
      sort_order: 'asc'
    },
  },
  {
    name: i18n.gettext('Sorting: Highest prices first'),
    params: {
      sort_by: 'price',
      sort_order: 'desc'
    },
  },
  {
    name: i18n.gettext('Sorting: Most popular first'),
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
    }),
    filters: PropTypes.arrayOf(PropTypes.shape({})),
  };

  state = {
    openIDs: [],
    selectedFilters: [],
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

  togglePicker = (id) => {
    const { openIDs } = this.state;

    if (openIDs.some(item => item === id)) {
      this.setState({
        openIDs: openIDs.filter(item => item !== id),
      });
      return;
    }
    this.setState({
      openIDs: [
        ...openIDs,
        id,
      ],
    });
  }

  toggleVariant = (filter, variant) => {
    const { selectedFilters } = this.state;

    this.setState({
      selectedFilters: [
        ...selectedFilters,
        filter,
      ],
    });

    console.log(uniqWith(selectedFilters, isEqual), selectedFilters);

    // const result = [
    //   ...selectedFilters,
    // ];

    // Item not exist
    // if (selectedFilters.some(item => item.feature_id !== filter.feature_id)) {
    //   const newItem = {
    //     ...filter,
    //   };

    //   newItem.variants = filter.variants
    //     .filter(item => item.variant_id === variant.variant_id);
    //   result.push(newItem);
    // } else {
    //   const foundItemIndex = selectedFilters
    //     .findIndex(item => item.feature_id === filter.feature_id);
    //   if (selectedFilters[foundItemIndex].variants.some(item => item.variant_id === variant.variant_id)) {
    //     selectedFilters[foundItemIndex].variants
    //       .filter(item => item.variant_id !== variant.variant_id);
    //   } else {
    //     selectedFilters[foundItemIndex].variants.push(variant);
    //   }
    // }

    // this.setState({
    //   selectedFilters: result,
    // });
  }

  renderPicker = (item) => {
    const { feature_id, variants, filter } = item;
    const { openIDs } = this.state;
    const isOpen = openIDs.some(item => item === feature_id);

    const pickerContainerStyles = {
      ...styles.pickerContent,
    };

    if (!isOpen) {
      pickerContainerStyles.height = 60;
      pickerContainerStyles.overflow = 'hidden';
    }

    return (
      <View
        style={styles.pickerWrapper}
        key={feature_id}
      >
        <TouchableOpacity
          style={styles.pickerOpenBtn}
          onPress={() => this.togglePicker(feature_id)}
        >
          <Text style={styles.pickerOpenBtnText}>
            {`${filter} (${variants.length})`}
          </Text>
          <Icon name="arrow-drop-down" />
        </TouchableOpacity>
        <View
          style={pickerContainerStyles}
        >
          {sortBy(variants, ['position']).map((variant) => {
            return (
              <Button
                type="label"
                key={variant.variant_id}
                onPress={() => this.toggleVariant(item, variant)}
              >
                {variant.variant}
              </Button>
            );
          })}
        </View>
      </View>
    );
  }

  renderHader = () => (
    <View style={styles.filterHeaderSection}>
      <TouchableOpacity onPress={() => this.RBSheet.close()}>
        <Icon name="close" />
      </TouchableOpacity>
      <ScrollView horizontal contentContainerStyle={styles.scrollWrapper}>
        <Button type="ghost">
          {i18n.gettext('Clear all')}
        </Button>
        <Button type="round" clear>
          Size
        </Button>
      </ScrollView>
    </View>
  );

  renderFooter = () => (
    <View style={styles.filterFooterSection}>
      <Button type="primary">
        {i18n.gettext('Apply')}
      </Button>
    </View>
  );

  renderFilters = () => {
    const { filters } = this.props;
    const activeItems = filters.filter(
      item => item.feature_type === 'S'
      && item.filter_style === 'checkbox'
    );
    return (
      <React.Fragment>
        {this.renderHader()}
        <ScrollView contentContainerStyle={styles.scrollWrapperContent}>
          {activeItems.map(item => this.renderPicker(item))}
        </ScrollView>
        {this.renderFooter()}
      </React.Fragment>
    );
  }

  render() {
    const { sortParams } = this.props;
    const activeIndex = itemsList
      .findIndex(item => (
        item.params.sort_by === sortParams.sort_by
        && item.params.sort_order === sortParams.sort_order
      ));

    const items = itemsList.map(item => item.name);
    const filteredItems = items.filter(item => item !== items[activeIndex]);
    const RBSheetHeight = Math.round(Dimensions.get('window').height) - 140;

    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={styles.btn}
          onPress={this.showActionSheet}
        >
          <Text style={styles.text} numberOfLines={2}>
            {items[activeIndex]}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnFilter}
          onPress={() => {
            this.RBSheet.open();
          }}
        >
          <Icon name="filter-list" style={styles.filterIcon} />
          <Text style={styles.text} numberOfLines={2}>
            {i18n.gettext('Filter')}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>

        <ActionSheet
          ref={(ref) => { this.ActionSheet = ref; }}
          options={filteredItems}
          cancelButtonIndex={DESTRUCTIVE_INDEX}
          destructiveButtonIndex={CANCEL_INDEX}
          onPress={index => this.handleChange(filteredItems[index])}
        />
        <RBSheet
          ref={ref => { this.RBSheet = ref; }}
          closeOnDragDown={false}
          height={RBSheetHeight}
          duration={250}
        >
          {this.renderFilters()}
        </RBSheet>
      </View>
    );
  }
}

export default SortProducts;
