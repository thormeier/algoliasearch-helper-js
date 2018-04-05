const test = require('tape');

const SearchResults = require('../../../src/SearchResults');
const SearchParameters = require('../../../src/SearchParameters');

test('getFacetValues(facetName) returns a list of values using the defaults', t => {
  const data = require('./getFacetValues/disjunctive.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const facetValues = result.getFacetValues('brand');

  const expected = [
    { count: 386, isRefined: true, name: 'Apple' },
    { count: 551, isRefined: false, name: 'Insignia™' },
    { count: 511, isRefined: false, name: 'Samsung' },
  ];

  t.deepEqual(facetValues, expected);

  t.end();
});

test('getFacetValues(facetName) when no order is specified for isRefined the order is descending', t => {
  const data = require('./getFacetValues/disjunctive.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const facetValues = result.getFacetValues('brand', {
    sortBy: ['isRefined'],
  });

  const expected = result.getFacetValues('brand', {
    sortBy: ['isRefined:desc'],
  });

  t.deepEqual(facetValues, expected);

  t.end();
});

test('getFacetValues(facetName) when no order is specified for count the order is descending', t => {
  const data = require('./getFacetValues/disjunctive.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const facetValues = result.getFacetValues('brand', {
    sortBy: ['count'],
  });

  const expected = result.getFacetValues('brand', {
    sortBy: ['count:desc'],
  });

  t.deepEqual(facetValues, expected);

  t.end();
});

test('getFacetValues(facetName) when no order is specified for name the order is ascending', t => {
  const data = require('./getFacetValues/disjunctive.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const facetValues = result.getFacetValues('brand', {
    sortBy: ['name'],
  });

  const expected = result.getFacetValues('brand', {
    sortBy: ['name:asc'],
  });

  t.deepEqual(facetValues, expected);

  t.end();
});

test('getFacetValues(facetName) testing the sort function', t => {
  const data = require('./getFacetValues/disjunctive.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const facetValues = result.getFacetValues('brand', {
    sortBy: (a, b) => a.count - b.count,
  });

  const expected = result.getFacetValues('brand', {
    sortBy: ['count:asc'],
  });

  t.deepEqual(facetValues, expected);

  t.end();
});
