const test = require('tape');
const algoliaSearchHelper = require('../../index');
const url = algoliaSearchHelper.url;
const AlgoliaSearchHelper = algoliaSearchHelper.AlgoliaSearchHelper;

test('Should be compatible', t => {
  t.equal(
    AlgoliaSearchHelper.getConfigurationFromQueryString,
    url.getStateFromQueryString
  );
  t.equal(
    AlgoliaSearchHelper.getForeignConfigurationInQueryString,
    url.getUnrecognizedParametersInQueryString
  );

  t.end();
});
