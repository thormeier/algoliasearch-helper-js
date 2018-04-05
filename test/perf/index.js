const path = require('path');
const fs = require('fs');

const test = require('tape');
const Benchmark = require('benchmark');
const download = require('download');

download(
  'https://cdn.jsdelivr.net/algoliasearch.helper/2/algoliasearch.helper.min.js',
  __dirname
)
  .then(
    () => {
      const currentHelper = require('../../dist/algoliasearch.helper.min.js');
      const previousHelper = require('./algoliasearch.helper.min.js');

      const tests = ['./tests/instanciate.js'];

      tests.forEach(makeTestPerf.bind(null, currentHelper, previousHelper));
    },
    () => {
      throw new Error("performance test didn't behave as expected");
    }
  )
  .then(() => {
    rmReferenceBuild();
  });

function rmReferenceBuild() {
  const p = path.join(__dirname, 'algoliasearch.helper.min.js');
  fs.unlink(p);
}

function makeTestPerf(previousHelper, currentHelper, testFile) {
  test(`${testFile} vs helper v.${previousHelper.version}`, t => {
    t.plan(1);
    const suite = new Benchmark.Suite();
    suite
      .add('current', require(testFile)(currentHelper))
      .add('previous', require(testFile)(previousHelper));

    suite.on('complete', function() {
      const currentStats = getStats(this['0']);
      const previousStats = getStats(this['1']);

      if (currentStats.mean <= previousStats.mean) {
        t.pass(
          `Current build is at least as fast: ${currentStats.mean} vs ${
            previousStats.mean
          }`
        );
      } else {
        t.fail(
          `Previous build is faster: ${currentStats.mean} vs ${
            previousStats.mean
          }`
        );
      }
      return;
    });

    suite.run();
  });
}

function getStats(bench) {
  return bench.stats;
}
