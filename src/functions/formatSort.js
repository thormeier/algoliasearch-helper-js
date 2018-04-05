import reduce from 'lodash/reduce';
import find from 'lodash/find';
import startsWith from 'lodash/startsWith';

/**
 * Transform sort format from user friendly notation to lodash format
 * @param {string[]} sortBy array of predicate of the form "attribute:order"
 * @return {array.<string[]>} array containing 2 elements : attributes, orders
 */
export default function formatSort(sortBy, defaults) {
  return reduce(
    sortBy,
    (out, sortInstruction) => {
      let sortInstructions = sortInstruction.split(':');
      if (defaults && sortInstructions.length === 1) {
        const similarDefault = find(defaults, predicate =>
          startsWith(predicate, sortInstruction[0])
        );
        if (similarDefault) {
          sortInstructions = similarDefault.split(':');
        }
      }
      out[0].push(sortInstructions[0]);
      out[1].push(sortInstructions[1]);
      return out;
    },
    [[], []]
  );
}
