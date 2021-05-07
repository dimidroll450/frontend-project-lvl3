const parseToXml = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'application/xhtml+xml');
};

const generateData = (element, parent = '') => {
  const result = {
    title: element.querySelector(`${parent} title`).textContent,
    description: element.querySelector(`${parent} description`).textContent,
    url: element.querySelector(`${parent} link`).textContent,
  };
  return result;
};

export default (data) => {
  const parsed = parseToXml(data);
  const feed = generateData(parsed, 'channel');
  const items = parsed.querySelectorAll('item');
  const arrItems = Array.prototype.slice.call(items);

  const posts = arrItems.map((post) => generateData(post));

  return { feed, posts: [...posts] };
};
