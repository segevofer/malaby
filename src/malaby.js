const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const argv = require('minimist')(process.argv.slice(2));

const {
    getConfig,
    buildContext,
    buildCommandString,
    fetchLatestVersion,
    createConfigFile,
    getConfigPath,
    getTestFileAbsolutePath,
    getFilesToWatch,
    getFilesToIgnore
} = require('./utils');

const logger = require('./logger');
const malabyRunner = require('./malabyRunner');
const currentVersion = require('../package').version;

const CWD = process.cwd();
const testFileAbsolutePath = getTestFileAbsolutePath(argv, CWD);
const testFileDir = path.dirname(testFileAbsolutePath);

const configFromUserInput = argv.config;
const isWatchMode = argv.watch;
const isDebug = argv.debug;
const isNdb = argv.ndb;
const isHelp = argv.help;
const isInitCommand = argv._.length === 1 && _.head(argv._) === 'init';

const isInspect = _.find(process.execArgv, param => param && _.startsWith(param, '--inspect'));
const inspectPort = isInspect && isInspect.split('=')[1];

const configPath = getConfigPath(CWD, testFileDir, configFromUserInput);
const config = configPath && getConfig(configPath);
const defaultConfigPath = path.join(CWD, 'malaby-config.json');

(async () => {
    if (argv.version) {
        logger(currentVersion);
        return;
    }

    const latestVersion = await fetchLatestVersion();

    if (latestVersion && currentVersion !== latestVersion) {
        logger.mustUpdateVersion(latestVersion);
        process.exit(1);
    }

    if (isInitCommand) {
        createConfigFile(defaultConfigPath);
        return;
    }

    if (isHelp) {
        logger.help();
        process.exit(1);
    }

    if (!testFileAbsolutePath) {
        logger.couldNotLocateTestFile(CWD, argv._);
        process.exit(1);
    }

    if (!config) {
        logger.couldNotFileConfigurationFile(defaultConfigPath, configFromUserInput);
        process.exit(1);
    }

    const context = buildContext(testFileAbsolutePath, config);
    const configPathCwd = path.dirname(configPath);

    if (context.matchingConfigs.length === 0) {
        logger.noMatchingTestsFound(testFileAbsolutePath, configPath);
        process.exit(1);
    } else if (context.matchingConfigs.length > 1) {
        logger.moreThanOneConfigFound(testFileAbsolutePath, context.matchingConfigs);
        process.exit(1);
    }

    if (!fs.existsSync(testFileAbsolutePath)) {
        logger.testFileDoesNotExist(testFileAbsolutePath);
        process.exit(1);
    }

    const commandString = buildCommandString(context.config, testFileAbsolutePath, { isDebug, inspectPort });
    const commandInArray = _.compact([
        isNdb && 'ndb',
        'npx',
        ...commandString.split(' ')
    ]);

    logger.runningCommand(testFileAbsolutePath, configPathCwd, commandInArray.join(' '));

    const command = _.head(commandInArray);
    const commandArgs = _.tail(commandInArray);
    const filesToWatch = getFilesToWatch(context);
    const filesToIgnore = getFilesToIgnore(context);

    malabyRunner(command, commandArgs, { cwd: configPathCwd, isWatchMode, isDebug, filesToWatch, filesToIgnore });
})();
