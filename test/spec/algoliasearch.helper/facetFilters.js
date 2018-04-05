// Make sure we do facet filters correctly before sending them to algolia

const test = require('tape');
const algoliasearchHelper = require('../../../index');
const requestBuilder = require('../../../src/requestBuilder');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('The filters should contain the different filters for a single conjunctive facet with multiple refinements', t => {
  const facetName = 'myFacet';
  const helper = algoliasearchHelper(fakeClient, '', {
    facets: [facetName],
  });

  helper.addRefine(facetName, 'value1');
  t.deepEqual(
    requestBuilder._getFacetFilters(helper.state),
    [`${facetName}:value1`],
    'One value: one filter'
  );
  helper.addRefine(facetName, 'value2');
  t.deepEqual(
    requestBuilder._getFacetFilters(helper.state),
    [`${facetName}:value1`, `${facetName}:value2`],
    'Two values: two filters'
  );
  helper.toggleRefine(facetName, 'value3');
  t.deepEqual(
    requestBuilder._getFacetFilters(helper.state),
    [`${facetName}:value1`, `${facetName}:value2`, `${facetName}:value3`],
    'Three values: three filters'
  );
  helper.removeRefine(facetName, 'value3');
  t.deepEqual(
    requestBuilder._getFacetFilters(helper.state),
    [`${facetName}:value1`, `${facetName}:value2`],
    'Three values: three filters'
  );
  helper.addRefine(facetName, 'value1');
  t.deepEqual(
    requestBuilder._getFacetFilters(helper.state),
    [`${facetName}:value1`, `${facetName}:value2`],
    'Add multiple times the same parameter: only two parameters'
  );

  t.end();
});
