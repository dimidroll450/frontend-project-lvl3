import onChange from 'on-change';
import i18next from 'i18next';

const makeHeaderNode = (type, text) => {
  const element = document.createElement(`${type}`);
  element.textContent = `${text}`;
  return element;
};

const makeFeed = (feed) => {
  const { title, description } = feed;
  const item = document.createElement('li');
  item.classList.add('list-group-item');

  const header = makeHeaderNode('h3', title);
  const paragraph = makeHeaderNode('p', description);
  item.append(header);
  item.append(paragraph);
  return item;
};

const makeModalButton = (key) => {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.setAttribute('type', 'button');
  button.setAttribute('data-toggle', 'modal');
  button.setAttribute('data-target', '#modal');
  button.setAttribute('data-key', `${key}`);
  button.textContent = i18next.t('buttons.show');

  return button;
};

const makePost = (post) => {
  const { url, title, key } = post;
  const item = document.createElement('li');
  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

  const link = document.createElement('a');
  link.classList.add('font-weight-bold');
  link.setAttribute('target', '_blank');
  link.textContent = title;
  link.href = url;

  const button = makeModalButton(key);

  item.append(link);
  item.append(button);
  return item;
};

const renderFeeds = (state, feeds) => {
  const oldList = feeds.querySelector('ul');
  const list = document.createElement('ul');
  list.classList.add('list-group', 'mb-5');
  state.feeds.forEach((feed) => {
    const item = makeFeed(feed);
    list.append(item);
  });

  if (oldList) {
    feeds.replaceChild(list, oldList);
  } else {
    feeds.append(makeHeaderNode('h2', i18next.t('headers.feeds')));
    feeds.append(list);
  }
};

const renderPosts = (state, posts) => {
  const oldList = posts.querySelector('ul');
  const list = document.createElement('ul');
  list.classList.add('list-group');
  state.posts.forEach((post) => {
    const item = makePost(post);
    list.append(item);
  });

  if (oldList) {
    posts.replaceChild(list, oldList);
  } else {
    posts.append(makeHeaderNode('h2', i18next.t('headers.posts')));
    posts.append(list);
  }
};

export default (state, elements) => onChange(state, (path, value) => {
  const {
    input, feedback, btn, modalBtnRead, modalTitle, modalBody,
  } = elements;

  switch (path) {
    case 'feeds':
      renderFeeds(state, elements.feeds);
      break;
    case 'posts':
      renderPosts(state, elements.posts);
      break;
    case 'form.url':
      input.value = state.form.url;
      break;
    case 'feedback':
      feedback.textContent = state.feedback;
      break;
    default:
      break;
  }

  switch (value) {
    case 'filling':
      btn.disabled = false;
      input.readOnly = false;
      break;
    case 'sending':
      btn.disabled = true;
      input.readOnly = true;
      break;
    case false:
      elements.feedback.classList.add('text-danger');
      elements.input.classList.add('is-invalid');
      break;
    case true:
      elements.feedback.classList.remove('text-danger');
      elements.input.classList.remove('is-invalid');
      break;
    default:
      break;
  }

  if (path.includes('modal')) {
    switch (path) {
      case 'modal.title':
        modalTitle.textContent = state.modal.title;
        break;
      case 'modal.description':
        modalBody.textContent = state.modal.description;
        break;
      case 'modal.url':
        modalBtnRead.href = state.modal.url;
        break;
      default:
        break;
    }
  }
});
