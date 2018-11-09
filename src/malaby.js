const _ = require('lodash');
const fs = require('fs');
const path = require('path');

const {
    getConfig,
    isFlagOn,
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
const userInputConfigArg = _.find(process.argv, param => param && _.startsWith(param, '--config'));
const filePath = _.find(process.argv, param => param && _.endsWith(param, '.js'));
const configFromUserInput = userInputConfigArg && userInputConfigArg.split('=')[1];
const isInitCommand = process.argv.length === 3 && process.argv[2] === 'init';
const isWatchMode = isFlagOn(process.argv, '--watch');
const isDebug = isFlagOn(process.argv, '--debug');
const isAskingForVersion = isFlagOn(process.argv, '--version');
const isInspect = _.find(process.execArgv, param => param && _.startsWith(param, '--inspect-brk'));
const inspectPort = isInspect && isInspect.split('=')[1];

const configPath = getConfigPath(CWD, configFromUserInput);
const config = configPath && getConfig(configPath);
const currentVersion = require('../package').version;

(async () => {
    if (isAskingForVersion) {
        logger(currentVersion);
        return;
    }

    const latestVersion = await fetchLatestVersion();

    if (currentVersion !== latestVersion) {
        logger.mustUpdateVersion();
        process.exit(1); // eslint-disable-line
    }

    if (isInitCommand) {
        createConfigFile(configPath);
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
