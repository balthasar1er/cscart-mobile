import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Components
import Icon from '../../components/Icon';
import Spinner from '../../components/Spinner';

// Action
import * as categoriesActions from '../../actions/vendorManage/categoriesActions';
import { getCategoriesList } from '../../services/vendors';

import i18n from '../../utils/i18n';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  selected: {
    color: '#FF6008',
  },
  icon: {
    color: '#898989',
  },
  itemText: {
    paddingLeft: 14,
  },
  selectedIcon: {
    color: '#fff',
    marginRight: 10,
  }
});

class CategoriesPicker extends Component {
  static propTypes = {
    selected: PropTypes.arrayOf(PropTypes.shape({})),
    categoriesActions: PropTypes.shape({
      toggleCategory: PropTypes.func,
      clear: PropTypes.func,
    }),
    parent: PropTypes.number,
    page: PropTypes.number,
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
  };

  static defaultProps = {
    parent: 0,
    page: 0,
  };

  constructor(props) {
    super(props);

    this.state = {
      categories: [],
      loading: true,
    };

    props.navigator.setTitle({
      title: i18n.gettext('Categories').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  async componentWillMount() {
    const { categoriesActions, parent, page } = this.props;

    if (parent === 0) {
      categoriesActions.clear();
    }

    try {
      const response = await getCategoriesList(parent, page + 1);
      if (response.data.categories) {
        this.setState({
          loading: false,
          categories: response.data.categories,
        });
      }
    } catch (error) {
      this.setState({
        loading: false,
      });
    }
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
  }

  handleLoadMore = () => {};

 
  renderEmptyList = () => (
    <Text style={styles.emptyList}>
      {i18n.gettext('There are no categories')}
    </Text>
  );

  renderCategoryItem = ({ item }) => {
    const { selected, categoriesActions } = this.props;
    const isSelected = selected.some(selected => selected.category_id === item.category_id);

    return (
      <TouchableOpacity
        style={styles.itemWrapper}
        onPress={() => categoriesActions.toggleCategory(item)}
      >
        {isSelected ? (
          <Icon name="check-circle" style={styles.selected} />
        ) : (
          <Icon name="radio-button-unchecked" style={styles.icon} />
        )}
        <Text style={styles.itemText}>
          {item.category}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    const { categories, loading } = this.state;

    if (loading) {
      return (
        <Spinner visible mode="content" />
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.scrollContainer}
          data={categories}
          keyExtractor={item => `${item.category_id}`}
          numColumns={1}
          renderItem={this.renderCategoryItem}
          onEndReachedThreshold={1}
          onEndReached={() => this.handleLoadMore()}
          ListEmptyComponent={() => this.renderEmptyList()}
        />
      </View>
    );
  }
}

export default connect(
  state => ({
    // loading: state.vendorManageCategories.loading,
    selected: state.vendorManageCategories.selected,
    // hasMore: state.vendorManageCategories.hasMore,
  }),
  dispatch => ({
    categoriesActions: bindActionCreators(categoriesActions, dispatch)
  })
)(CategoriesPicker);
