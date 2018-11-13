const _ = require('lodash');
const {red, yellow, green, underline} = require('chalk');

const log = function (msg = '') {
    console.log(msg); // eslint-disable-line
};

const logIndent = msg => {
    console.log(`    ${msg}`); // eslint-disable-line
};

const logger = log;

logger.encoded = data => {
    log(`${data}`);
};

logger.debuggerDisconnected = () => {
    log('Debugger disconnected');
};

logger.malabyIsHappy = () => {
    logIndent(`${green('🍧 Malaby Is Happy')}\n\n`);
};

logger.help = () => {
    log();
    logIndent(red(`Please supply Malaby a file to test! something like this:`));
    logIndent(`${yellow('<your-project>')}/${green('malaby')} path/to/testFile.unit.spec.it.ix.something.js\n`);
    logIndent(`${underline('Additional options:')}`);
    logIndent(`--debug: run ndb (https://www.npmjs.com/package/ndb)`);
    logIndent(`--watch: re-run the test every file change in the project`);
    logIndent(`--config: specify different config file --config=different-malaby-config.json`);
};

logger.couldNotFileConfigurationFile = (configPath, configFromUserInput) => {
    const path = configFromUserInput || configPath;
    log(`${red('Could not find configuration file')} ${yellow(path)}`);
    if (!configFromUserInput) {
        log(`type ${green('malaby init')} to create it`);
    }
};

logger.moreThanOneConfigFound = (filePath, matchingConfigs) => {
    log(red(`More than one configs were found for ${filePath}\n`));
    _.forEach(matchingConfigs, ({pattern}, index) => {
        logIndent(red(`${index + 1} - ${pattern}`));
    });
};

logger.noMatchingTestsFound = (filePath, configPath) => {
    log();
    logIndent(red(`No matching tests found for ${filePath}`));
    logIndent(red(`Check your configuration in ${configPath}`));
};

logger.testFileDoesNotExist = fileAbsolutePath => {
    log(`Test file doesn't exist: ${red(fileAbsolutePath)}`);
};

logger.testInProgress = () => {
    log(yellow(`Test in progress...\n`));
};

logger.restartTestInProgress = () => {
    log(yellow(`Running the test again...\n`));
};

logger.runningCommand = (filePath, command) => {
    log(`File: ${green(filePath)}`);
    log(`Running: ${green(command)}`);
};

logger.mustUpdateVersion = latestVersion => {
    log();
    logIndent(`A new version of malaby is available: ${latestVersion}`);
    logIndent(`run ${green('npm i -g malaby')}\n`);
};

logger.fileAlreadyExist = configPath => {
    log(red(`File already exist ${configPath}`));
};

logger.configFileWritten = configPath => {
    log();
    logIndent(`Successfully written malaby-config file.`);
    logIndent(`edit file ${green(configPath)} with your configuration`);
};

logger.logFileChanged = filePath => {
    log(`File changed: ${yellow(filePath)}`);
};

module.exports = logger;