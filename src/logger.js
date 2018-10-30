const chalk = require('chalk');
const {red, yellow, green} = chalk;

const log = function (msg = '') {
    console.log(msg); // eslint-disable-line
};

const logger = log;

logger.encoded = data => {
    log(`${data}`);
};

logger.malabyIsSatisfied = () => {
    log(`   ${green('🍧 Malaby Is Happy')}\n\n`);
};

logger.help = () => {
    log(red(`\n   Please supply Malaby a file to test! something like this:`));
    log(`   ${yellow('<your-project>')}/${green('malaby')} path/to/testFile.unit.spec.it.ix.something.js\n`);
    log(`   ${chalk.underline('Additional options:')}`);
    log(`   --debug: run ndb (https://www.npmjs.com/package/ndb)`);
    log(`   --watch: re-run the test every file change in the project`);
};

logger.couldNotFileConfigurationFile = configPath => {
    log(`${red('Could not find configuration file')} ${yellow(configPath)}\ntype ${green('malaby init')} to create it`);
};

logger.moreThanOneConfigFound = (filePath, suffix, config) => {
    log(red(`More than one config found for ${filePath}`));
    log(suffix, config);
};

logger.noMatchingTestsFound = (filePath, configPath) => {
    log(red(`
    No matching tests found for ${filePath}
    Check your configuration in ${configPath}`));

};

logger.commandAndSuffixFound = (suffix, filePath, commandString) => {
    log(yellow(`Found Matching tests for suffix ${suffix}`));
    log(`File: ${green(filePath)}\nCommand: ${green(commandString)}`);
};

logger.testInProgress = () => {
    log(yellow(`Test in progress...\n`));
};

logger.restartTestInProgress = () => {
    log(yellow(`Running the test again...\n`));
};

logger.runningCommand = command => {
    log(`Running: ${green(command)}`);
};

logger.mustUpdateVersion = () => {
    log(`
    A new version of malaby is available
    please run ${green('npm update -g malaby')} to update
    `)
};

module.exports = logger;