import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import Swiper from 'react-native-swiper';

// Components
import Icon from '../components/Icon';

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  img: {
    width: '94%',
    height: 400,
    resizeMode: 'contain',
  },
  slide: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnContainer: {
    position: 'absolute',
    top: 0,
    right: 14,
  },
  closeBtn: {
    color: 'black',
  }
});

export default class Gallery extends Component {
  static propTypes = {
    navigator: PropTypes.shape({
      dismissModal: PropTypes.func,
    }),
    images: PropTypes.arrayOf(PropTypes.string),
    activeIndex: PropTypes.number,
  };

  static navigatorStyle = {
    navBarHidden: true,
  };

  render() {
    const { images, navigator, activeIndex } = this.props;
    if (!images.length) {
      return null;
    }
    const items = images.map((href, index) => {
      return (
        <View style={styles.slide} key={index}>
          <Image
            style={styles.img}
            source={{ uri: href }}
          />
        </View>
      );
    });

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Swiper
            horizontal
            index={activeIndex}
          >
            {items}
          </Swiper>
          <TouchableOpacity
            style={styles.closeBtnContainer}
            onPress={() => navigator.dismissModal({ animationType: 'fade' })}
          >
            <Icon
              name="close"
              style={styles.closeBtn}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
}
