const _ = require('lodash');
const fs = require('fs');
const path = require('path');

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

const CWD = process.cwd();
const argv = require('minimist')(process.argv.slice(2));

const filePath = _.find(argv._, pathToFile => {
    return pathToFile ? fs.existsSync(path.join(CWD, pathToFile)) || fs.existsSync(pathToFile) : undefined;
});

const configFromUserInput = argv.config;
const isWatchMode = argv.watch;
const isDebug = argv.debug;
const isInitCommand = argv._.length === 1 && _.head(argv._) === 'init';

const isInspect = _.find(process.execArgv, param => param && _.startsWith(param, '--inspect-brk'));
const inspectPort = isInspect && isInspect.split('=')[1];

const configPath = getConfigPath(CWD, configFromUserInput);
const config = configPath && getConfig(configPath);
const currentVersion = require('../package').version;

(async () => {
    if (argv.version) {
        logger(currentVersion);
        return;
    }

    const latestVersion = await fetchLatestVersion(currentVersion);

    if (currentVersion !== latestVersion) {
        logger.mustUpdateVersion(latestVersion);
        process.exit(1); // eslint-disable-line
    }

    if (isInitCommand) {
        createConfigFile(path.join(CWD, 'malaby-config.json'));
        return;
    }

    if (!config) {
        logger.couldNotFileConfigurationFile(configPath, configFromUserInput);
        process.exit(1); // eslint-disable-line
    }

    if (!filePath) {
        logger.help();
        process.exit(1); // eslint-disable-line
    }

    const fileName = path.basename(filePath); // only after filePath validation!
    const context = buildContext(filePath, config);

    if (context.matchingConfigs.length === 0) {
        logger.noMatchingTestsFound(filePath, configPath);
        process.exit(1); // eslint-disable-line
    } else if (context.matchingConfigs.length > 1) {
        logger.moreThanOneConfigFound(filePath, context.matchingConfigs);
        process.exit(1); // eslint-disable-line
    }

    const testFileExists = fs.existsSync(filePath) || fs.existsSync(path.join(CWD, filePath));
    if (!testFileExists) {
        logger.testFileDoesNotExist(filePath);
        process.exit(1); // eslint-disable-line
    }

    const commandString = buildCommandString(context.config, filePath, fileName, isDebug, inspectPort);
    const commandInArray = _.compact([
        isDebug && 'ndb',
        'npx',
        ...commandString.split(' ')
    ]);

    logger.runningCommand(filePath, commandInArray.join(' '));

    const command = _.head(commandInArray);
    const commandArgs = _.tail(commandInArray);
    const filesToWatch = getFilesToWatch(context);

    malabyRunner(command, commandArgs, {CWD, isWatchMode, isDebug, filesToWatch});
})();
