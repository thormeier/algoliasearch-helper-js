const test = require('tape');
const algoliasearchHelper = require('../../../index.js');

test('It should instantiate even with an old client that does not support addAlgoliaAgent', t => {
  const helper = algoliasearchHelper({}, null, {
    facets: ['facetConj'],
    disjunctiveFacets: ['facet'],
  });

  t.ok(helper);
  t.end();
});
