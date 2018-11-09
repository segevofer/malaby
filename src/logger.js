const _ = require('lodash');
const {red, yellow, green, underline} = require('chalk');

const log = function (msg = '') {
    console.log(msg); // eslint-disable-line
};

const logger = log;

logger.encoded = data => {
    log(`${data}`);
};

logger.debuggerDisconnected = () => {
    log('Debugger disconnected');
};

logger.malabyIsHappy = () => {
    log(`   ${green('🍧 Malaby Is Happy')}\n\n`);
};

logger.help = () => {
    log(red(`\n   Please supply Malaby a file to test! something like this:`));
    log(`   ${yellow('<your-project>')}/${green('malaby')} path/to/testFile.unit.spec.it.ix.something.js\n`);
    log(`   ${underline('Additional options:')}`);
    log(`   --debug: run ndb (https://www.npmjs.com/package/ndb)`);
    log(`   --watch: re-run the test every file change in the project`);
    log(`   --config: specify different config file --config=different-malaby-config.json`);
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
        log(red(`   ${index + 1} - ${pattern}`));
    });
};

logger.noMatchingTestsFound = (filePath, configPath) => {
    log(red(`
    No matching tests found for ${filePath}
    Check your configuration in ${configPath}`));
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

logger.mustUpdateVersion = () => {
    log(`
    A new version of malaby is available
    please run ${green('npm update -g malaby')} to update
    `)
};

logger.logFileChanged = filePath => {
    log(`File changed: ${yellow(filePath)}`);
};

module.exports = logger;