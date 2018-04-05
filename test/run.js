const bulk = require('bulk-require');
const test = require('tape');
const algolia = require('algoliasearch');

bulk(__dirname, ['spec/**/*.js']);

if (
  process.env.ONLY_UNIT !== 'true' &&
  process.env.INTEGRATION_TEST_API_KEY &&
  process.env.INTEGRATION_TEST_APPID
) {
  // usage: INTEGRATION_TEST_APPID=$APPID INTEGRATION_TEST_API_KEY=$APIKEY npm run dev
  bulk(__dirname, ['integration-spec/**/*.js']);

  test.onFinish(cleanupIntegration);
}

function cleanupIntegration() {
  console.log('Deleting all indices');
  const client = algolia(
    process.env.INTEGRATION_TEST_APPID,
    process.env.INTEGRATION_TEST_API_KEY
  );
  const maybeIndices = client.listIndexes();
  maybeIndices.then(content => {
    content.items
      .map(i => i.name)
      .filter(n => n.indexOf('_travis-algoliasearch-helper') !== -1)
      .forEach(n => client.deleteIndex(n));
  });
}
