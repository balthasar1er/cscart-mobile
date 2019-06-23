import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

// Graphql
// import GraphQL from '../../services/GraphQL';

// Components
import Icon from '../../components/Icon';
import Spinner from '../../components/Spinner';

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

const GET_CATEGORIES = gql`
query {
  categories(items_per_page: 1000) {
    category_id,
    category
  }
}
`;

class CategoriesPicker extends Component {
  static propTypes = {
    selected: PropTypes.arrayOf(PropTypes.object),
    navigator: PropTypes.shape({
      setTitle: PropTypes.func,
      setButtons: PropTypes.func,
      push: PropTypes.func,
      setOnNavigatorEvent: PropTypes.func,
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      selected: [],
    };

    props.navigator.setTitle({
      title: i18n.gettext('Categories').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const { selected } = this.props;
    this.setState({
      selected: selected || [],
    });
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
  }

  handleLoadMore = () => {};

  handleToggleCategory = (category) => {
    const { selected } = this.state;

    if (selected.some(item => category.category_id === item.category_id)) {
      this.setState({
        selected: selected.filter(item => category.category_id !== item.category_id),
      });
      return;
    }

    this.setState({
      selected: [
        ...selected,
        category,
      ]
    });
  }

  renderEmptyList = () => (
    <Text style={styles.emptyList}>
      {i18n.gettext('There are no categories')}
    </Text>
  );

  renderCategoryItem = ({ item }) => {
    const { selected } = this.state;
    const isSelected = selected.some(selected => selected.category_id === item.category_id);

    return (
      <TouchableOpacity
        style={styles.itemWrapper}
        onPress={() => this.handleToggleCategory(item)}
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
    return (
      null
      // <GraphQL>
      //   <Query query={GET_CATEGORIES}>
      //     {({ loading, error, data }) => {
      //       if (loading) {
      //         return (
      //           <Spinner visible mode="content" />
      //         );
      //       }

      //       if (error) {
      //         return `Error! ${error.message}`;
      //       }
      //       return (
      //         <View style={styles.container}>
      //           <FlatList
      //             contentContainerStyle={styles.scrollContainer}
      //             data={data.categories}
      //             keyExtractor={item => `${item.category_id}`}
      //             numColumns={1}
      //             renderItem={this.renderCategoryItem}
      //             onEndReachedThreshold={1}
      //             onEndReached={() => this.handleLoadMore()}
      //             ListEmptyComponent={() => this.renderEmptyList()}
      //           />
      //         </View>
      //       );
      //     }}
      //   </Query>
      // </GraphQL>
    );
  }
}

export default connect(
  state => ({
    nav: state.nav,
  })
)(CategoriesPicker);
