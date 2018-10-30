const _ = require('lodash');
const path = require('path');

const {
    getConfig,
    isFlagOn,
    buildContext,
    buildCommandString,
    fetchLatestVersion,
    createConfigFile,
    getConfigPath
} = require('./utils');

const logger = require('./logger');
const malabyRunner = require('./malabyRunner');

const CWD = process.cwd();
const filePath = _.find(process.argv, param => param && param.includes('.js'));
const userInputConfigArg = _.find(process.argv, arg => arg.indexOf('--config') !== -1);
const configFromUserInput = userInputConfigArg && userInputConfigArg.split('=')[1];
const isInitCommand = process.argv.length === 3 && process.argv[2] === 'init';
const isWatchMode = isFlagOn(process.argv, '--watch');
const isDebug = isFlagOn(process.argv, '--debug');
const isAskingForVersion = isFlagOn(process.argv, '--version');


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
        process.exit(1);
    }

    if (isInitCommand) {
        createConfigFile(configPath);
        return;
    }

    if (!config) {
        logger.couldNotFileConfigurationFile(configPath, configFromUserInput);
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
