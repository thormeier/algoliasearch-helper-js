const test = require('tape');

const algoliasearchHelper = require('../../../../index.js');

test('[Derivated helper] no derivatives', t => {
  t.plan(1);
  const client = {
    addAlgoliaAgent() {},
    search: searchTest,
  };
  const helper = algoliasearchHelper(client, '');
  helper.search();

  function searchTest(requests) {
    t.equal(
      requests.length,
      1,
      'Without the derivatives and no filters, the helper generates a single query'
    );

    return new Promise(() => {});
  }
});

test('[Derivated helper] 1 derivatives, no modifications', t => {
  t.plan(2);
  const client = {
    addAlgoliaAgent() {},
    search: searchTest,
  };
  const helper = algoliasearchHelper(client, '');
  helper.derive(s => s);
  helper.search();

  function searchTest(requests) {
    t.equal(requests.length, 2, 'the helper generates a two queries');
    t.deepEqual(
      requests[0],
      requests[1],
      'the helper generates the same query twice'
    );

    return new Promise(() => {});
  }
});

test('[Derivated helper] no derivatives, modification', t => {
  t.plan(4);
  const client = {
    addAlgoliaAgent() {},
    search: searchTest,
  };
  const helper = algoliasearchHelper(client, '');
  helper.derive(s => s.setQuery('otherQuery'));
  helper.search();

  function searchTest(requests) {
    t.equal(requests.length, 2, 'the helper generates a two queries');
    t.equal(requests[0].params.query, '', 'the first query is empty');
    t.equal(
      requests[1].params.query,
      'otherQuery',
      'the other query contains `otherQuery`'
    );

    delete requests[0].params.query;
    delete requests[1].params.query;

    t.deepEqual(
      requests[0],
      requests[1],
      'Without the query the other parameters are identical'
    );

    return new Promise(() => {});
  }
});
