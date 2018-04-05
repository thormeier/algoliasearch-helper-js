const test = require('tape');

test('hierarchical facets: using sortBy', t => {
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
        attributes: [
          'categories.lvl0',
          'categories.lvl1',
          'categories.lvl2',
          'categories.lvl3',
        ],
        sortBy: ['count:desc', 'name:asc'],
      },
    ],
  });

  helper.toggleRefine('categories', 'beers > IPA > Flying dog');

  const algoliaResponse = {
    results: [
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 20,
        facets: {
          'categories.lvl0': { beers: 1 },
          'categories.lvl1': { 'beers > IPA': 1 },
          'categories.lvl2': { 'beers > IPA > Flying dog': 1 },
        },
      },
      {
        query: 'a',
        index: indexName,
        hits: [{ objectID: 'one' }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
        hitsPerPage: 1,
        facets: {
          'categories.lvl0': { beers: 5 },
          'categories.lvl1': { 'beers > IPA': 5 },
          'categories.lvl2': {
            'beers > IPA > Flying dog': 1,
            'beers > IPA > Anchor steam': 1,
            'beers > IPA > Brewdog punk IPA': 3,
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
        hitsPerPage: 1,
        facets: {
          'categories.lvl0': { beers: 5 },
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
              count: 5,
              isRefined: true,
              data: [
                {
                  name: 'Brewdog punk IPA',
                  path: 'beers > IPA > Brewdog punk IPA',
                  count: 3,
                  isRefined: false,
                  data: null,
                },
                {
                  name: 'Anchor steam',
                  path: 'beers > IPA > Anchor steam',
                  count: 1,
                  isRefined: false,
                  data: null,
                },
                {
                  name: 'Flying dog',
                  path: 'beers > IPA > Flying dog',
                  count: 1,
                  isRefined: true,
                  data: null,
                },
              ],
            },
          ],
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
