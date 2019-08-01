import React, { Component } from 'react';
import uniqueId from 'lodash/uniqueId';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  FlatList,
} from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import Swipeout from 'react-native-swipeout';
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../../config/theme';

// Import actions.
import * as authActions from '../../actions/authActions';
import * as ordersActions from '../../actions/vendorManage/ordersActions';

// Components
import Spinner from '../../components/Spinner';
import EmptyList from '../../components/EmptyList';
import OrderListItem from '../../components/OrderListItem';

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
});

const itemsList = [
  i18n.gettext('Processed'),
  i18n.gettext('On hold'),
  i18n.gettext('Awaiting call'),
  i18n.gettext('Canceled'),
  i18n.gettext('Complete'),
  i18n.gettext('Incomplete'),
  i18n.gettext('View all statuses'),
  i18n.gettext('Cancel'),
];

const CANCEL_INDEX = 7;

class Orders extends Component {
  static propTypes = {
    ordersActions: PropTypes.shape({
      fetch: PropTypes.func,
    }),
    hasMore: PropTypes.bool,
    page: PropTypes.number,
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
      refreshing: false,
    };

    props.navigator.setTitle({
      title: i18n.gettext('Vendor Orders').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const { navigator, ordersActions } = this.props;
    ordersActions.fetch();
    iconsLoaded.then(() => {
      navigator.setButtons({
        leftButtons: [
          {
            id: 'sideMenu',
            icon: iconsMap.menu,
          },
        ],
      });
    });
  }

  componentWillReceiveProps() {
    this.setState({
      refreshing: false,
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'sideMenu') {
        navigator.toggleDrawer({ side: 'left' });
      }
    }
  }

  showActionSheet = () => {
    this.ActionSheet.show();
  }

  handleRefresh = () => {
    const { ordersActions } = this.props;
    this.setState({
      refreshing: true,
    });

    ordersActions.fetch(0);
  }

  handleLoadMore = () => {
    const { ordersActions, orders: { hasMore, page } } = this.props;

    if (!hasMore) {
      return;
    }

    ordersActions.fetch(page);
  }


  renderItem = ({ item }) => {
    const { navigator } = this.props;
    const swipeoutBtns = [
      {
        text: i18n.gettext('Status'),
        type: 'delete',
        onPress: this.showActionSheet,
      },
    ];

    return (
      <Swipeout
        autoClose
        right={swipeoutBtns}
        backgroundColor={theme.$navBarBackgroundColor}
      >
        <OrderListItem
          key={uniqueId('oreder-i')}
          item={item}
          onPress={() => {
            navigator.push({
              screen: 'OrderDetail',
              backButtonTitle: '',
              passProps: {
                orderId: item.order_id,
              },
            });
          }}
        />
      </Swipeout>
    );
  }

  renderList = () => {
    const { refreshing } = this.state;
    const { orders } = this.props;

    if (orders.fetching) {
      return null;
    }

    return (
      <FlatList
        keyExtractor={(item, index) => `order_${index}`}
        data={orders.items}
        ListEmptyComponent={<EmptyList />}
        renderItem={this.renderItem}
        onEndReached={this.handleLoadMore}
        refreshing={refreshing}
        onRefresh={() => this.handleRefresh()}
      />
    );
  };

  render() {
    const { orders } = this.props;

    return (
      <View style={styles.container}>
        {this.renderList()}
        <Spinner visible={orders.fetching} mode="content" />
        <ActionSheet
          ref={(ref) => { this.ActionSheet = ref; }}
          options={itemsList}
          cancelButtonIndex={CANCEL_INDEX}
          onPress={index => console.log(index)}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    orders: state.vendorManageOrders,
  }),
  dispatch => ({
    authActions: bindActionCreators(authActions, dispatch),
    ordersActions: bindActionCreators(ordersActions, dispatch),
  })
)(Orders);
