import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      appTitle: 'Поддержи проекты',
      search: 'Поиск',
      category: 'Категория',
      sortBy: 'Сортировка',
      popular: 'Популярные',
      newest: 'Новые',
      ending: 'Почти завершённые',
  all: 'Все',
  physics: 'Физика',
  biology: 'Биология',
  it: 'ИТ',
  engineering: 'Инженерия',
      details: 'Подробнее',
      support: 'Поддержать',
      donate: 'Задонатить',
      amount: 'Сумма',
      close: 'Закрыть',
      thankYou: 'Спасибо за поддержку!',
      register: 'Зарегистрироваться',
      authorCabinet: 'Кабинет автора',
      becomeAuthor: 'Станьте автором и публикуйте свои проекты',
      createProject: 'Создать проект',
      demoNotice: 'Demo • Реальные платежи отключены',
      admin: {
        dashboard: 'Админ-панель',
        projects: 'Проекты',
        users: 'Пользователи',
        donations: 'Донаты',
        settings: 'Настройки',
        approve: 'Одобрить',
        archive: 'В архив',
        preview: 'Просмотр',
        save: 'Сохранить'
      },
      status: {
        pending: 'В ожидании',
        approved: 'Одобрен',
        archived: 'Архив'
      }
    }
  },
  en: {
    translation: {
      appTitle: 'Support Projects',
      search: 'Search',
      category: 'Category',
      sortBy: 'Sort by',
      popular: 'Popular',
      newest: 'Newest',
      ending: 'Ending soon',
      all: 'All',
      physics: 'Physics',
      biology: 'Biology',
      it: 'IT',
      engineering: 'Engineering',
      details: 'Details',
      support: 'Support',
      donate: 'Donate',
      amount: 'Amount',
      close: 'Close',
      thankYou: 'Thank you for your support!',
      register: 'Sign up',
      authorCabinet: 'Author dashboard',
      becomeAuthor: 'Become an author and publish your projects',
      createProject: 'Create project',
      demoNotice: 'Demo • Real payments are disabled',
      admin: {
        dashboard: 'Dashboard',
        projects: 'Projects',
        users: 'Users',
        donations: 'Donations',
        settings: 'Settings',
        approve: 'Approve',
        archive: 'Archive',
        preview: 'Preview',
        save: 'Save'
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false }
});

export default i18n;
