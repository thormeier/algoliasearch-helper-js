import bind from 'lodash/bind';

let warnOnce = function() {};
try {
  let warn;

  if (typeof window !== 'undefined')
    warn = window.console && bind(window.console.warn, console);
  else warn = bind(console.warn, console); // eslint-disable-line no-console

  warnOnce = (function(w) {
    const previousMessages = [];
    return function warnOnlyOnce(m) {
      if (previousMessages.indexOf(m) === -1) {
        w(m);
        previousMessages.push(m);
      }
    };
  })(warn);
} catch (e) {
  warnOnce = function() {};
}

export default warnOnce;
