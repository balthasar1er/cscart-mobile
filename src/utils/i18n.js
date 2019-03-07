import DeviceInfo from 'react-native-device-info';
import gettext from 'gettext.js';

const langs = ['ar', 'ru', 'en', 'fr'];
let jsonData;
const locale = DeviceInfo.getDeviceLocale().split('-')[0];

if (langs.includes(locale)) {
  switch (locale) {
    case 'ru':
      jsonData = require('../config/locales/ru.json');
      break;
    case 'ar':
      jsonData = require('../config/locales/ar.json');
    case 'fr':
      jsonData = require('../config/locales/fr.json');
      break;
    default:
      jsonData = require('../config/locales/en.json');
  }

  gettext.setLocale(locale);
  gettext.loadJSON(jsonData);
}

export default gettext;
