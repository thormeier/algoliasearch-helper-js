const test = require('tape');

const SearchParameters = require('../../../src/SearchParameters');

test('addFacet should add a facet to the facets list', t => {
  const state = SearchParameters.make({}).addFacet('facet');

  t.deepEquals(state.facets, ['facet']);

  t.end();
});

test('removeFacet should remove a facet from the facets list', t => {
  let state = SearchParameters.make({})
    .addFacet('facet')
    .removeFacet('facet');

  t.deepEquals(state.facets, []);

  state = SearchParameters.make({})
    .addFacet('facet')
    .addFacetRefinement('facet', 'value')
    .removeFacet('facet');

  t.deepEquals(state.facetsRefinements, {});

  t.end();
});

test('addDisjunctiveFacet should add a facet to the disjunctiveFacets list', t => {
  const state = SearchParameters.make({}).addDisjunctiveFacet('facet');

  t.deepEquals(state.disjunctiveFacets, ['facet']);

  t.end();
});

test('removeDisjunctiveFacet should remove a facet from the disjunctiveFacets list', t => {
  let state = SearchParameters.make({})
    .addDisjunctiveFacet('facet')
    .removeDisjunctiveFacet('facet');

  t.deepEquals(state.disjunctiveFacets, []);

  state = SearchParameters.make({})
    .addDisjunctiveFacet('facet')
    .addDisjunctiveFacetRefinement('facet', 'value')
    .removeDisjunctiveFacet('facet');

  t.deepEquals(state.disjunctiveFacetsRefinements, {});

  t.end();
});

test('addHierarchicalFacet should add a facet to the hierarchicalFacets list', t => {
  const state = SearchParameters.make({}).addHierarchicalFacet({
    name: 'facet',
  });

  t.deepEquals(state.hierarchicalFacets, [{ name: 'facet' }]);

  t.end();
});

test('addHierarchicalFacet should throw when a facet with the same name is already declared', t => {
  t.throws(() => {
    SearchParameters.make({
      hierarchicalFacets: [{ name: 'facet' }],
    }).addHierarchicalFacet({ name: 'facet' });
  });

  t.end();
});

test('removeHierarchicalFacet should remove a facet from the hierarchicalFacets list', t => {
  let state = SearchParameters.make({})
    .addHierarchicalFacet({ name: 'facet' })
    .removeHierarchicalFacet('facet');

  t.deepEquals(state.hierarchicalFacets, []);

  state = SearchParameters.make({})
    .addHierarchicalFacet({ name: 'facet' })
    .toggleHierarchicalFacetRefinement('facet', 'value')
    .removeHierarchicalFacet('facet');

  t.deepEquals(state.hierarchicalFacetsRefinements, {});

  t.end();
});
