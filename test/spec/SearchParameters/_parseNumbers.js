const test = require('tape');
const SearchParameters = require('../../../src/SearchParameters');

test('_parseNumbers should convert to number all specified root keys (that are parseable)', t => {
  const partialState = {
    aroundPrecision: '42',
    aroundRadius: '42',
    getRankingInfo: '42',
    insideBoundingBox: [
      ['51.1241999', '9.662499900000057', '41.3253001', '-5.559099999999944'],
    ],
    minWordSizefor2Typos: '42',
    minWordSizefor1Typo: '42',
    page: '42',
    maxValuesPerFacet: '42',
    distinct: '42',
    minimumAroundRadius: '42',
    hitsPerPage: '42',
    minProximity: '42',
  };
  const actual = SearchParameters._parseNumbers(partialState);

  t.equal(
    actual.aroundPrecision,
    42,
    'aroundPrecision should be converted to number'
  );
  t.equal(
    actual.aroundRadius,
    42,
    'aroundRadius should be converted to number'
  );
  t.equal(
    actual.getRankingInfo,
    42,
    'getRankingInfo should be converted to number'
  );
  t.deepEqual(
    actual.insideBoundingBox,
    [[51.1241999, 9.662499900000057, 41.3253001, -5.559099999999944]],
    'insideBoundingBox should be converted to number'
  );
  t.equal(
    actual.minWordSizefor2Typos,
    42,
    'minWordSizeFor2Typos should be converted to number'
  );
  t.equal(
    actual.minWordSizefor1Typo,
    42,
    'minWordSizeFor1Typo should be converted to number'
  );
  t.equal(actual.page, 42, 'page should be converted to number');
  t.equal(
    actual.maxValuesPerFacet,
    42,
    'maxValuesPerFacet should be converted to number'
  );
  t.equal(actual.distinct, 42, 'distinct should be converted to number');
  t.equal(
    actual.minimumAroundRadius,
    42,
    'minimumAroundRadius should be converted to number'
  );
  t.equal(actual.hitsPerPage, 42, 'hitsPerPage should be converted to number');
  t.equal(
    actual.minProximity,
    42,
    'minProximity should be converted to number'
  );

  t.end();
});

test('_parseNumbers should not convert undefined to NaN', t => {
  const partialState = {
    aroundPrecision: undefined,
  };
  const actual = SearchParameters._parseNumbers(partialState);

  t.equal(actual.aroundPrecision, undefined);

  t.end();
});

test("_parseNumbers should not convert insideBoundingBox if it's a string", t => {
  const partialState = {
    insideBoundingBox: '5,4,5,4',
  };
  const actual = SearchParameters._parseNumbers(partialState);

  t.equal(actual.insideBoundingBox, '5,4,5,4');

  t.end();
});

test('_parseNumbers should not convert unparseable strings', t => {
  const partialState = {
    aroundRadius: 'all',
  };
  const actual = SearchParameters._parseNumbers(partialState);

  t.equal(actual.aroundRadius, 'all');

  t.end();
});

test('_parseNumbers should convert numericRefinements values', t => {
  const partialState = {
    numericRefinements: {
      foo: {
        '>=': ['4.8', '15.16'],
        '=': ['23.42'],
      },
    },
  };
  const actual = SearchParameters._parseNumbers(partialState);

  t.deepEqual(
    actual.numericRefinements.foo['>='],
    [4.8, 15.16],
    'should convert foo >='
  );
  t.deepEqual(
    actual.numericRefinements.foo['='],
    [23.42],
    'should convert foo ='
  );

  t.end();
});

test('_parseNumbers should convert nested numericRefinements values', t => {
  const partialState = {
    numericRefinements: {
      foo: {
        '>=': [['4.8'], '15.16'],
        '=': ['23.42'],
      },
    },
  };
  const actual = SearchParameters._parseNumbers(partialState);

  t.deepEqual(
    actual.numericRefinements.foo['>='],
    [[4.8], 15.16],
    'should convert foo >='
  );
  t.deepEqual(
    actual.numericRefinements.foo['='],
    [23.42],
    'should convert foo ='
  );

  t.end();
});
