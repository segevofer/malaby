# Malaby

Easy and fast test runner to run any kind of test

### Supports:
* Running any kind of test
* Easily watch for changes, and re-run the test using --watch
* Easily debug any node based test using --debug
* Helps big teams collaborate


## Getting Started

install malaby globally:

```

npm i -g malaby

```

### Prerequisites

You must have [npx](https://www.npmjs.com/package/npx) installed 
(or an npm version that uses npx) and [ndb](https://www.npmjs.com/package/ndb) 
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
  "*.unit.js": {
    "command": "yarn unit ${filePath}"
  },
  "*.spec.js": {
    "command": "node js/test/jasmine.js ${filePath}"
  },
  "*.it.js": {
    "command": "grunt karma:beaker -test=*${fileName}*"
  }
}
```

In this file you can specify suffixes of test files in your project and their different commands for running and debugging.
You can either use ${filePath} which is the absolute path of the file, or ${fileName} to use some regex matcher when running the test.
You can use any CLI command that is installed in your node_modules (node, npm, grunt, eslint, etc...)


You can also specify a different command for debugging, using the 'debugCommand' key

Example 2:
```
{
  "*.unit.js": {
    "command": "yarn unit ${filePath}"
  },
  "*.ix.js": {
    "command": "jest ${filePath} --config=jest-beaker.config.js",
    "debugCommand": "jest ${filePath} --config=jest-beaker-debug.config.js"
  }
}
```

## Usage

```
malaby path/to/testFile.yourSuffix.js
```

Additional options:
```
   --debug: run ndb (https://www.npmjs.com/package/ndb)
   --watch: re-run the test every file change in the project
```

## Contributing

Please feel free to create pull requests


## Authors

**Ofer Segev** - [Github](https://github.com/segevofer)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

