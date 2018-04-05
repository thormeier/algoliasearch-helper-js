const test = require('tape');
const filter = require('lodash/filter');
const forEach = require('lodash/forEach');
const find = require('lodash/find');

const SearchResults = require('../../../src/SearchResults');
const SearchParameters = require('../../../src/SearchParameters');

test('getRefinements(facetName) returns an empty array when there is no refinements set', t => {
  const data = require('./getRefinements/noFilters.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const refinements = result.getRefinements();

  t.deepEqual(refinements, []);

  t.end();
});

function hasSameNames(l1, l2) {
  let res = true;
  forEach(l1, e => {
    const l2MatchingNameElement = find(l2, { name: e.name });
    if (!l2MatchingNameElement) res = false;
  });
  return res;
}

test('getRefinements(facetName) returns a refinement(facet) when a facet refinement is set', t => {
  const data = require('./getRefinements/conjunctive-brand-apple.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const refinements = result.getRefinements();
  const facetValues = result.getFacetValues('brand');
  const refinedFacetValues = filter(facetValues, f => f.isRefined === true);

  const expected = [
    {
      attributeName: 'brand',
      count: 386,
      exhaustive: true,
      name: 'Apple',
      type: 'facet',
    },
  ];

  t.deepEqual(refinements, expected);
  t.equal(refinements.length, refinedFacetValues.length);
  t.ok(hasSameNames(refinements, refinedFacetValues));

  t.end();
});

test('getRefinements(facetName) returns a refinement(exlude) when a facet exclusion is set', t => {
  const data = require('./getRefinements/exclude-apple.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const refinements = result.getRefinements();
  const facetValues = result.getFacetValues('brand');
  const refinedFacetValues = filter(facetValues, f => f.isExcluded === true);

  const expected = [
    {
      attributeName: 'brand',
      count: 0,
      exhaustive: true,
      name: 'Apple',
      type: 'exclude',
    },
  ];

  t.deepEqual(refinements, expected);
  t.equal(refinements.length, refinedFacetValues.length);
  t.ok(hasSameNames(refinements, refinedFacetValues));

  t.end();
});

test('getRefinements(facetName) returns a refinement(disjunctive) when a disjunctive refinement is set', t => {
  const data = require('./getRefinements/disjunctive-type-trendcase.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const refinements = result.getRefinements();
  const facetValues = result.getFacetValues('type');
  const refinedFacetValues = filter(facetValues, f => f.isRefined === true);

  const expected = [
    {
      attributeName: 'type',
      count: 537,
      exhaustive: true,
      name: 'Trend cases',
      type: 'disjunctive',
    },
  ];

  t.deepEqual(refinements, expected);
  t.equal(refinements.length, refinedFacetValues.length);
  t.ok(hasSameNames(refinements, refinedFacetValues));

  t.end();
});

test('getRefinements(facetName) returns a refinement(hierarchical) when a disjunctive refinement is set', t => {
  const data = require('./getRefinements/hierarchical-cards.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const refinements = result.getRefinements();

  t.deepEqual(refinements, [
    {
      attributeName: 'hierarchicalCategories',
      count: 0,
      exhaustive: false,
      name: 'Best Buy Gift Cards > Entertainment Gift Cards',
      type: 'hierarchical',
    },
  ]);

  t.end();
});

test('getRefinements(facetName) returns a refinement(numeric) when a numeric filter is set', t => {
  const data = require('./getRefinements/numeric-rating-3.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const refinements = result.getRefinements();

  t.deepEqual(refinements, [
    {
      attributeName: 'rating',
      name: 3,
      numericValue: 3,
      operator: '=',
      type: 'numeric',
    },
  ]);

  t.end();
});

test('getRefinements(facetName) returnes a refinement(tag) when a tag is set', t => {
  const data = require('./getRefinements/dummy-tags.json');
  const searchParams = new SearchParameters(data.state);
  const result = new SearchResults(searchParams, data.content.results);

  const refinements = result.getRefinements();

  t.deepEqual(refinements, [
    { attributeName: '_tags', name: 'foo', type: 'tag' },
    { attributeName: '_tags', name: 'bar', type: 'tag' },
  ]);

  t.end();
});
