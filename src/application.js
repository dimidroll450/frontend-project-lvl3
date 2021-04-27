import * as yup from 'yup';
import axios from 'axios';
import parser from './parser';
import watch from './watch';

const routes = {
  host: 'https://hexlet-allorigins.herokuapp.com/get?url=',
};

const validateURL = (url, feeds) => {
  const urls = feeds.map((feed) => feed.url);
  const schema = yup
    .string()
    .url('Ссылка должна быть валидным URL')
    .notOneOf(urls, 'RSS уже существует')
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
    feeds: [],
    posts: [],
    feedback: null,
    form: {
      input: 'enabled',
      button: 'enabled',
      url: '',
      valid: 'valid',
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input[type="url"]'),
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
    const check = validateURL(url, state.feeds);

    if (check === null) {
      axios.get(routes.host + url)
        .then((response) => {
          const parse = parser(response.data.contents);
          const { feed, posts } = parse;

          watchState.posts = [...watchState.posts, ...posts];
          watchState.feeds.push(feed);
          watchState.form.url = '';
          watchState.form.valid = true;
          watchState.feedback = 'RSS успешно загружен';
        })
        .catch(() => {
          watchState.valid = false;
          watchState.form.url = url;
          watchState.feedback = 'Ресурс не содержит валидный RSS';
        });
    } else {
      watchState.valid = false;
      watchState.feedback = check;
    }
  };
  // ============================= end ========================

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();

    const { target } = e;
    formHandler(target);
  });
};

export {
  validateURL,
};
