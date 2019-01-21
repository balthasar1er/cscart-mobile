import React from 'react';
import { I18nManager } from 'react-native';
import {
  iconsMap,
} from './navIcons';

function getNavigatorButtons() {
  const buttons = {
    [I18nManager.isRTL ? 'leftButtons' : 'rightButtons']: [
      {
        id: 'cart',
        component: 'CartBtn',
        passProps: {},
      },
      {
        id: 'search',
        icon: iconsMap.search,
      },
    ],
  };

  if (I18nManager.isRTL) {
    buttons.rightButtons = [
      {
        id: 'back',
        icon: iconsMap['keyboard-arrow-right'],
      }
    ];
  }

  return buttons;
}

function getNavigatorBackButton() {
  const buttons = {};

  if (I18nManager.isRTL) {
    buttons.rightButtons = [
      {
        id: 'back',
        icon: iconsMap['keyboard-arrow-right'],
      }
    ];
    buttons.leftButtons = [];
  }

  return buttons;
}

function getWritingDirection() {
  return {
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  };
}

export default {
  getNavigatorBackButton,
  getWritingDirection,
  getNavigatorButtons,
};
