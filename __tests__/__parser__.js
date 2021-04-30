import fs from 'fs';
import path from 'path';
import parser from '../src/parser.js';

const recieved = {
  feed: {
    title: 'Lorem ipsum feed for an interval of 1 minutes with 10 item(s)',
    description: 'This is a constantly updating lorem ipsum feed',
    url: 'http://example.com/',
    key: 'key',
  },
  posts: [
    {
      title: 'Lorem ipsum 2021-04-27T09:10:00Z',
      description: 'Labore veniam id duis ut eiusmod dolore labore nostrud incididunt excepteur dolore.',
      url: 'http://example.com/test/1619514600',
      key: 'key',
    },
    {
      title: 'Lorem ipsum 2021-04-27T09:09:00Z',
      description: 'Velit cupidatat ut labore nostrud et qui eu culpa do amet occaecat.',
      url: 'http://example.com/test/1619514540',
      key: 'key',
    },
  ],
};

const getFixturePath = (filename) => path.resolve(process.cwd(), '__tests__/__fixtures__', filename);
const readFile = (filename) => fs.readFileSync(getFixturePath(filename), 'utf-8').trim();

test('right parse', () => {
  const actual = parser(readFile('example'), 'key');

  expect(actual).toMatchObject(recieved);
});
