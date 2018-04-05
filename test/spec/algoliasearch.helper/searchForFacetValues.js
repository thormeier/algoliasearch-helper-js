const test = require('tape');

const algoliasearchHelper = require('../../../index');

test('searchForFacetValues should search for facetValues with the current state', t => {
  let lastParameters = null;
  const fakeClient = {
    addAlgoliaAgent() {},
    initIndex() {
      return {
        searchForFacetValues() {
          lastParameters = arguments;
          return Promise.resolve({});
        },
      };
    },
  };

  const helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone',
  });

  helper.searchForFacetValues('facet', 'query', 75);

  t.equal(lastParameters[0].query, 'iphone');
  t.equal(lastParameters[0].facetQuery, 'query');
  t.equal(lastParameters[0].facetName, 'facet');
  t.equal(lastParameters[0].highlightPreTag, 'HIGHLIGHT>');
  t.equal(lastParameters[0].highlightPostTag, '<HIGHLIGHT');

  t.end();
});

test('searchForFacetValues can override the current search state', t => {
  let lastParameters = null;
  const fakeClient = {
    addAlgoliaAgent() {},
    initIndex() {
      return {
        searchForFacetValues() {
          lastParameters = arguments;
          return Promise.resolve({});
        },
      };
    },
  };

  const helper = algoliasearchHelper(fakeClient, 'index', {
    highlightPreTag: 'HIGHLIGHT>',
    highlightPostTag: '<HIGHLIGHT',
    query: 'iphone',
  });

  helper.searchForFacetValues('facet', 'query', 75, {
    query: undefined,
    highlightPreTag: 'highlightTag',
  });

  t.notOk(lastParameters[0].hasOwnProperty('query'));
  t.equal(lastParameters[0].facetQuery, 'query');
  t.equal(lastParameters[0].facetName, 'facet');
  t.equal(lastParameters[0].highlightPreTag, 'highlightTag');
  t.equal(lastParameters[0].highlightPostTag, '<HIGHLIGHT');

  t.end();
});
