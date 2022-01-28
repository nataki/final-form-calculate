(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["final-form-calculate"] = {}));
})(this, (function (exports) { 'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  //      
  var charCodeOfDot = ".".charCodeAt(0);
  var reEscapeChar = /\\(\\)?/g;
  var rePropName = RegExp( // Match anything that isn't a dot or bracket.
  "[^.[\\]]+" + "|" + // Or match property names within brackets.
  "\\[(?:" + // Match a non-string expression.
  "([^\"'][^[]*)" + "|" + // Or match strings (supports escaping characters).
  "([\"'])((?:(?!\\2)[^\\\\]|\\\\.)*?)\\2" + ")\\]" + "|" + // Or match "" as the space between consecutive dots or empty brackets.
  "(?=(?:\\.|\\[\\])(?:\\.|\\[\\]|$))", "g");
  /**
   * Converts `string` to a property path array.
   *
   * @private
   * @param {string} string The string to convert.
   * @returns {Array} Returns the property path array.
   */

  var stringToPath = function stringToPath(string) {
    var result = [];

    if (string.charCodeAt(0) === charCodeOfDot) {
      result.push("");
    }

    string.replace(rePropName, function (match, expression, quote, subString) {
      var key = match;

      if (quote) {
        key = subString.replace(reEscapeChar, "$1");
      } else if (expression) {
        key = expression.trim();
      }

      result.push(key);
    });
    return result;
  };

  var keysCache = {};

  var toPath = function toPath(key) {
    if (key === null || key === undefined || !key.length) {
      return [];
    }

    if (typeof key !== "string") {
      throw new Error("toPath() expects a string");
    }

    if (keysCache[key] == null) {
      keysCache[key] = stringToPath(key);
    }

    return keysCache[key];
  };

  //      

  var getIn = function getIn(state, complexKey) {
    // Intentionally using iteration rather than recursion
    var path = toPath(complexKey);
    var current = state;

    for (var i = 0; i < path.length; i++) {
      var key = path[i];

      if (current === undefined || current === null || typeof current !== "object" || Array.isArray(current) && isNaN(key)) {
        return undefined;
      }

      current = current[key];
    }

    return current;
  };

  var isPromise = (function (obj) {
    return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
  });

  var tripleEquals = function tripleEquals(a, b) {
    return a === b;
  };

  var createDecorator = function createDecorator(_ref) {
    var calculations = _ref.calculations,
        _ref$runOnInit = _ref.runOnInit,
        runOnInit = _ref$runOnInit === void 0 ? true : _ref$runOnInit,
        isPaused = _ref.isPaused;
    return function (form) {
      var previousValues = {};
      var unsubscribe = form.subscribe(function (_ref2) {
        var values = _ref2.values;
        console.log('calculate');

        if (!runOnInit && form.getState().pristine) {
          if (!Object.keys(previousValues).length) {
            console.log('pristine', previousValues, values);
            previousValues = _extends({}, values);
          }

          return;
        }

        if (isPaused && isPaused()) {
          return;
        }

        form.batch(function () {
          var runUpdates = function runUpdates(field, isEqual, updates) {
            var next = values && getIn(values, field);
            var previous = previousValues && getIn(previousValues, field);

            if (!isEqual(next, previous)) {
              if (typeof updates === 'function') {
                var results = updates(next, field, values, previousValues);

                if (isPromise(results)) {
                  results.then(function (resolved) {
                    Object.keys(resolved).forEach(function (destField) {
                      form.change(destField, resolved[destField]);
                    });
                  });
                } else {
                  Object.keys(results).forEach(function (destField) {
                    form.change(destField, results[destField]);
                  });
                }
              } else {
                Object.keys(updates).forEach(function (destField) {
                  var update = updates[destField];
                  var result = update(next, values, previousValues);

                  if (isPromise(result)) {
                    result.then(function (resolved) {
                      form.change(destField, resolved);
                    });
                  } else {
                    form.change(destField, result);
                  }
                });
              }
            }
          };

          var fields = form.getRegisteredFields();
          calculations.forEach(function (_ref3) {
            var field = _ref3.field,
                isEqual = _ref3.isEqual,
                updates = _ref3.updates;

            if (typeof field === 'string') {
              runUpdates(field, isEqual || tripleEquals, updates);
            } else {
              // field is a either array or regex
              var matches = Array.isArray(field) ? function (name) {
                return ~field.indexOf(name) || field.findIndex(function (f) {
                  return f instanceof RegExp && f.test(name);
                }) !== -1;
              } : function (name) {
                return field.test(name);
              };
              fields.forEach(function (fieldName) {
                if (matches(fieldName)) {
                  runUpdates(fieldName, isEqual || tripleEquals, updates);
                }
              });
            }
          });
          previousValues = values;
        });
      }, {
        values: true
      });
      return unsubscribe;
    };
  };

  exports["default"] = createDecorator;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=final-form-calculate.umd.js.map
