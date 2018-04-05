const test = require('tape');
const algoliasearchHelper = require('../../../index');
const forEach = require('lodash/forEach');
const keys = require('lodash/keys');
const isEmpty = require('lodash/isEmpty');
const isUndefined = require('lodash/isUndefined');

function fixture() {
  const helper = algoliasearchHelper({ addAlgoliaAgent() {} }, 'Index', {
    facets: ['facet1', 'facet2', 'both_facet', 'excluded1', 'excluded2'],
    disjunctiveFacets: ['disjunctiveFacet1', 'disjunctiveFacet2', 'both_facet'],
    hierarchicalFacets: [
      {
        facetName: 'hierarchy',
        attributes: ['a', 'b', 'c'],
      },
    ],
  });

  return helper
    .toggleRefine('facet1', '0')
    .toggleRefine('facet2', '0')
    .toggleRefine('disjunctiveFacet1', '0')
    .toggleRefine('disjunctiveFacet2', '0')
    .toggleExclude('excluded1', '0')
    .toggleExclude('excluded2', '0')
    .addNumericRefinement('numeric1', '>=', '0')
    .addNumericRefinement('numeric1', '<', '10')
    .addNumericRefinement('numeric2', '>=', 0)
    .addNumericRefinement('numeric2', '<', 10);
}

test('Check that the state objects match how we test them', t => {
  const helper = fixture();

  t.deepEqual(helper.state.facetsRefinements, { facet1: ['0'], facet2: ['0'] });
  t.deepEqual(helper.state.disjunctiveFacetsRefinements, {
    disjunctiveFacet1: ['0'],
    disjunctiveFacet2: ['0'],
  });
  t.deepEqual(helper.state.facetsExcludes, {
    excluded1: ['0'],
    excluded2: ['0'],
  });
  t.deepEqual(helper.state.numericRefinements, {
    numeric1: { '>=': [0], '<': [10] },
    numeric2: { '>=': [0], '<': [10] },
  });

  t.end();
});

test('Clear with a name should work on every type and not remove others than targetted name', t => {
  const helper = fixture();

  helper.clearRefinements('facet1');
  t.deepEqual(helper.state.facetsRefinements, { facet2: ['0'] });

  helper.clearRefinements('disjunctiveFacet1');
  t.deepEqual(helper.state.disjunctiveFacetsRefinements, {
    disjunctiveFacet2: ['0'],
  });

  helper.clearRefinements('excluded1');
  t.deepEqual(helper.state.facetsExcludes, { excluded2: ['0'] });

  helper.clearRefinements('numeric1');
  t.deepEqual(helper.state.numericRefinements, {
    numeric2: { '>=': [0], '<': [10] },
  });

  t.end();
});

test('Clearing the same field from multiple elements should remove it everywhere', t => {
  const helper = fixture();

  helper
    .addNumericRefinement('facet1', '>=', '10')
    .toggleExclude('facet1', 'value');

  t.deepEqual(helper.state.facetsRefinements.facet1, ['0']);
  t.deepEqual(helper.state.numericRefinements.facet1, { '>=': [10] });
  t.deepEqual(helper.state.facetsExcludes.facet1, ['value']);

  helper.clearRefinements('facet1');
  t.assert(isUndefined(helper.state.facetsRefinements.facet1));
  t.assert(isUndefined(helper.state.numericRefinements.facet1));
  t.assert(isUndefined(helper.state.facetsExcludes.facet1));

  t.end();
});

test('Clear with a function: neutral predicate', t => {
  const helper = fixture();
  const state0 = helper.state;

  helper.clearRefinements(() => false);

  t.deepEqual(
    helper.state.numericRefinements,
    state0.numericRefinements,
    'Neutral op: numeric ref should be equal'
  );
  t.deepEqual(
    helper.state.facetsRefinements,
    state0.facetsRefinements,
    'Neutral op: conj ref should be equal'
  );
  t.deepEqual(
    helper.state.facetsExcludes,
    state0.facetsExcludes,
    'Neutral op: exclude ref should be equal'
  );
  t.deepEqual(
    helper.state.disjunctiveFacetsRefinements,
    state0.disjunctiveFacetsRefinements,
    'Neutral op: disj ref should be equal'
  );

  t.end();
});

test('Clear with a function: remove all predicate', t => {
  const helper = fixture();

  helper.clearRefinements(() => true);

  t.assert(
    isEmpty(helper.state.numericRefinements),
    'remove all numericRefinements'
  );
  t.assert(
    isEmpty(helper.state.facetsRefinements),
    'remove all facetsRefinements'
  );
  t.assert(isEmpty(helper.state.facetsExcludes), 'remove all facetsExcludes');
  t.assert(
    isEmpty(helper.state.disjunctiveFacetsRefinements),
    'remove all disjunctiveFacetsRefinements'
  );

  t.end();
});

test('Clear with a function: filtering', t => {
  const helper = fixture();

  const checkType = {
    numeric: false,
    disjunctiveFacet: false,
    conjunctiveFacet: false,
    exclude: false,
  };

  helper.clearRefinements((value, key, type) => {
    checkType[type] = true;

    return key.indexOf('1') !== -1;
  });

  t.equal(keys(checkType).length, 4, 'There should be only 4 refinements');
  forEach(checkType, (typeTest, type) => {
    t.ok(typeTest, `clear should go through: ${type}`);
  });

  t.deepEqual(helper.state.facetsRefinements, { facet2: ['0'] });
  t.deepEqual(helper.state.disjunctiveFacetsRefinements, {
    disjunctiveFacet2: ['0'],
  });
  t.deepEqual(helper.state.facetsExcludes, { excluded2: ['0'] });
  t.deepEqual(helper.state.numericRefinements, {
    numeric2: { '>=': [0], '<': [10] },
  });

  t.end();
});

test('Clearing twice the same attribute should be not problem', t => {
  const helper = fixture();

  t.deepEqual(helper.state.facetsRefinements.facet1, ['0']);
  helper.clearRefinements('facet1');
  t.assert(isUndefined(helper.state.facetsRefinements.facet1));
  t.doesNotThrow(() => {
    helper.clearRefinements('facet1');
  });

  t.deepEqual(helper.state.disjunctiveFacetsRefinements.disjunctiveFacet1, [
    '0',
  ]);
  helper.clearRefinements('disjunctiveFacet1');
  t.assert(
    isUndefined(helper.state.disjunctiveFacetsRefinements.disjunctiveFacet1)
  );
  t.doesNotThrow(() => {
    helper.clearRefinements('disjunctiveFacet1');
  });

  t.deepEqual(helper.state.facetsExcludes.excluded1, ['0']);
  helper.clearRefinements('excluded1');
  t.assert(isUndefined(helper.state.facetsExcludes.excluded1));
  t.doesNotThrow(() => {
    helper.clearRefinements('excluded1');
  });

  t.deepEqual(helper.state.numericRefinements.numeric1, {
    '>=': [0],
    '<': [10],
  });
  helper.clearRefinements('numeric1');
  t.assert(isUndefined(helper.state.numericRefinements.numeric1));
  t.doesNotThrow(() => {
    helper.clearRefinements('numeric1');
  });

  t.end();
});

test('Clearing without parameters should clear everything', t => {
  const helper = fixture();

  helper.clearRefinements();

  t.deepEqual(
    helper.state.numericRefinements,
    {},
    'Numeric refinements should be empty'
  );
  t.deepEqual(
    helper.state.facetsRefinements,
    {},
    'Facets refinements should be empty'
  );
  t.deepEqual(
    helper.state.disjunctiveFacetsRefinements,
    {},
    'Disjunctive facets refinements should be empty'
  );
  t.deepEqual(
    helper.state.hierarchicalFacetsRefinements,
    {},
    'Hierarchical facets refinements should be empty'
  );

  t.end();
});

test('Clearing with no effect should not update the state', t => {
  const helper = fixture();
  // Reset the state
  helper.clearRefinements();
  const emptyState = helper.state;
  // This operation should not update the reference to the state
  helper.clearRefinements();

  t.equal(
    helper.state.numericRefinements,
    emptyState.numericRefinements,
    'Numeric refinements should be empty'
  );
  t.equal(
    helper.state.facetsRefinements,
    emptyState.facetsRefinements,
    'Facets refinements should be empty'
  );
  t.equal(
    helper.state.disjunctiveFacetsRefinements,
    emptyState.disjunctiveFacetsRefinements,
    'Disjunctive facets refinements should be empty'
  );
  t.equal(
    helper.state.hierarchicalFacetsRefinements,
    emptyState.hierarchicalFacetsRefinements,
    'Hierarchical facets refinements should be empty'
  );

  t.equal(helper.state, emptyState, 'State should remain the same');

  t.end();
});

test('Clearing with no effect should not update the state, if used with an unknown attribute', t => {
  const helper = fixture();
  const initialState = helper.state;
  // This operation should not update the reference to the state
  helper.clearRefinements('unknown');

  t.equal(
    helper.state.numericRefinements,
    initialState.numericRefinements,
    'Numeric refinements should be empty'
  );
  t.equal(
    helper.state.facetsRefinements,
    initialState.facetsRefinements,
    'Facets refinements should be empty'
  );
  t.equal(
    helper.state.disjunctiveFacetsRefinements,
    initialState.disjunctiveFacetsRefinements,
    'Disjunctive facets refinements should be empty'
  );
  t.equal(
    helper.state.hierarchicalFacetsRefinements,
    initialState.hierarchicalFacetsRefinements,
    'Hierarchical facets refinements should be empty'
  );

  t.equal(helper.state, initialState, 'State should remain the same');

  t.end();
});
