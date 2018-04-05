const test = require('tape');

test('hierarchical facets: no refinement', t => {
  const algoliasearch = require('algoliasearch');
  const sinon = require('sinon');

  const algoliasearchHelper = require('../../../');

  const appId = 'hierarchical-simple-appId';
  const apiKey = 'hierarchical-simple-apiKey';
  const indexName = 'hierarchical-simple-indexName';

  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client, indexName, {
    hierarchicalFacets: [
      {
        name: 'categories',
        attributes: ['categories.lvl0'],
      },
    ],
  });

  const algoliaResponse = {
    results: [
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }, { objectID: 'two' }],
        nbHits: 5,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        facets: {
          'categories.lvl0': { beers: 2, fruits: 3 },
        },
      },
    ],
  };

  const expectedHelperResponse = [
    {
      name: 'categories',
      count: null,
      isRefined: true,
      path: null,
      data: [
        {
          name: 'beers',
          path: 'beers',
          count: 2,
          isRefined: false,
          data: null,
        },
        {
          name: 'fruits',
          path: 'fruits',
          count: 3,
          isRefined: false,
          data: null,
        },
      ],
    },
  ];

  client.search = sinon.stub().resolves(algoliaResponse);

  helper.setQuery('a').search();
  helper.once('result', content => {
    const call = client.search.getCall(0);
    const queries = call.args[0];
    const hitsQuery = queries[0];

    t.equal(queries.length, 1, 'we made one query');
    t.ok(client.search.calledOnce, 'client.search was called once');
    t.deepEqual(
      hitsQuery.params.facets,
      ['categories.lvl0'],
      'first query (hits) has `categories.lvl0` as facets'
    );
    t.equal(
      hitsQuery.params.facetFilters,
      undefined,
      'first query (hits) has no facet refinement refinement'
    );
    t.deepEqual(content.hierarchicalFacets, expectedHelperResponse);
    t.end();
  });
});
