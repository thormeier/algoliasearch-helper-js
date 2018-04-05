const test = require('tape');
const SearchParameters = require('../../../../src/SearchParameters');

test('Should add a refinement', t => {
  const state0 = SearchParameters.make({
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  });

  t.deepEqual(state0.getHierarchicalRefinement('categories'), []);
  const state1 = state0.addHierarchicalFacetRefinement('categories', 'men');
  t.deepEqual(state1.getHierarchicalRefinement('categories'), ['men']);

  t.end();
});

test('Should throw if there is already a refinement', t => {
  const state0 = SearchParameters.make({
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
      },
    ],
  });

  t.deepEqual(state0.getHierarchicalRefinement('categories'), []);
  const state1 = state0.toggleHierarchicalFacetRefinement(
    'categories',
    'beers'
  );
  t.throws(
    state1.addHierarchicalFacetRefinement.bind(state1, 'categories', 'men')
  );

  t.end();
});

test('Should throw if the facet is not defined', t => {
  const state0 = SearchParameters.make({});

  t.throws(
    state0.addHierarchicalFacetRefinement.bind(state0, 'categories', 'men')
  );

  t.end();
});
