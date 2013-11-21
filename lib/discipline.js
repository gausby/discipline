/* global require module */
'use strict';

var pursuit = require('pursuit');
var isArray = pursuit({ typeOf: 'array' });

var error = {
    noMessageAttached: 'Validator check should have a message.'
};

/* mix two objects, used in reduce functions in some cases */
function mix(obj, input) {
    return Object.keys(input || {}).reduce(function(acc, key){
        if (acc[key]) {
            if (isArray(acc[key])) {
                if (isArray(input[key])) {
                    acc[key].concat(input[key]);
                }
                else {
                    acc[key].push(input[key]);
                }
            }
            else {
                if (isArray(input[key])) {
                    acc[key] = [acc[key]].concat(input[key]);
                }
                else {
                    acc[key] = [acc[key], input[key]];
                }
            }
        }
        else {
            acc[key] = input[key];
        }

        return acc;
    }, obj || {});
}

function report (input, schema) {
    var result = {
        valid: false,
        issues: [],
        date: (new Date())
    };

    function addIssue (key, message, type) {
        result.issues.push({
            type: type || 'error',
            key: key,
            value: input[key],
            message: message
        });
    }

    Object.keys(schema)
        .filter(function(key) {
            return ! schema[key].check(input[key]);
        })
        .forEach(function(key) {
            if (schema[key].intermediate) {
                schema[key].intermediate
                    .filter(function(item) {
                        return ! item.check(input[key]);
                    })
                    .forEach(function (current) {
                        addIssue(key, current.message, current.type);
                    })
                ;
            }
            else {
                addIssue(key, schema[key].message, schema[key].type);
            }
        })
    ;

    return result;
}

module.exports = function (schema) {
    schema = schema || {};

    // Compile a function that ensure that the input conform
    // to the given schema.
    var validate = pursuit(Object.keys(schema).reduce(function(a, b) {
        if (isArray(schema[b])) {
            // combine the sub checks into one check
            a[b] = schema[b].reduce(function(a, b) {
                // check if there are duplicates in the validation. To ensure
                // situations where two checks would result in at least one
                // of them always to be false.
                Object.keys(b.check).forEach(function (key) {
                    if (a[key]) {
                        throw new Error(
                            'Check collision. Two checks within a property made a similar check'
                        );
                    }
                });

                return mix(a, b.check);
            }, {});
        }
        else {
            a[b] = schema[b].check;
        }

        return a;
    }, {}));

    // Compile the individual checks and ensure every check
    // have a message attached.
    Object.keys(schema).forEach(function(current) {
        if (isArray(schema[current])) {
            var result = {};
            result.check = pursuit(schema[current].reduce(function(a, b) {
                // we have already checked if there are dublicate checks
                return mix(a, b.check);
            }, {}));

            result.intermediate = schema[current].map(function (current) {
                if (! current.message) {
                    throw new Error(error.noMessageAttached);
                }
                current.check = pursuit(current.check);

                return current;
            });

            schema[current] = result;
        }
        else {
            if (! schema[current].message) {
                throw new Error(error.noMessageAttached);
            }

            schema[current].check = pursuit(schema[current].check);
        }
    });

    return function (input) {
        return validate(input) ? { valid: true } : report(input, schema);
    };
};