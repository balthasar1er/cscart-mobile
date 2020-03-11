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
  const locale = deviceLanguage;

  I18nManager.allowRTL(true);
  I18nManager.forceRTL(['ar', 'he'].includes(locale));

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
      'translations',
      covertLangCodes(transResult.data.langvars),
    );
  } catch (error) {
    console.log('Error loading translations', error);
  }
}
