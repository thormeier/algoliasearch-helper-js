const test = require('tape');

// This test ensures that the helper accepts the `length` (offset/length API param) parameter
// At some point we were badly iterating over the SearchParameters instance and failed when
// the `length` parameter was given.

test('helper accepts length parameter', t => {
  t.plan(2);

  const algoliasearch = require('algoliasearch');
  const sinon = require('sinon');
  const algoliasearchHelper = require('../../');

  const appId = 'accepts-length-parameter-appId';
  const apiKey = 'accepts-length-parameter-apiKey';
  const indexName = 'accepts-length-parameter-indexName';

  const client = algoliasearch(appId, apiKey);
  const helper = algoliasearchHelper(client, indexName, {
    length: 2,
    hitsPerPage: 10,
  });

  client.search = sinon.stub().returns(new Promise(() => {}));

  helper.setQuery('a').search();

  const searchParams = client.search.getCall(0).args[0][0].params;

  t.equal(searchParams.length, 2, 'searchParams.length was set');
  t.equal(
    searchParams.hitsPerPage,
    10,
    'searchParams.hitsPerPage was also set'
  );
});
