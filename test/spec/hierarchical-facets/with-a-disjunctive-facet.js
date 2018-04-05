const test = require('tape');

test('hierarchical facets: combined with a disjunctive facet', t => {
  const algoliasearch = require('algoliasearch');
  const sinon = require('sinon');

  const algoliasearchHelper = require('../../../');

  const appId = 'hierarchical-simple-appId';
  const apiKey = 'hierarchical-simple-apiKey';
  const indexName = 'hierarchical-simple-indexName';

  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client, indexName, {
    disjunctiveFacets: ['colors'],
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0', 'categories.lvl1', 'categories.lvl2'],
      },
    ],
  });

  helper.toggleRefine('categories', 'beers > IPA');
  helper.toggleRefine('colors', 'blue');

  client.search = sinon.stub().returns(new Promise(() => {}));

  helper.setQuery('a').search();

  const disjunctiveFacetsValuesQuery = client.search.getCall(0).args[0][1];

  t.deepEqual(
    disjunctiveFacetsValuesQuery.params.facetFilters,
    [['categories.lvl1:beers > IPA']],
    'Disjunctive facet values query is done using the current hierarchical refinement'
  );

  t.end();
});
