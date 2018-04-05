const test = require('tape');
const algoliasearchHelper = require('../../../index');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('the queryid should keep increasing when new requests arrives', t => {
  let initialQueryID;
  const client = {
    addAlgoliaAgent() {},
    search() {
      initialQueryID++;
      return new Promise(() => {});
    },
  };
  const helper = algoliasearchHelper(client, null, {});

  initialQueryID = helper._queryId;

  helper
    .search()
    .search()
    .search()
    .search()
    .search();

  t.equal(
    helper._queryId,
    initialQueryID,
    'the _queryID should have increased of the number of calls'
  );

  t.end();
});

test('the response handler should check that the query is not outdated', t => {
  const testData = require('../search.testdata')();
  let shouldTriggerResult = true;
  let callCount = 0;

  const helper = algoliasearchHelper(fakeClient, null, {});

  helper.on('result', () => {
    callCount++;

    if (!shouldTriggerResult) {
      t.fail('The id was outdated');
    }
  });

  const states = [
    {
      state: helper.state,
      queriesCount: 1,
      helper,
    },
  ];

  helper._dispatchAlgoliaResponse(
    states,
    helper._lastQueryIdReceived + 1,
    testData.response
  );
  helper._dispatchAlgoliaResponse(
    states,
    helper._lastQueryIdReceived + 10,
    testData.response
  );
  t.equal(callCount, 2, 'the callback should have been called twice');

  shouldTriggerResult = false;

  helper._dispatchAlgoliaResponse(
    states,
    helper._lastQueryIdReceived - 1,
    testData.response
  );
  t.equal(callCount, 2, "and shouldn't have been called if outdated");

  t.end();
});

test('the error handler should check that the query is not outdated', t => {
  let shouldTriggerError = true;
  let callCount = 0;

  const helper = algoliasearchHelper(fakeClient, null, {});

  helper.on('error', () => {
    callCount++;

    if (!shouldTriggerError) {
      t.fail('The id was outdated');
    }
  });

  helper._dispatchAlgoliaError(helper._lastQueryIdReceived + 1, new Error());
  helper._dispatchAlgoliaError(helper._lastQueryIdReceived + 10, new Error());
  t.equal(callCount, 2, 'the callback should have been called twice');

  shouldTriggerError = false;

  helper._dispatchAlgoliaError(helper._lastQueryIdReceived - 1, new Error());
  t.equal(callCount, 2, "and shouldn't have been called if outdated");

  t.end();
});
