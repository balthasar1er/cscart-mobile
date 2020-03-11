import { NativeModules, Platform } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const platformLanguage = Platform.OS === 'ios'
  ? NativeModules.SettingsManager.settings.AppleLocale
    || NativeModules.SettingsManager.settings.AppleLanguages[0]
  : NativeModules.I18nManager.localeIdentifier;

export const deviceLanguage = platformLanguage.split('_')[0];

i18n
  .use(initReactI18next)
  .init({
    debug: false,
    lng: deviceLanguage,
    fallbackLng: deviceLanguage,
    resources: {
      en: {
        translation: {
          'Test val': 'Тестовое свойство',
          dd: 'Тестовое свойство',
        }
      }
    }
  });

export default i18n;
