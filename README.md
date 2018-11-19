# Malaby

Easy and fast test runner to run any kind of test

### Supports:
* Running any kind of test
* Easily watch for changes, and re-run the test using --watch
* Easily debug any node based test using --debug
* Helps big teams collaborate

use this [wiki page to configure your IDE](https://github.com/segevofer/malaby/wiki/Configure-Malaby-on-different-IDE's)

## Getting Started

install malaby (recommended to install globally):

```

npm i -g malaby # recommended

## OR ##

npm i --save-dev malaby

```

### Prerequisites

You must have [npx](https://www.npmjs.com/package/npx) installed 
(or an npm version bigger than 5.2.0 that uses npx) and [ndb](https://www.npmjs.com/package/ndb)
if you want to debug tests

It is recommended to install them globally

```

npm i -g npx ndb

```

### Installing

After installing malaby, go to the root of your project and run:
```

malaby init

```

This will create a new file named malaby-config.json

Example:

*root-of-project/malaby-config.json*:
```
{
  "tests": [
    {
      "pattern": "*.unit.js",
      "command": "yarn unit-test ${filePath}",
      "debugCommand": "grunt someOtherTask -test=*${fileName}* --debug",
      "filesToWatch": [
        ".json",
        ".jsx"
      ]
    },
    {
      "pattern": "*.spec.js",
      "command": "node js/test/jasmine.js ${filePath}"
    }
  ],
  "filesToWatch": [
    ".js"
  ]
}
```

In this file, declare the test types in your project, under "tests" array.

Each test looks like this:

* **pattern (mandatory)** - a glob describing how to locate the tests.

* **command (mandatory)** - how to run the test. You can use either ${filePath} or ${fileName}

    ${filePath} - is the absolute path of the test file. for example: /path/to/yourFile.unit.js

    ${fileName} - is the name of the file. for example: yourFile.unit.js

* **debugCommand** - just like "command", but lets you run different command when --debug flag is on

* **filesToWatch** - an array of file extensions to watch in the project, when --watch flag is on



Example of a single test config:
```
{
  "pattern": "*.unit.js",
  "command": "yarn unit-test ${filePath}",
  "debugCommand": "grunt someOtherTask -test=*${fileName}* --debug",
  "filesToWatch": [
    ".json",
    ".jsx"
  ]
}
 ```

## Usage

```
malaby path/to/testFile.yourSuffix.js
```

Additional options:
```
   --watch      re-run the test every file change in the project
   --debug      run debugCommand for this test, if found in malaby-config.json file
   --ndb        run the test with ndb (https://www.npmjs.com/package/ndb)
   --config     specify different config file --config=different-malaby-config.json
```

You can easily [configure your IDE to use Malaby](https://github.com/segevofer/malaby/wiki/Configure-Malaby-on-different-IDE's).

## a word about --watch
By default, Malaby watch for .js file changes only.

You can specify a global "filesToWatch" array or per test type under "tests" (like in the example above).

You can use any CLI command that is installed in your node_modules (node, npm, grunt, eslint, etc...)


## Contributing

Please feel free to create pull requests


## Authors

**Ofer Segev** - [Github](https://github.com/segevofer)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

