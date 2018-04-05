const test = require('tape');
const algoliasearchHelper = require('../../index');

const fakeClient = {
  addAlgoliaAgent() {},
};

test('getStateFromQueryString should parse insideBoundingBox as float georects and be consistent with the state', t => {
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, {
    insideBoundingBox: [
      [51.1241999, 9.662499900000057, 41.3253001, -5.559099999999944],
    ],
  });

  const queryString = algoliasearchHelper.url.getQueryStringFromState(
    helper.getState()
  );

  const partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  t.deepEquals(
    partialStateFromQueryString.insideBoundingBox,
    helper.state.insideBoundingBox,
    'insideBoundingBox should be consistent through query string serialization/deserialization'
  );
  t.end();
});

test('getStateFromQueryString should parse insideBoundingBox as float georects and be consistent with the state', t => {
  const index = 'indexNameInTheHelper';
  const helper = algoliasearchHelper(fakeClient, index, {
    insideBoundingBox:
      '51.1241999,9.662499900000057,41.3253001,-5.559099999999944',
  });

  const queryString = algoliasearchHelper.url.getQueryStringFromState(
    helper.getState()
  );

  const partialStateFromQueryString = algoliasearchHelper.url.getStateFromQueryString(
    queryString
  );

  t.deepEquals(
    partialStateFromQueryString.insideBoundingBox,
    helper.state.insideBoundingBox,
    'insideBoundingBox should be consistent through query string serialization/deserialization'
  );
  t.end();
});
