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

// Styles
import theme from '../../config/theme';

// Import actions.
import * as notificationsActions from '../../actions/notificationsActions';

// Components
import Spinner from '../../components/Spinner';
import EmptyList from '../../components/EmptyList';

// Graphql
import { getProductsList, deleteProduct } from '../../services/vendors';

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

class Products extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
    notifications: PropTypes.shape({
      items: PropTypes.arrayOf(PropTypes.object),
    }),
    notificationsActions: PropTypes.shape({
      hide: PropTypes.func,
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
      loading: true,
      items: [],
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

  componentDidMount() {
    this.handleLoadMore();
  }

  componentWillReceiveProps(nextProps) {
    const { notificationsActions } = this.props;
    const { navigator } = nextProps;

    if (nextProps.notifications.items.length) {
      const notify = nextProps.notifications.items[nextProps.notifications.items.length - 1];
      if (notify.closeLastModal) {
        navigator.dismissModal();
      }
      navigator.showInAppNotification({
        screen: 'Notification',
        autoDismissTimerSec: 1,
        passProps: {
          dismissWithSwipe: true,
          title: notify.title,
          type: notify.type,
          text: notify.text,
        },
      });
      notificationsActions.hide(notify.id);
    }
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

  handleLoadMore = async () => {
    const { page, items, hasMore } = this.state;
    try {
      if (!hasMore) {
        return;
      }
      const result = await getProductsList(page);
      this.setState({
        page: page + 1,
        loading: false,
        items: [
          ...items,
          ...result.data.products,
        ],
        hasMore: result.data.products.length !== 0
      });
    } catch (error) {
      // pass
    }
  }

  handleDelete = async ({ product_id }) => {
    const { notificationsActions } = this.props;
    const { items } = this.state;
    try {
      const result = await deleteProduct(product_id);
      this.setState({
        items: items.filter(item => item.product_id !== product_id),
      });

      if (result) {
        notificationsActions.show({
          type: 'success',
          title: i18n.gettext('Success'),
          text: i18n.gettext('Product has been removed.'),
          closeLastModal: false,
        });
      }
    } catch (error) {
      // pass
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
    const { loading, items } = this.state;

    if (loading) {
      return (
        <Spinner visible mode="content" />
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          keyExtractor={(item, index) => `order_${index}`}
          data={items}
          ListEmptyComponent={<EmptyList />}
          renderItem={({ item }) => this.renderItem(item)}
          onEndReached={this.handleLoadMore}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    notifications: state.notifications,
  }),
  dispatch => ({
    notificationsActions: bindActionCreators(notificationsActions, dispatch),
  })
)(Products);
