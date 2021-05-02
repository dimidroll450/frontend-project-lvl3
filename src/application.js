import * as yup from 'yup';
import * as _ from 'lodash';
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

const addId = (data) => {
  const newData = _.cloneDeep(data);
  newData.key = _.uniqueId();
  return newData;
};

const addIdParsedData = (data) => {
  const oldFeed = data.feed;
  const oldPosts = data.posts;

  const feed = addId(oldFeed);
  const posts = oldPosts.map((post) => addId(post));

  return { feed, posts };
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
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalBtnRead: document.querySelector('#read-completely'),
  };

  const watchState = watch(state, elements);

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
          const parse = parser(response.data.contents);
          const idData = addIdParsedData(parse);
          const { feed, posts } = idData;

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

  elements.posts.addEventListener('click', (e) => {
    const { target } = e;
    const key = target.getAttribute('data-key');
    if (key === null) return;

    const index = _.findIndex(watchState.posts, (o) => o.key === key);
    const data = watchState.posts[index];
    elements.modalTitle.textContent = data.title;
    elements.modalBody.textContent = data.description;
    elements.modalBtnRead.href = data.url;
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const { target } = e;
    formHandler(target);
  });
};

export {
  validateURL,
};
