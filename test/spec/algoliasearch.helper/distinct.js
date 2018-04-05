const test = require('tape');
const forEach = require('lodash/forEach');

const algoliasearchHelper = require('../../../index.js');
const requestBuilder = require('../../../src/requestBuilder');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('Distinct not set', t => {
  const helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet'],
  });
  const state0 = helper.state;

  let disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    undefined,
    '[disjunctive] distinct should be undefined'
  );
  let facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    undefined,
    '[hits] distinct should be undefined'
  );

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    undefined,
    '[disjunctive][query not empty] distinct should be undefined'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    undefined,
    '[hits][query not empty] distinct should be undefined'
  );
  forEach(requestBuilder._getQueries('', helper.state), q => {
    t.notOk(
      q.hasOwnProperty('distinct'),
      '[hits][query not empty] no distinct should be in the queries by default'
    );
  });

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    undefined,
    '[disjunctive][disjunctive refinement] distinct should be undefined'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    undefined,
    '[hits][disjunctive refinement] distinct should be undefined'
  );
  forEach(requestBuilder._getQueries('', helper.state), q => {
    t.notOk(
      q.hasOwnProperty('distinct'),
      '[hits][disjunctive refinement] no distinct should be in the queries by default'
    );
  });

  helper.setState(state0);
  helper.addRefine('facetConj', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    undefined,
    '[disjunctive][conjunctive refinement] distinct should be undefined'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    undefined,
    '[hits][conjunctive refinement] distinct should be undefined'
  );
  forEach(requestBuilder._getQueries('', helper.state), q => {
    t.notOk(
      q.hasOwnProperty('distinct'),
      '[disjunctive][conjunctive refinement] no distinct should be in the queries by default'
    );
  });

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    undefined,
    '[disjunctive][numeric refinement] distinct should be undefined'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    undefined,
    '[hits][numeric refinement] distinct should be undefined'
  );
  forEach(requestBuilder._getQueries('', helper.state), q => {
    t.notOk(
      q.hasOwnProperty('distinct'),
      'no distinct should be in the queries by default'
    );
  });

  t.end();
});

test('Distinct set to true', t => {
  const helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet'],
  }).setQueryParameter('distinct', true);
  const state0 = helper.state;

  let disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );

  t.equal(
    disjunctiveFacetSearchParam.distinct,
    true,
    '[disjunctive] distinct should be true'
  );

  let facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);

  t.equal(facetSearchParam.distinct, true, '[hits] distinct should be true');

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    true,
    '[disjunctive][query not empty] distinct should be true'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    true,
    '[hits][query not empty] distinct should be true'
  );

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    true,
    '[disjunctive][disjunctive refinement] distinct should be true'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    true,
    '[hits][disjunctive refinement] distinct should be true'
  );

  helper.setState(state0);
  helper.addRefine('facetConj', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    true,
    '[disjunctive][conjunctive refinement] distinct should be true'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    true,
    '[hits][conjunctive refinement] distinct should be true'
  );

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    true,
    '[disjunctive][numeric refinement] distinct should be true'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    true,
    '[hits][numeric refinement] distinct should be true'
  );

  t.end();
});

test('Distinct to false', t => {
  const helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet'],
  }).setQueryParameter('distinct', false);
  const state0 = helper.state;

  let disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );

  t.equal(
    disjunctiveFacetSearchParam.distinct,
    false,
    '[disjunctive] distinct should be false'
  );

  let facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);

  t.equal(facetSearchParam.distinct, false, '[hits] distinct should be false');

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    false,
    '[disjunctive][query not empty] distinct should be false'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    false,
    '[hits][query not empty] distinct should be false'
  );

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    false,
    '[disjunctive][disjunctive refinement] distinct should be false'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    false,
    '[hits][disjunctive refinement] distinct should be false'
  );

  helper.setState(state0);
  helper.addRefine('facetConj', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    false,
    '[disjunctive][conjunctive refinement] distinct should be false'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    false,
    '[hits][conjunctive refinement] distinct should be false'
  );

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    false,
    '[disjunctive][numeric refinement] distinct should be false'
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    false,
    '[hits][numeric refinement] distinct should be false'
  );

  t.end();
});

test('Distinct as a number', t => {
  const distinctValue = 2;
  const helper = algoliasearchHelper(fakeClient, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet'],
  }).setQueryParameter('distinct', distinctValue);

  const state0 = helper.state;

  let disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    distinctValue,
    `[disjunctive] distinct should be ${distinctValue}`
  );

  let facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    distinctValue,
    `[hits] distinct should be ${distinctValue}`
  );

  helper.setState(state0);
  helper.setQuery('not empty');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    distinctValue,
    `[disjunctive][query not empty] distinct should be ${distinctValue}`
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    distinctValue,
    `[hits][query not empty] distinct should be ${distinctValue}`
  );

  helper.setState(state0);
  helper.addDisjunctiveRefine('facet', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    distinctValue,
    `[disjunctive][disjunctive refinement] distinct should be ${distinctValue}`
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    distinctValue,
    `[hits][disjunctive refinement] distinct should be ${distinctValue}`
  );

  helper.setState(state0);
  helper.addRefine('facetConj', 'value');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    distinctValue,
    `[disjunctive][conjunctive refinement] distinct should be ${distinctValue}`
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    distinctValue,
    `[hits][conjunctive refinement] distinct should be ${distinctValue}`
  );

  helper.setState(state0);
  helper.addNumericRefinement('attribute', '>', '0');
  disjunctiveFacetSearchParam = requestBuilder._getDisjunctiveFacetSearchParams(
    helper.state
  );
  t.equal(
    disjunctiveFacetSearchParam.distinct,
    distinctValue,
    `[disjunctive][numeric refinement] distinct should be ${distinctValue}`
  );
  facetSearchParam = requestBuilder._getHitsSearchParams(helper.state);
  t.equal(
    facetSearchParam.distinct,
    distinctValue,
    `[hits][numeric refinement] distinct should be ${distinctValue}`
  );

  t.end();
});
