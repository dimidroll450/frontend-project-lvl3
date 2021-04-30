import * as yup from 'yup';
import { uniqueId } from 'lodash';
import axios from 'axios';
import parser from './parser';
import watch from './watch';

const routes = {
  host: 'https://hexlet-allorigins.herokuapp.com/get?url=',
};

const errorsMessage = {
  url: 'Ссылка должна быть валидным URL',
  dublicate: 'RSS уже существует',
  invalidData: 'Ресурс не содержит валидный RSS',
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
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input[aria-label="url"]'),
    btn: document.querySelector('.rss-form button[aria-label="add"]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const watchState = watch(state, elements);

  // ================ Protothype ============================
  const formHandler = (target) => {
    const input = target.querySelector('input');
    const url = input.value.trim();
    watchState.form.url = url;
    const check = validateURL(url, watchState.urls);

    if (check === null) {
      watchState.form.valid = true;
      watchState.feedback = '';
      watchState.form.proccessState = 'sending';

      axios.get(routes.host + url)
        .then((response) => {
          const key = uniqueId();
          const parse = parser(response.data.contents, key);
          const { feed, posts } = parse;

          watchState.posts = [...posts, ...watchState.posts];
          watchState.feeds.unshift(feed);
          watchState.urls.unshift(url);
          watchState.form.url = '';
          watchState.feedback = 'RSS успешно загружен';
          watchState.form.proccessState = 'filling';
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
  // ============================= end ========================

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const { target } = e;
    formHandler(target);
  });
};

export {
  validateURL,
};
