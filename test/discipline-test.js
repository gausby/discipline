/*jslint maxlen:140*/
/* global require */
'use strict';

var buster = require('buster'),
    discipline = require('../lib/discipline')
;

var assert = buster.referee.assert;
var refute = buster.referee.refute;

buster.testCase('Discipline', {
    'should return a function': function () {
        assert.isFunction(discipline({}));
    },

    'should return a status object with valid:true if input is valid': function () {
        assert.isTrue(discipline({})().valid);
    },

    'should return a status object with valid:false if input is invalid': function () {
        refute.isTrue(
            discipline({ 0: { check: {equals: 'foo'}, message: 'foo'}})({0: 'bar'}).valid
        );
    },

    'should throw an error if no message has been given to a check': function () {
        assert.exception(function() {
            discipline({ 0: { check: { equals: 'foo'} } });
        });
        refute.exception(function() {
            discipline({ 0: { check: { equals: 'foo'}, message: 'foo' } });
        });
    },

    'should return a list of issues if the input is invalid': function () {
        var validator = discipline({
            foo: {
                check: { equals: 'foo' },
                message: 'foo'
            },
            bar: {
                check: { equals: 'bar' },
                message: 'bar'
            }
        });

        assert.equals(validator({ foo: 'not-foo', bar: 'not-bar' }).issues.length, 2);
        assert.equals(validator({ foo: 'not-foo', bar: 'bar' }).issues.length, 1);
        assert.equals(validator({ foo: 'foo', bar: 'bar' }).issues, undefined);
    },

    'should be able to assign more than one check and error message on a property': function () {
        var validator = discipline({
            foo: [
                {
                    check: { beginsWith: 'foo' },
                    message: 'foo should begin with foo'
                },
                {
                    check: { equals: 'foobar' },
                    message: 'should equal foobar'
                },
                {
                    check: { endsWith: 'bar' },
                    message: 'should end with bar'
                }
            ]
        });

        assert.equals(validator({ foo: 'foo' }).issues.length, 2);
        assert.equals(validator({ foo: 'bar' }).issues.length, 2);
        assert.isTrue(validator({ foo: 'foobar' }).valid);
    },

    'should throw an exception if two checks on the same property makes a similar check': function () {
        assert.exception(function() {
            discipline({
                foo: [
                    { check: { equals: 'bar' }, message: 'should equal bar' },
                    { check: { equals: 'foo' }, message: 'should equal foo' }
                ]
            });
        });
    }
});
