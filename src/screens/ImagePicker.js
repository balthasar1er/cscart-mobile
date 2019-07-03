import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  CameraRoll,
  FlatList,
  Dimensions,
} from 'react-native';
import { bindActionCreators } from 'redux';
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../config/theme';

// Actions
import * as imagePickerActions from '../actions/imagePickerActions';

// Components
import Icon from '../components/Icon';

import i18n from '../utils/i18n';

import {
  iconsMap,
  iconsLoaded,
} from '../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
  imageWrapper: {
    position: 'relative',
  },
  selected: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  selectedIcon: {
    color: '#fff',
  }
});

const IMAGE_NUM_COLUMNS = 4;

class AddProductStep1 extends Component {
  static propTypes = {
    imagePickerActions: PropTypes.shape({
      clear: PropTypes.func,
      toggle: PropTypes.func,
    }),
    selected: PropTypes.arrayOf(PropTypes.string),
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
      photos: [],
      after: null,
      hasMore: true,
    };

    props.navigator.setTitle({
      title: i18n.gettext('Select product image').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const { navigator } = this.props;
    iconsLoaded.then(() => {
      navigator.setButtons({
        leftButtons: [
          {
            id: 'close',
            icon: iconsMap.close,
          },
        ],
      });
    });
    this.getImages();
  }

  onNavigatorEvent(event) {
    const { navigator } = this.props;
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'close') {
        navigator.dismissModal();
      }
    }
  }

  getImages = async () => {
    const { photos, hasMore, after } = this.state;

    if (!hasMore) {
      return;
    }

    try {
      const params = {
        first: 40,
        assetType: 'Photos',
      };

      if (after) {
        params.after = after;
      }

      const images = await CameraRoll.getPhotos(params);

      if (images) {
        const imagesUris = images.edges.map(edge => edge.node.image.uri);
        this.setState({
          photos: [
            ...photos,
            ...imagesUris,
          ],
          hasMore: images.page_info.has_next_page,
          after: images.page_info.end_cursor,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  handleLoadMore = () => this.getImages();

  renderEmptyList = () => (
    <Text style={styles.emptyList}>
      {i18n.gettext('There are no images')}
    </Text>
  );

  renderImage = (image) => {
    const { imagePickerActions, selected } = this.props;
    const isSelected = selected.some(item => item === image.item);
    const IMAGE_WIDTH = Dimensions.get('window').width / IMAGE_NUM_COLUMNS;

    return (
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={() => imagePickerActions.toggle(image)}
      >
        <Image
          key={image}
          style={{
            width: IMAGE_WIDTH,
            height: IMAGE_WIDTH,
          }}
          source={{ uri: image.item }}
        />
        {isSelected && (
          <View style={styles.selected}>
            <Icon name="check-circle" style={styles.selectedIcon} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  render() {
    const { photos } = this.state;
    return (
      <View style={styles.container}>
        <FlatList
          contentContainerStyle={styles.scrollContainer}
          data={photos}
          keyExtractor={item => item}
          numColumns={IMAGE_NUM_COLUMNS}
          renderItem={this.renderImage}
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
    selected: state.imagePicker.selected,
  }),
  dispatch => ({
    imagePickerActions: bindActionCreators(imagePickerActions, dispatch),
  })
)(AddProductStep1);
