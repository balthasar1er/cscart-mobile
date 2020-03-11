/* eslint-disable global-require */
import { AsyncStorage, I18nManager } from 'react-native';
import { STORE_KEY, RESTORE_STATE } from '../constants';
import API from '../services/api';
import store from '../store';
import i18n, { deviceLanguage } from '../utils/i18n';

const covertLangCodes = (translations = []) => {
  const result = {};

  translations.forEach((translation) => {
    result[`${translation.original_value}`] = translation.value;
  });

  return result;
};

// eslint-disable-next-line import/prefer-default-export
export async function initApp() {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(['ar', 'he'].includes(deviceLanguage));

  const persist = await AsyncStorage.getItem(STORE_KEY);
  if (persist) {
    store.dispatch({
      type: RESTORE_STATE,
      payload: JSON.parse(persist),
    });
  }

  try {
    const transResult = await API.get(`/sra_translations/?name=mobile_app.mobile_&lang_code=${deviceLanguage}`);
    i18n.addResourceBundle(
      deviceLanguage,
      'translation',
      covertLangCodes(transResult.data.langvars),
    );
  } catch (error) {
    let translation;
    const AVAILABLE_LANGS = ['ar', 'ru', 'en', 'fr', 'it', 'es'];

    if (AVAILABLE_LANGS.includes(deviceLanguage)) {
      switch (deviceLanguage) {
        case 'ru':
          translation = require('../config/locales/ru.json');
          break;
        case 'ar':
          translation = require('../config/locales/ar.json');
          break;
        case 'fr':
          translation = require('../config/locales/fr.json');
          break;
        case 'it':
          translation = require('../config/locales/it.json');
          break;
        case 'es':
          translation = require('../config/locales/es.json');
          break;
        default:
          translation = require('../config/locales/en.json');
      }
    }

    i18n.addResourceBundle(
      deviceLanguage,
      'translation',
      translation,
    );
    // eslint-disable-next-line no-console
    console.log('Error loading translations', error);
  }
}
