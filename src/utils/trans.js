import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    debug: true,
    lng: 'en',
    fallbackLng: 'en',
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
