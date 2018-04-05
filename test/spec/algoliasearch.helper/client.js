const test = require('tape');
const sinon = require('sinon');
const algoliaSearchHelper = require('../../../index.js');
const version = require('../../../src/version');
const algoliasearch = require('algoliasearch');

function makeFakeClient() {
  const client = algoliasearch('what', 'wait', {});
  client.search = sinon.stub().returns(new Promise(() => {}));
  return client;
}

test('setting the agent once', t => {
  const client = algoliasearch('what', 'wait', {});
  const originalUA = client._ua;
  algoliaSearchHelper(client, 'IndexName', {});
  algoliaSearchHelper(client, 'IndexName2', {});

  t.equal(client._ua, `${originalUA};JS Helper ${version}`);

  t.end();
});

test('getClient / setClient', t => {
  const client0 = makeFakeClient();
  const originalUA = client0._ua;
  const helper = algoliaSearchHelper(client0, 'IndexName', {});

  t.equal(
    client0.search.callCount,
    0,
    'before any search the client should not have been called'
  );
  helper.search();
  t.equal(
    client0.search.callCount,
    1,
    'after a single search, the client must have been strictly one time'
  );

  t.equal(
    helper.getClient(),
    client0,
    'getClient should return the instance defined with the Helper factory'
  );

  t.equal(
    client0._ua,
    `${originalUA};JS Helper ${version}`,
    'sets the helper agent, client 0'
  );

  const client1 = makeFakeClient();
  helper.setClient(client1);

  t.equal(helper.getClient(), client1);

  t.equal(
    client1.search.callCount,
    0,
    'the new client should not have been called before any search'
  );
  helper.search();
  t.equal(
    client1.search.callCount,
    1,
    'the new client should have been called'
  );
  t.equal(
    client0.search.callCount,
    1,
    'the old client should not have been called if it is not set anymore'
  );

  t.equal(
    client1._ua,
    `${originalUA};JS Helper ${version}`,
    'sets the helper agent, client 1'
  );

  helper.setClient(client1);
  t.equal(
    client1._ua,
    `${originalUA};JS Helper ${version}`,
    'does not set the helper agent twice, client 1'
  );

  t.end();
});

test('initial client === getClient', t => {
  t.plan(1);
  const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
  const helper = algoliaSearchHelper(client, 'ikea', {});
  helper.setQuery('blah').search();
  t.equal(client, helper.getClient());
});
