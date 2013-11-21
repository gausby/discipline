/*jslint maxlen:140*/
/* global require */
'use strict';

var buster = require('buster'),
    discipline = require('../lib/discipline.js')
;

var assert = buster.referee.assert;
var refute = buster.referee.refute;

buster.testCase('Claims made in the README.md', {
    'usage example': function () {
        var validate = discipline({
            0: {
                check: { typeOf: 'undefined' },
                message: 'Got an error as first argument'
            },
            1: {
                check: { typeOf: 'string' },
                message: 'Expected a string as the second argument'
            },
            2: {
                check: [
                    { equals: 'Hello' },
                    { equals: 'Goodbye' }
                ],
                message: 'Should be either "Hello" or "Goodbye"'
            }
        });

        // define your function
        function test (err, name, action) {
            if (! validate(arguments).valid) {
                // throw error, or otherwise handle errors
                // In this case we'll just return the list of issues
                // found during the validation.
                return validate(arguments).issues;
            }

            // business as usual, but no need for checks on argument types
            // they should be okay and valid at this point
            return action + ', ' + name + '!';
        }

        // invalid
        assert.equals(test(new Error('ups'), 5, 'baz').length, 3);

        // valid
        assert.equals(test(undefined, 'World', 'Hello'), 'Hello, World!');
    },

    'usage example 2': function () {
        var validate = discipline({
            foo: {
                check: { isSet: true },
                message: 'Foo should be set to something, anything.'
            },
            bar: {
                check: { typeOf: 'number', greaterThan: 5 },
                message: 'Bar should be a number and greater than 5'
            }
        });

        assert.equals(validate({ foo: 'baz', bar: 11 }), { valid: true }); // returns { valid: true }
        refute.equals(validate({ bar: 4 }), { valid: true }); // returns { valid: false, ... }
    },

    'Usage example: intermediate checks': function () {
        var validate = discipline({
            foo: [
                {
                    check: { isSet: true },
                    message: 'Foo should be set to something, anything.'
                },
                {
                    check: { beginsWith: 'b' },
                    message: 'Should begin with the letter b'
                },
                {
                    check: { endsWith: 'ar' },
                    message: 'Should end with "ar"'
                }
            ]
        });

        assert.isTrue(validate({ foo: 'bar' }).valid); // returns { valid: true }
        refute.isTrue(validate({ foo: 'foo' }).valid); // returns { valid: false, ... }
    }
});