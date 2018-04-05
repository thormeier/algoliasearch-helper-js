const test = require('tape');
const SearchParameters = require('../../../src/SearchParameters');
const keys = require('lodash/keys');
const map = require('lodash/map');
const uniq = require('lodash/uniq');
const shortener = require('../../../src/SearchParameters/shortener');

test('Should encode all the properties of AlgoliaSearchHelper properly', t => {
  const ks = keys(new SearchParameters());
  const encodedKs = uniq(map(ks, shortener.encode));
  t.equals(
    encodedKs.length,
    ks.length,
    'Once all the properties converted and dedup, their length should be equal'
  );
  const decodedKs = map(encodedKs, shortener.decode);
  t.deepEquals(decodedKs, ks, 'Encode then decode should be the initial value');
  t.end();
});
