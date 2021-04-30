import { validateURL } from '../src/application.js';

const urls = ['https://github.com/'];

test('valid', () => {
  expect(validateURL('https://ru.hexlet.io/', urls)).toBe(null);
  expect(validateURL('https://learn.javascript.ru/', urls)).toBe(null);
});

test('invalid', () => {
  expect(validateURL('chto proishodit', urls)).toBe('Ссылка должна быть валидным URL');
  expect(validateURL('https://github.com/', urls)).toBe('RSS уже существует');
});
