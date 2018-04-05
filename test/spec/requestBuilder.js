const test = require('tape');

const requestBuilder = require('../../src/requestBuilder.js');
const getQueries = requestBuilder._getQueries;

test('The request builder should set analytics to subsequent queries', t => {
  const testData = require('./search.testdata.js')();
  const searchParams = testData.searchParams;

  searchParams.analytics = true;

  const queries = getQueries(searchParams.index, searchParams);
  t.equal(queries.length, 2);
  t.equal(
    queries[0].params.analytics,
    true,
    'the parameter analytics should not be defined on the first query'
  );
  t.equal(
    queries[1].params.analytics,
    false,
    'the parameter analytics should be set to false on the second query'
  );

  t.end();
});

test('The request builder should set clickAnalytics to subsequent queries', t => {
  const testData = require('./search.testdata.js')();
  const searchParams = testData.searchParams;

  searchParams.clickAnalytics = true;

  const queries = getQueries(searchParams.index, searchParams);
  t.equal(queries.length, 2);
  t.equal(
    queries[0].params.clickAnalytics,
    true,
    'the parameter clickAnalytics should be defined on the first query'
  );
  t.equal(
    queries[1].params.clickAnalytics,
    false,
    'the parameter clickAnalytics should be set to false on the second query'
  );

  t.end();
});

test('The request builder should should force analytics to false on subsequent queries if not specified', t => {
  const testData = require('./search.testdata.js')();
  const searchParams = testData.searchParams;

  const queries = getQueries(searchParams.index, searchParams);
  t.equal(queries.length, 2);
  t.equal(
    queries[0].params.analytics,
    undefined,
    'the parameter analytics should not be defined on the first query'
  );
  t.equal(
    queries[1].params.analytics,
    false,
    'the parameter analytics should be set to false on the second query'
  );

  t.end();
});

test('The request builder should should force clickAnalytics to false on subsequent queries if not specified', t => {
  const testData = require('./search.testdata.js')();
  const searchParams = testData.searchParams;

  const queries = getQueries(searchParams.index, searchParams);
  t.equal(queries.length, 2);
  t.equal(
    queries[0].params.clickAnalytics,
    undefined,
    'the parameter clickAnalytics should be defined on the first query'
  );
  t.equal(
    queries[1].params.clickAnalytics,
    false,
    'the parameter clickAnalytics should be set to false on the second query'
  );

  t.end();
});
