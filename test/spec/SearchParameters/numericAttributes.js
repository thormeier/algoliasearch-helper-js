const test = require('tape');
const forEach = require('lodash/forEach');

const SearchParameters = require('../../../src/SearchParameters');

const stateWithStringForIntegers = {
  minWordSizefor1Typo: '1',
  minWordSizefor2Typos: '2',
  minProximity: '2',
  page: '10',
  hitsPerPage: '500',
  getRankingInfo: '1',
  distinct: '1',
  maxValuesPerFacet: '10',
  aroundRadius: '10',
  aroundPrecision: '2',
  minimumAroundRadius: '234',
};

test('Constructor should parse the numeric attributes', t => {
  const state = new SearchParameters(stateWithStringForIntegers);

  forEach(stateWithStringForIntegers, (v, k) => {
    const parsedValue = parseFloat(v);
    t.equal(state[k], parsedValue, `${k} should be parsed`);
  });

  t.end();
});

test('setQueryParameter should parse the numeric attributes', t => {
  const state0 = new SearchParameters();

  forEach(stateWithStringForIntegers, (v, k) => {
    const parsedValue = parseFloat(v);
    const state1 = state0.setQueryParameter(k, v);
    t.equal(state1[k], parsedValue, `${k} should be parsed`);
  });

  t.end();
});

test('setQueryParameters should parse the numeric attributes', t => {
  const state0 = new SearchParameters();
  const state1 = state0.setQueryParameters(stateWithStringForIntegers);

  forEach(stateWithStringForIntegers, (v, k) => {
    const parsedValue = parseFloat(v);
    t.equal(state1[k], parsedValue, `${k} should be parsed`);
  });

  t.end();
});
