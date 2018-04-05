const test = require('tape');
const valToNumber = require('../../../src/functions/valToNumber');

test('valToNumber makes numbers, strings and arrays of strings and numbers to be numbers', t => {
  t.equal(valToNumber(2), 2);
  t.equal(valToNumber('2'), 2);
  t.deepEqual(valToNumber([2, '45', 44]), [2, 45, 44]);
  t.end();
});
