const _ = require('lodash');
const path = require('path');

const {getConfig, isFlagOn, buildContext, buildCommandString, fetchLatestVersion, createConfigFile} = require('./utils');
const logger = require('./logger');
const malabyRunner = require('./malabyRunner');

const filePath = _.find(process.argv, param => param && param.includes('.js'));
const CWD = process.cwd();
const configPath = `${CWD}/malaby-config.json`;
const config = getConfig(configPath);
const isWatchMode = isFlagOn(process.argv, '--watch');
const isDebug = isFlagOn(process.argv, '--debug');
const isMalabyInit = process.argv.length === 3 && process.argv[2] === 'init';
const isAskingForVersion = isFlagOn(process.argv, '--version');
const currentVersion = require('../package').version;

(async () => {
    if (isAskingForVersion) {
        logger(currentVersion);
        return;
    }

    const latestVersion = await fetchLatestVersion();

    if (currentVersion !== latestVersion) {
        logger.mustUpdateVersion();
        process.exit(1);
    }

    if (isMalabyInit) {
        createConfigFile(configPath);
        return;
    }

    if (!config) {
        logger.couldNotFileConfigurationFile(configPath);
        process.exit(1);
    }

    if (!filePath) {
        logger.help();
        process.exit(1);
    }

    const fileName = path.basename(filePath); // only after filePath validation!
    const context = buildContext(filePath, config);

    if (!context.config) {
        logger.noMatchingTestsFound(filePath, configPath);
        process.exit(1);
    }

    const commandString = buildCommandString(context.config, filePath, fileName, isDebug);
    logger.commandAndSuffixFound(context.config.suffix, filePath, commandString);

    const commandInArray = _.compact([
        isDebug && 'ndb',
        'npx',
        ...commandString.split(' ')
    ]);

    logger.runningCommand(commandInArray.join(' '));
    const command = _.head(commandInArray);
    const commandArgs = _.tail(commandInArray);

    malabyRunner(command, commandArgs, {CWD, isWatchMode, isDebug});
})();
