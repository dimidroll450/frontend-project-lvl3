const parseToXml = (data) => {
  const parser = new DOMParser();
  return parser.parseFromString(data, 'text/xml');
};

const generateData = (element, key, parent = '') => {
  const result = {
    title: element.querySelector(`${parent} title`).textContent,
    description: element.querySelector(`${parent} description`).textContent,
    url: element.querySelector(`${parent} link`).textContent,
    key,
  };
  return result;
};

export default (data) => {
  const parsed = parseToXml(data);

  const key = 'key';
  const feed = generateData(parsed, key, 'channel');
  const items = parsed.querySelectorAll('item');
  const arrItems = Array.prototype.slice.call(items);

  const posts = arrItems.map((post) => generateData(post, key));

  return { feed, posts: [...posts] };
};
