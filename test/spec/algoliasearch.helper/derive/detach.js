const test = require('tape');

const algoliasearchHelper = require('../../../../index.js');

test('[Derivated helper] detach a derivative helper', t => {
  const client = {
    addAlgoliaAgent() {},
    search: searchTest,
  };
  const helper = algoliasearchHelper(client, '');
  const derivedHelper = helper.derive(s => s);
  derivedHelper.on('result', () => {});
  helper.search();
  derivedHelper.detach();
  helper.search();

  let nbRequest;
  function searchTest(requests) {
    nbRequest = nbRequest || 0;
    if (nbRequest === 0) {
      t.equal(requests.length, 2, 'the helper generates a two queries');
      t.deepEqual(
        requests[0],
        requests[1],
        'the helper generates the same query twice'
      );
      t.equal(
        derivedHelper.listeners('result').length,
        1,
        'one listener is plugged to the derived helper'
      );
      nbRequest++;
    } else if (nbRequest === 1) {
      t.equal(requests.length, 1, 'the helper generates a two queries');
      t.equal(
        derivedHelper.listeners('result').length,
        0,
        'no listener on the derived helper'
      );
      t.end();
    }

    return new Promise(() => {});
  }
});
