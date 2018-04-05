const test = require('tape');
const forOwn = require('lodash/forOwn');
const SearchParameters = require('../../../src/SearchParameters');

test('Constructor should accept an object with known keys', t => {
  const legitConfig = {
    query: '',
    disjunctiveFacets: [
      'customerReviewCount',
      'category',
      'salePrice_range',
      'manufacturer',
    ],
    maxValuesPerFacet: 30,
    page: 0,
    hitsPerPage: 10,
    facets: ['type', 'shipping'],
  };
  const params = new SearchParameters(legitConfig);
  forOwn(legitConfig, (v, k) => {
    t.deepEqual(params[k], v);
  });

  t.end();
});

test('Constructor should accept an object with unknown keys', t => {
  const betaConfig = {
    query: '',
    disjunctiveFacets: [
      'customerReviewCount',
      'category',
      'salePrice_range',
      'manufacturer',
    ],
    maxValuesPerFacet: 30,
    page: 0,
    hitsPerPage: 10,
    facets: ['type', 'shipping'],
    betaParameter: true,
    otherBetaParameter: ['alpha', 'omega'],
  };
  const params = new SearchParameters(betaConfig);
  forOwn(betaConfig, (v, k) => {
    t.deepEqual(params[k], v);
  });

  t.end();
});

test('Factory should accept an object with known keys', t => {
  const legitConfig = {
    query: '',
    disjunctiveFacets: [
      'customerReviewCount',
      'category',
      'salePrice_range',
      'manufacturer',
    ],
    maxValuesPerFacet: 30,
    page: 0,
    hitsPerPage: 10,
    facets: ['type', 'shipping'],
  };
  const params = SearchParameters.make(legitConfig);
  forOwn(legitConfig, (v, k) => {
    t.deepEqual(params[k], v);
  });

  t.end();
});

test('Constructor should accept an object with unknown keys', t => {
  const betaConfig = {
    query: '',
    disjunctiveFacets: [
      'customerReviewCount',
      'category',
      'salePrice_range',
      'manufacturer',
    ],
    maxValuesPerFacet: 30,
    page: 0,
    hitsPerPage: 10,
    facets: ['type', 'shipping'],
    betaParameter: true,
    otherBetaParameter: ['alpha', 'omega'],
  };
  const params = SearchParameters.make(betaConfig);
  forOwn(betaConfig, (v, k) => {
    t.deepEqual(params[k], v);
  });

  t.end();
});
