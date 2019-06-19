import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Swipeout from 'react-native-swipeout';
import EStyleSheet from 'react-native-extended-stylesheet';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

// Styles
import theme from '../../config/theme';

// Import actions.
import * as authActions from '../../actions/authActions';
import * as ordersActions from '../../actions/ordersActions';

// Components
import Spinner from '../../components/Spinner';
import EmptyList from '../../components/EmptyList';

// Graphql
import GraphQL from '../../services/GraphQL';

import { getImagePath } from '../../utils';

import i18n from '../../utils/i18n';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';

import {
  iconsMap,
  iconsLoaded,
} from '../../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
    backgroundColor: '#fff',
  },
  listItemImage: {
    width: 50,
    marginRight: 14,
  },
  productImage: {
    width: 50,
    height: 50,
  },
  listItemHeader: {
    fontWeight: 'bold'
  },
  listItemText: {
    color: '#8c8c8c',
  },
});

const GET_PRODUCTS = gql`
query getProducts($page: Int) {
  products(page: $page, items_per_page: 50) {
    product
    price
    amount
    product_code
    product_id
    main_pair {
      icon {
        image_path
      }
    }
  }
}
`;

class Orders extends Component {
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

    this.state = {
      page: 1,
      hasMore: true,
    };

    props.navigator.setTitle({
      title: i18n.gettext('Vendor products').toUpperCase(),
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
        rightButtons: [
          {
            id: 'add',
            icon: iconsMap.add,
          }
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
      if (event.id === 'add') {
        navigator.push({
          screen: 'VendorManageAddProductStep1',
          backButtonTitle: '',
          passProps: {
            showBack: true,
          }
        });
      }
    }
  }

  renderItem = (item) => {
    const { navigator } = this.props;

    const swipeoutBtns = [
      {
        text: i18n.gettext('Status'),
        type: 'status',
        backgroundColor: '#ff6002',
        onPress: () => this.handleStatus(item),
      },
      {
        text: i18n.gettext('Delete'),
        type: 'delete',
        backgroundColor: '#ff362b',
        onPress: () => this.handleDelete(item),
      },
    ];

    const imageUri = getImagePath(item);

    return (
      <Swipeout
        autoClose
        right={swipeoutBtns}
        backgroundColor={theme.$navBarBackgroundColor}
      >
        <TouchableOpacity
          onPress={() => navigator.push({
            screen: 'VendorManageEditProduct',
            backButtonTitle: '',
            passProps: {
              productID: item.product_id,
              showBack: true,
            },
          })}
        >
          <View style={styles.listItem}>
            <View style={styles.listItemImage}>
              {imageUri !== null && (
                <Image
                  style={styles.productImage}
                  source={{ uri: imageUri }}
                  resizeMode="contain"
                  resizeMethod="resize"
                />
              )}
            </View>
            <View style={styles.listItemContent}>
              <View>
                <Text style={styles.listItemHeader}>
                  {item.product}
                </Text>
              </View>
              <View>
                <Text style={styles.listItemText}>
                  {item.product_code}
                </Text>
                <Text style={styles.listItemText}>
                  {item.price} * {item.amount !== 0 && `${i18n.gettext('In stock')}: ${item.amount}`}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeout>
    );
  };

  render() {
    const { page, hasMore } = this.state;
    return (
      <GraphQL>
        <Query query={GET_PRODUCTS} variables={{ page: 1 }}>
          {({ loading, error, data, fetchMore, }) => {
            if (loading) {
              return (
                <Spinner visible mode="content" />
              );
            }
            if (error) return `Error! ${error.message}`;

            return (
              <View style={styles.container}>
                <FlatList
                  keyExtractor={(item, index) => `order_${index}`}
                  data={data.products}
                  ListEmptyComponent={<EmptyList />}
                  renderItem={({ item }) => this.renderItem(item)}
                  onEndReached={() => {
                    if (!hasMore) {
                      return;
                    }
                    fetchMore({
                      variables: { page: page + 1 },
                      updateQuery: (prev, { fetchMoreResult, variables }) => {
                        this.setState({
                          page: variables.page,
                          hasMore: fetchMoreResult.products.length !== 0,
                        });
                        return {
                          products: [
                            ...prev.products,
                            ...fetchMoreResult.products,
                          ],
                        };
                      }
                    });
                  }}
                />
              </View>
            );
          }}
        </Query>
      </GraphQL>
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
)(Orders);
