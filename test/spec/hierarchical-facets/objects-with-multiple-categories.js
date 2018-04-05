const test = require('tape');

test('hierarchical facets: objects with multiple categories', t => {
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
        attributes: ['categories.lvl0', 'categories.lvl1'],
      },
    ],
  });

  helper.toggleRefine('categories', 'beers > IPA');

  const algoliaResponse = {
    results: [
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 3,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        facets: {
          'categories.lvl0': { beers: 3, bières: 3 },
          'categories.lvl1': { 'beers > IPA': 3, 'bières > Rousses': 3 },
        },
      },
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        facets: {
          'categories.lvl0': { beers: 5, bières: 3 },
          'categories.lvl1': {
            'beers > IPA': 3,
            'beers > Guiness': 2,
            'bières > Rousses': 3,
          },
        },
      },
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        facets: {
          'categories.lvl0': { beers: 5, bières: 3 },
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
          count: 5,
          isRefined: true,
          data: [
            {
              name: 'IPA',
              path: 'beers > IPA',
              count: 3,
              isRefined: true,
              data: null,
            },
            {
              name: 'Guiness',
              path: 'beers > Guiness',
              count: 2,
              isRefined: false,
              data: null,
            },
          ],
        },
        {
          name: 'bières',
          path: 'bières',
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
    t.deepEqual(content.hierarchicalFacets, expectedHelperResponse);
    t.end();
  });
});
