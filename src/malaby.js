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
    getFilesToWatch
} = require('./utils');

const logger = require('./logger');
const malabyRunner = require('./malabyRunner');
const currentVersion = require('../package').version;

const CWD = process.cwd();

const filePath = _.find(argv._, (pathToFile) => { // eslint-disable-line arrow-body-style
    return pathToFile ? fs.existsSync(path.join(CWD, pathToFile)) || fs.existsSync(pathToFile) : undefined;
});

const configFromUserInput = argv.config;
const isWatchMode = argv.watch;
const isDebug = argv.debug;
const isNdb = argv.ndb;
const isHelp = argv.help;
const isInitCommand = argv._.length === 1 && _.head(argv._) === 'init';

const isInspect = _.find(process.execArgv, param => param && _.startsWith(param, '--inspect'));
// const inspectPort = isInspect && isInspect.split('=')[1];

const configPath = getConfigPath(CWD, configFromUserInput);
const defaultConfigPath = path.join(CWD, 'malaby-config.json');
const config = configPath && getConfig(configPath);

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

    if (!config) {
        logger.couldNotFileConfigurationFile(defaultConfigPath, configFromUserInput);
        process.exit(1);
    }

    if (!filePath) {
        logger.couldNotLocateTestFile(CWD, argv._);
        process.exit(1);
    }

    const context = buildContext(filePath, config);

    if (context.matchingConfigs.length === 0) {
        logger.noMatchingTestsFound(filePath, configPath);
        process.exit(1);
    } else if (context.matchingConfigs.length > 1) {
        logger.moreThanOneConfigFound(filePath, context.matchingConfigs);
        process.exit(1);
    }

    const testFileExists = fs.existsSync(filePath) || fs.existsSync(path.join(CWD, filePath));
    if (!testFileExists) {
        logger.testFileDoesNotExist(filePath);
        process.exit(1);
    }

    const commandString = buildCommandString(context.config, CWD, filePath, { isDebug, isInspect });
    const commandInArray = _.compact([
        isNdb && 'ndb',
        'npx',
        ...commandString.split(' ')
    ]);

    logger.runningCommand(filePath, commandInArray.join(' '));

    const command = _.head(commandInArray);
    const commandArgs = _.tail(commandInArray);
    const filesToWatch = getFilesToWatch(context);

    malabyRunner(command, commandArgs, { CWD, isWatchMode, isDebug, filesToWatch });
})();
