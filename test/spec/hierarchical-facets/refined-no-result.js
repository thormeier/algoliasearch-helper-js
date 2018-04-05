const test = require('tape');

test('hierarchical facets: simple usage', t => {
  const algoliasearch = require('algoliasearch');
  const sinon = require('sinon');

  const algoliasearchHelper = require('../../../');

  const appId = 'hierarchical-toggleRefine-appId';
  const apiKey = 'hierarchical-toggleRefine-apiKey';
  const indexName = 'hierarchical-toggleRefine-indexName';

  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client, indexName, {
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

  helper.toggleRefine('categories', 'beers > IPA > Flying dog');

  const algoliaResponse = {
    results: [
      {
        query: 'badquery',
        index: indexName,
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 6,
        facets: {},
      },
      {
        query: 'badquery',
        index: indexName,
        hits: [],
        nbHits: 0,
        page: 0,
        nbPages: 0,
        hitsPerPage: 1,
        facets: {
          'categories.lvl0': { beers: 20, fruits: 5, sales: 20 },
        },
      },
      {
        query: 'badquery',
        index: indexName,
        hits: [],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 1,
        facets: {
          'categories.lvl0': { beers: 20, fruits: 5, sales: 20 },
        },
      },
    ],
  };

  client.search = sinon.stub().resolves(algoliaResponse);

  helper.setQuery('badquery').search();

  helper.once('result', content => {
    t.deepEqual(
      content.hierarchicalFacets,
      [
        {
          name: 'categories',
          count: null,
          isRefined: true,
          path: null,
          data: null,
        },
      ],
      'Good facets values'
    );
    t.end();
  });
});
