import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { PRODUCT_NUM_COLUMNS } from '../utils';
import i18n from '../utils/i18n';
import Api from '../services/api';
import { BLOCK_CATEGORIES } from '../constants';

// Import actions.
import * as productsActions from '../actions/productsActions';

// Components
import Spinner from '../components/Spinner';
import VendorInfo from '../components/VendorInfo';
import SortProducts from '../components/SortProducts';
import CategoryBlock from '../components/CategoryBlock';
import ProductListView from '../components/ProductListView';

// theme
import theme from '../config/theme';

import {
  iconsMap,
  iconsLoaded,
} from '../utils/navIcons';


// Styles
const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  emptyList: {
    fontSize: '1rem',
    textAlign: 'center',
    color: '$darkColor',
    marginTop: '1rem',
  },
});

class Categories extends Component {
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
      setOnNavigatorEvent: PropTypes.func,
      setButtons: PropTypes.func,
    }),
    categoryId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    companyId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    category: PropTypes.shape({}),
    vendors: PropTypes.shape({
      items: PropTypes.object,
    }),
    products: PropTypes.shape({
      items: PropTypes.object,
    }),
    layouts: PropTypes.shape({
      blocks: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    productsActions: PropTypes.shape({
      fetchByCategory: PropTypes.func,
    })
  };

  constructor(props) {
    super(props);
    this.activeCategoryId = 0;
    this.isFirstLoad = true;

    this.state = {
      products: [{}],
      subCategories: [],
      refreshing: false,
      isLoadMoreRequest: false,
    };

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const { navigator } = this.props;
    iconsLoaded.then(() => {
      navigator.setButtons({
        rightButtons: [
          {
            id: 'cart',
            component: 'CartBtn',
            passProps: {},
          },
          {
            id: 'search',
            icon: iconsMap.search,
          },
        ]
      });
    });
  }

  async componentDidMount() {
    const {
      productsActions, products, navigator, categoryId, layouts, companyId,
    } = this.props;

    let { category } = this.props;

    if (!category) {
      category = await Api.get('/categories/432?subcats=Y');
    }

    if (categoryId) {
      const categories = layouts.blocks.find(b => b.type === BLOCK_CATEGORIES);
      const items = Object.keys(categories.content.items).map(k => categories.content.items[k]);
      category = this.findCategoryById(items);
    }
    this.activeCategoryId = category.category_id;
    const categoryProducts = products.items[this.activeCategoryId];
    const newState = {};

    if ('subcategories' in category && category.subcategories.length) {
      newState.subCategories = category.subcategories;
    }

    if (categoryProducts) {
      newState.refreshing = false;
      newState.products = categoryProducts;
    }

    this.setState(state => ({
      ...state,
      ...newState,
    }), () => productsActions
      .fetchByCategory(
        this.activeCategoryId,
        1,
        companyId,
        products.sortParams
      ));

    navigator.setTitle({
      title: category.category,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { products } = nextProps;
    const categoryProducts = products.items[this.activeCategoryId];
    if (categoryProducts) {
      this.setState({
        products: categoryProducts,
        refreshing: false,
      });
      this.isFirstLoad = false;
    }
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'search') {
        navigator.showModal({
          screen: 'Search',
          title: i18n.gettext('Search'),
        });
      } else if (event.id === 'back') {
        navigator.pop();
      }
    }
  }

  findCategoryById(items) {
    const { categoryId } = this.props;
    const flatten = [];
    const makeFlat = (list) => {
      list.forEach((i) => {
        flatten.push(i);
        if ('subcategories' in i) {
          makeFlat(i.subcategories);
        }
      });
    };
    makeFlat(items);
    return flatten.find(i => i.category_id == categoryId) || null;
  }

  handleLoadMore() {
    const { products, productsActions, companyId } = this.props;
    const { isLoadMoreRequest } = this.state;

    if (products.hasMore && !isLoadMoreRequest) {
      this.setState({
        isLoadMoreRequest: true,
      });
      productsActions.fetchByCategory(
        this.activeCategoryId,
        products.params.page + 1,
        companyId,
        products.sortParams,
      ).then(() => {
        this.setState({
          isLoadMoreRequest: false,
        });
      });
    }
  }

  handleRefresh() {
    const { productsActions, companyId, products } = this.props;
    this.setState({
      refreshing: true,
    },
    () => productsActions
      .fetchByCategory(this.activeCategoryId, 1, companyId, products.sortParams));
  }

  renderSorting() {
    const {
      companyId,
      productsActions,
      products
    } = this.props;

    return (
      <SortProducts
        sortParams={products.sortParams}
        filters={products.filters}
        onChange={(sort) => {
          productsActions.changeSort(sort);
          productsActions.fetchByCategory(
            this.activeCategoryId,
            1,
            companyId,
            sort
          );
        }}
        onChangeFilter={(features_hash) => {
          productsActions.fetchByCategory(
            this.activeCategoryId,
            1,
            companyId,
            {
              features_hash,
            }
          );
        }}
      />
    );
  }

  renderHeader() {
    const {
      navigator,
      companyId,
      vendors,
    } = this.props;

    let vendorHeader = null;
    if (companyId && vendors.items[companyId] && !vendors.fetching) {
      const vendor = vendors.items[companyId];
      vendorHeader = (
        <VendorInfo
          onViewDetailPress={() => {
            navigator.showModal({
              screen: 'VendorDetail',
              passProps: {
                vendorId: companyId,
              },
            });
          }}
          logoUrl={vendor.logo_url}
          productsCount={vendor.products_count}
        />
      );
    }

    return (
      <View>
        {vendorHeader}
        <CategoryBlock
          items={this.state.subCategories}
          onPress={(category) => {
            navigator.push({
              screen: 'Categories',
              backButtonTitle: '',
              passProps: {
                category,
                companyId,
              }
            });
          }}
        />
        {this.renderSorting()}
      </View>
    );
  }

  renderSpinner = () => (
    <Spinner visible mode="content" />
  );

  renderEmptyList = () => (
    <Text style={styles.emptyList}>
      {i18n.gettext('There are no products in this section')}
    </Text>
  );

  renderFooter() {
    const { products } = this.props;

    if (products.fetching && products.hasMore) {
      return (
        <ActivityIndicator size="large" animating />
      );
    }

    return null;
  }

  renderList() {
    const { navigator } = this.props;
    const { products, refreshing } = this.state;
    return (
      <FlatList
        data={products}
        keyExtractor={item => +item.product_id}
        ListHeaderComponent={() => this.renderHeader()}
        ListFooterComponent={() => this.renderFooter()}
        numColumns={PRODUCT_NUM_COLUMNS}
        renderItem={item => (
          <ProductListView
            product={item}
            onPress={product => navigator.push({
              screen: 'ProductDetail',
              backButtonTitle: '',
              passProps: {
                pid: product.product_id,
              }
            })}
          />
        )}
        onRefresh={() => this.handleRefresh()}
        refreshing={refreshing}
        onEndReachedThreshold={1}
        onEndReached={() => this.handleLoadMore()}
        ListEmptyComponent={() => this.renderEmptyList()}
      />
    );
  }

  render() {
    const { products } = this.props;
    return (
      <View style={styles.container}>
        {
          (products.fetching && this.isFirstLoad)
            ? this.renderSpinner()
            : this.renderList()
        }
      </View>
    );
  }
}

export default connect(
  state => ({
    products: state.products,
    layouts: state.layouts,
    vendors: state.vendors,
  }),
  dispatch => ({
    productsActions: bindActionCreators(productsActions, dispatch),
  })
)(Categories);
