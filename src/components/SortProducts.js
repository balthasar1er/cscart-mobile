import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  sortBy,
  uniqBy,
  groupBy,
  throttle,
  round,
} from 'lodash';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet from 'react-native-actionsheet';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
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
    paddingBottom: 10,
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
  pickerSlider: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginTop: 20,
    marginLeft: 14,
  },
  pickerOpenBtnText: {
    fontSize: 20,
    color: '#000'
  },
  priceRangeMarkerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 54,
    left: 24,
    right: 24,
    width: '100%',
  },
  priceRangeMarkerText: {
    fontSize: '0.7rem'
  }
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
    onChangeFilter: PropTypes.func,
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

  handlePriceRangeChange = throttle((filter, [min, max]) => {
    const { selectedFilters } = this.state;
    const selected = selectedFilters.filter(item => item.filter_id !== filter.filter_id);

    this.setState({
      selectedFilters: [
        ...selected,
        {
          ...filter,
          min,
          max,
        }
      ]
    });
  }, 100);

  componentDidMount() {
    const { filters } = this.props;
    const selected = filters.filter(
      item => item.selected_variants !== undefined || item.selected_range
    );
    const selectedFilters = [];
    selected.forEach((filter) => {
      if (filter.filter_style === 'checkbox') {
        Object.keys(filter.selected_variants).forEach((key) => {
          selectedFilters.push({
            ...filter,
            ...filter.selected_variants[key],
          });
        });
      }

      // Price
      if (filter.filter_style === 'slider' && filter.field_type === 'P') {
        selectedFilters.push({
          ...filter,
          min: filter.left,
          max: filter.right,
        });
      }
    });

    this.setState({ selectedFilters });
  }

  showActionSheet = () => {
    this.ActionSheet.show();
  }

  getActiveFilterCount = () => {
    const { filters } = this.props;
    return filters.filter(item => item.selected_variants !== undefined).length;
  }

  handleChange = (itemText) => {
    const { onChange } = this.props;
    const items = itemsList.map(item => item.name);
    const foundIndex = items.findIndex(item => item === itemText);

    if (foundIndex === CANCEL_INDEX + 1) {
      return;
    }

    onChange(
      itemsList[foundIndex].params,
      foundIndex,
    );
  };

  handleChangeFilter = () => {
    const { onChangeFilter } = this.props;
    const { selectedFilters } = this.state;
    const groupedFilters = groupBy(selectedFilters, 'filter_id');
    const filtersIds = [];

    Object.keys(groupedFilters).forEach((key) => {
      const filterItems = groupedFilters[key];
      const { filter_id, filter_style, field_type } = filterItems[0];

      if (filter_style === 'checkbox') {
        filtersIds.push(`${filter_id}-${filterItems.map(item => item.variant_id).join('-')}`);
      }

      // Price
      if (filter_style === 'slider' && field_type === 'P') {
        const active = filterItems[0];
        filtersIds.push(`${filter_id}-${round(active.min, 2)}-${round(active.max, 2)}-${active.extra}`);
      }
    });


    onChangeFilter(filtersIds.join('_'));
  }

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

  clearAllFilter = () => {
    this.setState({ selectedFilters: [] });
  }

  removeByFilter(id) {
    const { selectedFilters } = this.state;
    this.setState({
      selectedFilters: selectedFilters.filter(item => item.filter_id !== id),
    });
  }

  toggleVariant(filter, variant) {
    const { selectedFilters } = this.state;
    const selectedFilterItem = {
      ...filter,
      ...variant,
    };

    if (filter.filter_style === 'checkbox') {
      if (selectedFilters.some(item => item.variant_id === selectedFilterItem.variant_id)) {
        this.setState({
          selectedFilters: selectedFilters
            .filter(item => item.variant_id !== selectedFilterItem.variant_id),
        });
        return;
      }

      this.setState({
        selectedFilters: [
          ...selectedFilters,
          selectedFilterItem,
        ],
      });
    }
  }

  renderPicker = (item) => {
    const { feature_id, filter, selected_variants } = item;
    const { openIDs, selectedFilters } = this.state;
    const isOpen = openIDs.some(item => item === feature_id);
    let variants = [...item.variants];
    const pickerContainerStyles = {
      ...styles.pickerContent,
    };

    if (!isOpen) {
      pickerContainerStyles.height = 60;
      pickerContainerStyles.overflow = 'hidden';
    }

    if (selected_variants) {
      variants = [
        ...Object.values(selected_variants),
        ...variants,
      ];
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
            const isSelected = selectedFilters.some(item => item.variant_id === variant.variant_id);
            return (
              <Button
                type={isSelected ? 'round' : 'label'}
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

  renderHader = () => {
    const { selectedFilters } = this.state;
    const selectedItems = uniqBy(selectedFilters, 'filter_id');
    return (
      <View style={styles.filterHeaderSection}>
        <TouchableOpacity onPress={() => this.RBSheet.close()}>
          <Icon name="close" />
        </TouchableOpacity>
        <ScrollView horizontal contentContainerStyle={styles.scrollWrapper}>
          <Button
            type="ghost"
            onPress={this.clearAllFilter}
          >
            {i18n.gettext('Clear all')}
          </Button>
          {selectedItems.map(item => (
            <Button
              clear
              key={item.filter_id}
              type="round"
              onPress={() => this.removeByFilter(item.filter_id)}
            >
              {item.filter}
            </Button>
          ))}
        </ScrollView>
      </View>
    );
  }

  renderPriceRange = (item) => {
    const {
      feature_id,
      filter,
      min,
      max,
      suffix,
      prefix
    } = item;

    const MultiSliderWidth = Math.round(Dimensions.get('window').width) - 68;
    const { selectedFilters } = this.state;
    const activeFilter = selectedFilters
      .find(selectedItem => selectedItem.filter_id === item.filter_id);

    const selectedMin = activeFilter ? activeFilter.min : min;
    const selectedMax = activeFilter ? activeFilter.max : max;

    return (
      <View
        style={styles.pickerWrapper}
        key={feature_id}
      >
        <View
          style={styles.pickerOpenBtn}
        >
          <Text style={styles.pickerOpenBtnText}>
            {`${filter}: ${prefix || ''}${selectedMin}${suffix || ''} - ${prefix || ''}${selectedMax}${suffix || ''}`}
          </Text>
        </View>
        <View style={styles.priceRangeMarkerContainer}>
          <Text style={styles.priceRangeMarkerText}>{`${prefix || ''}${round(min, 2)}${suffix || ''}`}</Text>
          <Text style={styles.priceRangeMarkerText}>{`${prefix || ''}${round(max, 2)}${suffix || ''}`}</Text>
        </View>
        <View style={styles.pickerSlider}>
          <MultiSlider
            values={[selectedMin, selectedMax]}
            min={min}
            max={max}
            sliderLength={MultiSliderWidth}
            onValuesChange={values => this.handlePriceRangeChange(item, values)}
          />
        </View>
      </View>
    );
  }

  renderFooter = () => (
    <View style={styles.filterFooterSection}>
      <Button type="primary" onPress={this.handleChangeFilter}>
        {i18n.gettext('Apply')}
      </Button>
    </View>
  );

  renderFilters = () => {
    const { filters } = this.props;
    const activeItems = filters;

    return (
      <React.Fragment>
        {this.renderHader()}
        <ScrollView contentContainerStyle={styles.scrollWrapperContent}>
          {activeItems.map((item) => {
            if (item.filter_style === 'checkbox') {
              return this.renderPicker(item);
            }

            if (item.filter_style === 'slider') {
              return this.renderPriceRange(item);
            }

            return null;
          })}
        </ScrollView>
        {this.renderFooter()}
      </React.Fragment>
    );
  }

  render() {
    const { sortParams } = this.props;
    const { selectedFilters } = this.state;
    const activeIndex = itemsList
      .findIndex(item => (
        item.params.sort_by === sortParams.sort_by
        && item.params.sort_order === sortParams.sort_order
      ));

    const items = itemsList.map(item => item.name);
    const filteredItems = items.filter(item => item !== items[activeIndex]);
    const RBSheetHeight = Math.round(Dimensions.get('window').height) - 140;
    const activeFiltersCount = selectedFilters.length;

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
          {activeFiltersCount !== 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {activeFiltersCount}
              </Text>
            </View>
          )}
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
