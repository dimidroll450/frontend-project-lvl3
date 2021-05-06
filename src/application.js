import * as yup from 'yup';
import * as _ from 'lodash';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales';
import parser from './parser';
import watch from './watch';

const timeToCheck = 5000;

const routes = {
  host: 'https://hexlet-allorigins.herokuapp.com/get?url=',
};

i18next.init({
  lng: window.navigator.language,
  debug: false,
  resources,
});

const errorsMessage = {
  url: i18next.t('errors.url'),
  dublicate: i18next.t('errors.dublicate'),
  invalidData: i18next.t('errors.invalidData'),
};

const validateURL = (url, urls) => {
  const schema = yup
    .string()
    .url(errorsMessage.url)
    .notOneOf(urls, errorsMessage.dublicate)
    .required();

  try {
    schema.validateSync(url);
    return null;
  } catch (e) {
    return e.message;
  }
};

const setId = (data, feedKey = '') => {
  const newData = _.cloneDeep(data);
  newData.key = _.uniqueId();

  if (feedKey.length !== 0) {
    newData.feedKey = feedKey;
  }

  return newData;
};

const setIdPosts = (posts, feedId) => posts.map((post) => setId(setId(post), feedId));

const get = (url) => {
  const urlWithHost = routes.host + url;

  return axios.get(urlWithHost)
    .then((response) => response.data.contents);
};

const checkNewPosts = (url, state, callback) => {
  setTimeout(() => {
    get(url)
      .then((contents) => {
        callback(contents, state);
        checkNewPosts(url, state, callback);
      });
  }, timeToCheck);
};

const addNewPosts = (data, state) => {
  const { posts } = parser(data);
  const oldPosts = state.posts;
  const { feedKey } = oldPosts[0];

  const newPosts = _.differenceBy(posts, oldPosts, 'url');
  if (newPosts.length === 0) return;
  const newPostswithId = setIdPosts(newPosts, feedKey);
  // eslint-disable-next-line no-param-reassign
  state.posts = [...newPostswithId, ...state.posts];
};

export default () => {
  const state = {
    urls: [],
    feeds: [],
    posts: [],
    feedback: null,
    form: {
      proccessState: 'filling',
      url: '',
      valid: 'valid',
    },
    stateUI: {
      modal: {
        title: '',
        description: '',
        url: '',
      },
      visited: new Set(),
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input[aria-label="url"]'),
    btn: document.querySelector('.rss-form button[aria-label="add"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalBtnRead: document.querySelector('#read-completely'),
    modalDismiss: document.querySelector('#close'),
  };

  const watchState = watch(state, elements);

  elements.modalBtnRead.textContent = i18next.t('buttons.read');
  elements.modalDismiss.textContent = i18next.t('buttons.close');

  const formHandler = (target) => {
    const input = target.querySelector('input');
    const url = input.value.trim();
    watchState.form.url = url;
    const check = validateURL(url, watchState.urls);

    if (check === null) {
      watchState.form.valid = true;
      watchState.feedback = '';
      watchState.form.proccessState = 'sending';

      get(url)
        .then((data) => {
          const parse = parser(data);
          const feed = setId(parse.feed);
          const posts = setIdPosts(parse.posts, feed.key);

          watchState.posts = [...posts, ...watchState.posts];
          watchState.feeds.unshift(feed);
          watchState.urls.unshift(url);
          watchState.form.url = '';
          watchState.feedback = i18next.t('success');
          watchState.form.proccessState = 'filling';

          checkNewPosts(url, watchState, addNewPosts);
        })
        .catch(() => {
          watchState.form.valid = false;
          watchState.form.url = url;
          watchState.form.proccessState = 'filling';
          watchState.feedback = errorsMessage.invalidData;
        });
    } else {
      watchState.form.valid = false;
      watchState.feedback = check;
    }
  };

  elements.posts.addEventListener('click', (e) => {
    const { target } = e;
    const key = target.getAttribute('data-key');

    if (key === null) return;

    const index = _.findIndex(watchState.posts, (o) => o.key === key);
    const data = watchState.posts[index];
    watchState.stateUI.modal.title = data.title;
    watchState.stateUI.modal.description = data.description;
    watchState.stateUI.modal.url = data.url;
    watchState.stateUI.visited.add(key);
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const { target } = e;
    formHandler(target);
  });
};
