const test = require('tape');

const SearchParameters = require('../../../src/SearchParameters');

test('[No changes] setHitsPerPage', t => {
  const state = SearchParameters.make({
    hitsPerPage: 2,
  });

  t.equal(
    state.setHitsPerPage(2),
    state,
    'setHitsPerPage should return the same instance'
  );

  t.end();
});

test('[No changes] setTypoTolerance', t => {
  const state = SearchParameters.make({
    typoTolerance: true,
  });

  t.equal(
    state.setTypoTolerance(true),
    state,
    'setTypoTolerance should return the same instance'
  );

  t.end();
});

test('[No changes] setPage', t => {
  const state = SearchParameters.make({
    page: 2,
  });

  t.equal(state.setPage(2), state, 'setPage should return the same instance');

  t.end();
});

test('[No changes] setQuery', t => {
  const state = SearchParameters.make({
    query: 'query',
  });

  t.equal(
    state.setQuery('query'),
    state,
    'setQuery should return the same instance'
  );

  t.end();
});

test('[No changes] addFacet', t => {
  const state = SearchParameters.make({}).addFacet('facet');

  t.equal(
    state.addFacet('facet'),
    state,
    'addFacet should return the same instance'
  );

  t.end();
});

test('[No changes] removeFacet', t => {
  const state = SearchParameters.make({});

  t.equal(
    state.removeFacet('facet'),
    state,
    'removeFacet should return the same instance'
  );

  t.end();
});

test('[No changes] addDisjunctiveFacet', t => {
  const state = SearchParameters.make({}).addDisjunctiveFacet('facet');

  t.equal(
    state.addDisjunctiveFacet('facet'),
    state,
    'addDisjunctiveFacet should return the same instance'
  );

  t.end();
});

test('[No changes] removeDisjunctiveFacet', t => {
  const state = SearchParameters.make({});

  t.equal(
    state.removeDisjunctiveFacet('facet'),
    state,
    'removeDisjunctiveFacet should return the same instance'
  );

  t.end();
});

test('[No changes] removeHierarchicalFacet', t => {
  const state = SearchParameters.make({});

  t.equal(
    state.removeHierarchicalFacet('facet'),
    state,
    'removeHierarchicalFacet should return the same instance'
  );

  t.end();
});

test('[No changes] addTagRefinement', t => {
  const state = SearchParameters.make({}).addTagRefinement('tag');

  t.equal(
    state.addTagRefinement('tag'),
    state,
    'addTagRefinement should return the same instance'
  );

  t.end();
});

test('[No changes] clearTags', t => {
  const state = SearchParameters.make({
    query: 'query',
  });

  t.equal(
    state.clearTags(),
    state,
    'clearTags should return the same instance'
  );

  t.end();
});

test('[No changes] addDisjunctiveFacetRefinement', t => {
  const state = SearchParameters.make({
    disjunctiveFacets: ['facet'],
  }).addDisjunctiveFacetRefinement('facet', 'value');

  t.equal(
    state.addDisjunctiveFacetRefinement('facet', 'value'),
    state,
    'addDisjunctiveFacetRefinement should return the same instance'
  );

  t.end();
});

test('[No changes] removeDisjunctiveFacetRefinement', t => {
  const state = SearchParameters.make({
    disjunctiveFacets: ['facet'],
  });

  t.equal(
    state.removeDisjunctiveFacetRefinement('facet', 'value'),
    state,
    'removeDisjunctiveFacetRefinement should return the same instance'
  );

  t.end();
});

test('[No changes] addFacetRefinement', t => {
  const state = SearchParameters.make({
    facets: ['facet'],
  }).addFacetRefinement('facet', 'value');

  t.equal(
    state.addFacetRefinement('facet', 'value'),
    state,
    'addFacetRefinement should return the same instance'
  );

  t.end();
});

test('[No changes] removeDisjunctiveFacetRefinement', t => {
  const state = SearchParameters.make({
    disjunctiveFacets: ['facet'],
  });

  t.equal(
    state.removeDisjunctiveFacetRefinement('facet', 'value'),
    state,
    'removeDisjunctiveFacetRefinement should return the same instance'
  );

  t.end();
});

test('[No changes] addNumericRefinement', t => {
  const state = SearchParameters.make({}).addNumericRefinement(
    'attribute',
    '>',
    0
  );

  t.equal(
    state.addNumericRefinement('attribute', '>', 0),
    state,
    'addNumericRefinement should return the same instance'
  );

  t.end();
});

test('[No changes] removeNumericRefinement', t => {
  const state = SearchParameters.make({});

  t.equal(
    state.removeNumericRefinement('attribute', '>'),
    state,
    'removeNumericRefinement should return the same instance'
  );

  t.end();
});

test('[No changes] setQueryParameter', t => {
  const state = SearchParameters.make({
    minWordSizefor1Typo: 50,
  });

  t.equal(
    state.setQueryParameter('minWordSizefor1Typo', 50),
    state,
    'setQueryParameter should return the same instance'
  );

  t.end();
});
