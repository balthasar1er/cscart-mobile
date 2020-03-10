import { NativeModules, Platform } from 'react-native';
import gettext from 'gettext.js';

const platformLanguage = Platform.OS === 'ios'
  ? NativeModules.SettingsManager.settings.AppleLocale
    || NativeModules.SettingsManager.settings.AppleLanguages[0]
  : NativeModules.I18nManager.localeIdentifier;

export const deviceLanguage = platformLanguage.split('_')[0];

const langs = ['ar', 'ru', 'en', 'fr', 'it', 'es', 'pt'];
let jsonData;

if (langs.includes(deviceLanguage)) {
  switch (deviceLanguage) {
    case 'ru':
      jsonData = require('../config/locales/ru.json');
      break;
    case 'ar':
      jsonData = require('../config/locales/ar.json');
      break;
    case 'fr':
      jsonData = require('../config/locales/fr.json');
      break;
    case 'it':
      jsonData = require('../config/locales/it.json');
      break;
    case 'es':
      jsonData = require('../config/locales/es.json');
      break;
    case 'pt':
      jsonData = require('../config/locales/pt.json');
      break;
    default:
      jsonData = require('../config/locales/en.json');
  }

  gettext.setLocale(deviceLanguage);
  gettext.loadJSON(jsonData);
}

export default gettext;
