const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const minimist = require("minimist");

const argv = minimist(process.argv.slice(2));
const execArgv = minimist(process.execArgv);

const {
  getConfig,
  buildContext,
  buildCommandString,
  fetchLatestVersion,
  createConfigFile,
  getConfigPath,
  getTestFileAbsolutePath,
  getFilesToWatch,
  getFilesToIgnore,
} = require("./utils");

const logger = require("./logger");
const malabyRunner = require("./malabyRunner");
const currentVersion = require("../package").version;

const CWD = process.cwd();
const testFileAbsolutePath = getTestFileAbsolutePath(argv, CWD);
const testFileDir = path.dirname(testFileAbsolutePath);

const configFromUserInput = argv.config;
const isWatchMode = argv.watch;
const isDebug = argv.debug;
const isNdb = argv.ndb;
const isHelp = argv.help;
const isInitCommand =
  argv.init || (argv._.length === 1 && _.head(argv._) === "init");

const isInspect = execArgv.inspect;
const inspectPort = execArgv["inspect-brk"];

const configPath = getConfigPath(CWD, testFileDir, configFromUserInput);
const config = configPath && getConfig(configPath);
const defaultConfigPath = path.join(CWD, "malaby-config.json");

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
    process.exit(0);
  }

  if (!testFileAbsolutePath) {
    logger.couldNotLocateTestFile(CWD, argv._);
    process.exit(1);
  }

  if (!config) {
    logger.couldNotFileConfigurationFile(
      defaultConfigPath,
      configFromUserInput
    );
    process.exit(1);
  }

  const context = buildContext(testFileAbsolutePath, config);
  const configPathCwd = path.dirname(configPath);

  if (context.matchingConfigs.length === 0) {
    logger.noMatchingTestsFound(testFileAbsolutePath, configPath);
    process.exit(1);
  } else if (context.matchingConfigs.length > 1) {
    logger.moreThanOneConfigFound(
      testFileAbsolutePath,
      context.matchingConfigs
    );
    process.exit(1);
  }

  if (!fs.existsSync(testFileAbsolutePath)) {
    logger.testFileDoesNotExist(testFileAbsolutePath);
    process.exit(1);
  }

  const options = {
    isDebug,
    isWatchMode,
    isInspect,
    inspectPort,
    cwd: configPathCwd,
  };
  const commandString = buildCommandString(
    context.config,
    testFileAbsolutePath,
    options
  );
  const commandInArray = _.compact([
    isNdb && "ndb",
    "npx",
    ...commandString.split(" "),
  ]);

  logger.runningCommand(
    testFileAbsolutePath,
    configPathCwd,
    commandInArray.join(" ")
  );

  const command = _.head(commandInArray);
  const commandArgs = _.tail(commandInArray);
  const filesToWatch = getFilesToWatch(context);
  const filesToIgnore = getFilesToIgnore(context);

  const malabyRunnerOptions = _.defaults(
    { filesToWatch, filesToIgnore },
    options
  );
  malabyRunner(command, commandArgs, malabyRunnerOptions);
})();
