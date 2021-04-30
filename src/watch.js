import onChange from 'on-change';

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

const makePost = (post) => {
  const { url, title } = post;
  const item = document.createElement('li');
  item.classList.add('list-group-item');

  const link = document.createElement('a');
  link.classList.add('font-weight-bold');
  link.textContent = title;
  link.href = url;
  item.append(link);
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
    posts.append(list);
  }
};

export default (state, elements) => onChange(state, (path) => {
  const { input, feedback, btn } = elements;
  input.value = state.form.url;
  feedback.textContent = state.feedback;

  if (elements.feeds.childNodes.length === 0 && state.feeds.length !== 0) {
    elements.feeds.append(makeHeaderNode('h2', 'Фиды'));
  }

  if (elements.posts.childNodes.length === 0 && state.posts.length !== 0) {
    elements.posts.append(makeHeaderNode('h2', 'Посты'));
  }

  if (path === 'feeds') {
    renderFeeds(state, elements.feeds);
  }

  if (path === 'posts') {
    renderPosts(state, elements.posts);
  }

  switch (state.form.proccessState) {
    case 'filling':
      btn.disabled = false;
      input.readOnly = false;
      break;
    case 'sending':
      btn.disabled = true;
      input.readOnly = true;
      break;
    default:
      throw new Error('Unknown state');
  }

  if (!state.form.valid) {
    elements.feedback.classList.add('text-danger');
    elements.input.classList.add('is-invalid');
  }

  if (state.form.valid) {
    elements.feedback.classList.remove('text-danger');
    elements.input.classList.remove('is-invalid');
  }
});
