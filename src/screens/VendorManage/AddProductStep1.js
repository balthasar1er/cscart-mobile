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
import EStyleSheet from 'react-native-extended-stylesheet';

// Styles
import theme from '../../config/theme';

// Components
import Section from '../../components/Section';
import Icon from '../../components/Icon';
import StepsLine from '../../components/StepsLine';

import i18n from '../../utils/i18n';
import { registerDrawerDeepLinks } from '../../utils/deepLinks';

import {
  iconsMap,
  iconsLoaded,
} from '../../utils/navIcons';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$grayColor',
  },
  scrollContainer: {
    paddingBottom: 14,
  },
  header: {
    marginBottom: 20,
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
    showBack: PropTypes.bool,
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
      selected: [],
      after: null,
      hasMore: true,
    };

    props.navigator.setTitle({
      title: i18n.gettext('Select product image').toUpperCase(),
    });

    props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentWillMount() {
    const { navigator, showBack } = this.props;
    iconsLoaded.then(() => {
      navigator.setButtons({
        leftButtons: [
          showBack ? {} : {
            id: 'sideMenu',
            icon: iconsMap.menu,
          },
        ],
        rightButtons: [
          {
            title: i18n.gettext('Next'),
            id: 'next',
            showAsAction: 'ifRoom',
            buttonColor: theme.$primaryColor,
            buttonFontSize: 16,
          },
        ],
      });
    });

    this.getImages();
  }

  onNavigatorEvent(event) {
    const { selected } = this.state;
    const { navigator } = this.props;
    registerDrawerDeepLinks(event, navigator);
    if (event.type === 'NavBarButtonPress') {
      if (event.id === 'sideMenu') {
        navigator.toggleDrawer({ side: 'left' });
      }
      if (event.id === 'next') {
        navigator.push({
          screen: 'VendorManageAddProductStep2',
          backButtonTitle: '',
          passProps: {
            stepsData: {
              images: selected,
            },
          },
        });
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

  handleToggleImage = (image) => {
    const { selected } = this.state;

    if (selected.some(item => image.item === item)) {
      this.setState({
        selected: selected.filter(item => image.item !== item),
      });
      return;
    }

    this.setState({
      selected: [
        ...selected,
        image.item,
      ]
    });
  }

  renderHeader = () => (
    <View style={styles.header}>
      <StepsLine step={1} total={5} />
    </View>
  );

  renderEmptyList = () => (
    <Text style={styles.emptyList}>
      {i18n.gettext('There are no images')}
    </Text>
  );

  renderImage = (image) => {
    const { selected } = this.state;
    const isSelected = selected.some(item => item === image.item);
    const IMAGE_WIDTH = Dimensions.get('window').width / IMAGE_NUM_COLUMNS;

    return (
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={() => this.handleToggleImage(image)}
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
          ListHeaderComponent={() => this.renderHeader()}
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
    nav: state.nav,
  })
)(AddProductStep1);
