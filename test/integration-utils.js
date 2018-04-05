const algoliasearch = require('algoliasearch');

function setup(indexName, fn) {
  const appID = process.env.INTEGRATION_TEST_APPID;
  const key = process.env.INTEGRATION_TEST_API_KEY;

  const client = algoliasearch(appID, key, {
    // all indexing requests must be done in https
    protocol: 'https:',
  });
  const index = client.initIndex(indexName);

  return index
    .clearIndex()
    .then(content => index.waitTask(content.taskID))
    .then(() => fn(client, index));
}

function withDatasetAndConfig(indexName, dataset, config) {
  return setup(indexName, (client, index) =>
    index
      .addObjects(dataset)
      .then(() => index.setSettings(config))
      .then(content => index.waitTask(content.taskID))
      .then(() => client)
  );
}

// some environements are not able to do indexing requests using
// PUT, like IE8 and IE9
let shouldRun;

if (!process.browser) {
  shouldRun = true;
} else if ('XDomainRequest' in window) {
  shouldRun = false;
} else {
  shouldRun = true;
}

module.exports = {
  isCIBrowser: process.browser && process.env.TRAVIS_BUILD_NUMBER,
  setup,
  setupSimple: withDatasetAndConfig,
  shouldRun,
};
