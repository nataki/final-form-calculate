import { getIn } from 'final-form';

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

export { createDecorator as default };
