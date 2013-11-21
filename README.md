# Discipline

An object data validator, making it easy to validate and handle errors.

It use the [Pursuit][pursuit] framework to genereate the various tests. You can use all the matcher functions from the Pursuit framework in your property checks.

[pursuit]: https://github.com/gausby/pursuit

This is work in progress. Please give me your feedback.

## Installation
It is published to [NPM][npm] under the name **discipline**.

    $ npm install discipline

[npm]: https://npmjs.org/


## Usage
It works by parsing an object to the discipline function. This object will henceforth be refeered to as the 'schema.' The keys in the schema correspond to the name of the key on the input object, and the value is an object with the following keys:

  * **check** a Pursuit query. It should describe the valid value.
  * **message** a message that will be passed to the resulting issues object, should the property be invalid
  * **type** The type of error. This defaults to `error`.

See the *examples section* for examples of usage.


### Examples
Discipline can be used to check function input values. This is illustrated in the following example:

    var discipline = require('discipline');

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

    // invalid data input
    test(new Error('ups'), 5, 'baz').length; // returns '3'

    // valid data input
    test(undefined, 'World', 'Hello'); // returns 'Hello, World!'

The input does not need to be an arguement list. Plain old object literates works as well (of course).

    var discipline = require('discipline');

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

    validate({ foo: 'baz', bar: 11 }); // returns { valid: true }
    validate({ bar: 4 }); // returns { valid: false, ... }

You can even make more than one check on the same property.

    var discipline = require('discipline');

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

    validate({ foo: 'bar' }); // returns { valid: true }
    validate({ foo: 'foo' }); // returns { valid: false, ... }

In the last example the issues array on the `validate({ foo: 'foo' })` example would contain:

    {
        valid: false,
        issues: [
            {
                type: 'error',
                key: 'foo',
                value: 'foo',
                message: 'Should begin with the letter b'
            },
            {
                type: 'error',
                key: 'foo',
                value: 'foo',
                message: 'Should end with "ar"'
            }
        ],
        date: Thu Nov 21 2013 17:14:09 GMT+0100 (CET)
    }


## Development
After cloning the project you will have to run `npm install` in the project root. This will install the various grunt plugins and other dependencies.


### QA tools
The QA tools rely on the [Grunt](http://gruntjs.com) task runner. To run any of these tools, you will need the grunt-cli installed globally on your system. This is easily done by typing the following in a terminal.

    $ npm install grunt-cli -g

The unit tests will need the [Buster](http://busterjs.org/) unit test framework.

    $ npm install -g buster

These two commands will install the buster and grunt commands on your system. These can be removed by typing `npm uninstall buster -g` and `npm uninstall grunt-cli -g`.


#### Unit Tests
If you haven't all ready install the Grunt CLI tools and have a look at the grunt configuration file in the root of the project.

When developing you want to run the script watcher. Navigate to the project root and type the following in your terminal.

    $ grunt watch:scripts

This will run the jshint and tests each time a file has been modified.


#### Generating Documentation
*Work in progress*

The project uses YUIDocs that can be generated by running `grunt docs`. This will create a site with documentation in a folder called `docs/` in the project root which can be served on port 8888 by typing `grunt connect:docs`. If you want to generate docs on file modification you can run `grunt watch:docs`.


## License
The MIT License (MIT)

Copyright (c) 2013 Martin Gausby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
