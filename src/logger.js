const _ = require("lodash");
const path = require("path");
const { red, yellow, green, underline, gray } = require("chalk");

const log = (msg = "") => {
  console.log(msg); // eslint-disable-line
};

const logIndent = (msg) => {
  console.log(`    ${msg}`); // eslint-disable-line
};

const logger = log;

logger.encoded = (data) => {
  log(`${data}`);
};

logger.debuggerDisconnected = () => {
  log("Debugger disconnected");
};

logger.malabyIsHappy = () => {
  logIndent(`${green("🍧 Malaby Is Happy")}\n\n`);
};

logger.pleaseSupplyTestFile = () => {
  logIndent(red("Please supply Malaby a file to test! something like this:"));
  logIndent(
    `${yellow("<your-project>")}/${green(
      "malaby"
    )} path/to/testFile.unit.spec.it.ix.something.js\n`
  );
};

logger.couldNotLocateTestFile = (CWD, potentialTestFiles) => {
  if (potentialTestFiles.length) {
    log(red("Could not locate the test file you are trying to run."));
    log(underline(red("Check your path to the test file\n")));
    logIndent("Malaby was looking for these file(s):");
    _.forEach(potentialTestFiles, (potentialTestFile) => {
      logIndent(red(path.join(CWD, potentialTestFile)));
    });
  } else {
    logger.pleaseSupplyTestFile();
  }

  log(
    `\nType ${green(
      "malaby --help"
    )} to learn more, or checkout https://www.npmjs.com/package/malaby\n`
  );
};

logger.help = () => {
  log();
  logger.pleaseSupplyTestFile();
  logIndent(`${underline("Additional options:")}`);
  logIndent("--watch      re-run the test every file change in the project");
  logIndent(
    "--debug      run debugCommand for this test, if found in malaby-config.json file"
  );
  logIndent(
    "--ndb        run the test with ndb (https://www.npmjs.com/package/ndb)"
  );
  logIndent(
    "--config     specify different config file --config=different-malaby-config.json"
  );
};

logger.couldNotFileConfigurationFile = (
  defaultConfigPath,
  configFromUserInput
) => {
  const configurationPath = configFromUserInput || defaultConfigPath;
  log(
    `${red("Could not find configuration file")} ${yellow(configurationPath)}`
  );
  if (!configFromUserInput) {
    log(`type ${green("malaby init")} to create it`);
  }
};

logger.moreThanOneConfigFound = (filePath, matchingConfigs) => {
  log(red(`More than one configs were found for ${filePath}\n`));
  _.forEach(matchingConfigs, ({ pattern }, index) => {
    logIndent(red(`${index + 1} - ${pattern}`));
  });
};

logger.noMatchingTestsFound = (filePath, configPath) => {
  log();
  logIndent(red(`No matching tests found for ${filePath}`));
  logIndent(red(`Check your configuration in ${configPath}`));
};

logger.testFileDoesNotExist = (fileAbsolutePath) => {
  log(`Test file doesn't exist: ${red(fileAbsolutePath)}`);
};

logger.testInProgress = () => {
  log(yellow("Test in progress...\n"));
};

logger.restartTestInProgress = () => {
  log(yellow("Running the test again...\n"));
};

logger.runningCommand = (filePath, cwd, command) => {
  log(gray(`Running test from: ${cwd}`));
  log(`File: ${green(filePath)}`);
  log(`Running: ${green(command)}`);
};

logger.mustUpdateVersion = (latestVersion) => {
  log();
  logIndent(`A new version of malaby is available: ${latestVersion}`);
  logIndent(`run ${green("npm update -g malaby")}\n`);
};

logger.fileAlreadyExist = (configPath) => {
  log(red(`File already exist ${configPath}`));
};

logger.configFileWritten = (configPath) => {
  log();
  logIndent("Successfully written malaby-config file.");
  logIndent(`edit file ${green(configPath)} with your configuration`);
};

logger.logFileChanged = (filePath) => {
  log(`File changed: ${yellow(filePath)}`);
};

module.exports = logger;
