const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const r2 = require('r2');
const findUp = require('find-up');
const globToRegExp = require('glob-to-regexp');
const logger = require('./logger');
const malabyConfigExample = require('./malaby-config-example');

const DEFAULT_FILES_TO_WATCH = ['.js'];

function getConfigPath(CWD, testFileDir, configFromUserInput) {
    if (configFromUserInput) {
        const relativePath = path.join(CWD, configFromUserInput);
        const absolutePath = configFromUserInput;

        if (fs.existsSync(relativePath)) {
            return relativePath;
        }
        if (fs.existsSync(absolutePath)) {
            return absolutePath;
        }
        if (fs.existsSync(`${relativePath}.js`)) {
            return `${relativePath}.js`;
        }
        if (fs.existsSync(`${absolutePath}.js`)) {
            return `${absolutePath}.js`;
        }
        return undefined;
    }

    return findUp.sync('malaby-config.json', { cwd: testFileDir }) || findUp.sync('malaby-config.js', { cwd: testFileDir });
}

function getTestFileAbsolutePath(argv, CWD) {
    let result = '';
    _.forEach(argv._, (pathToFile) => {
        if (!pathToFile) {
            return;
        }
        if (fs.existsSync(path.join(CWD, pathToFile))) {
            result = path.join(CWD, pathToFile);
        } else if (fs.existsSync(pathToFile)) {
            result = pathToFile;
        }
    });
    return result;
}

function getConfig(configPath) {
    const isConfigFileExists = fs.existsSync(configPath);
    return isConfigFileExists ? require(configPath) : undefined;
}

const buildContext = (filePath, config) => {
    const context = {
        filePath,
        config: undefined,
        matchingConfigs: [],
        filesToWatch: config.filesToWatch
    };

    _.forEach(config.tests, (currentConfig, key) => {
        const pattern = currentConfig.pattern || key;
        const regex = globToRegExp(pattern);
        const foundConfig = regex.test(filePath);

        if (foundConfig) {
            const matchingConfig = _.defaults(currentConfig, { pattern });
            context.matchingConfigs.push(matchingConfig);
            context.config = matchingConfig;
        }
    });

    return context;
};

const buildCommandString = (config, filePath, options) => {
    const { command, debugCommand } = config;
    const { isDebug, inspectPort } = options;
    let cmd = debugCommand && isDebug ? debugCommand : command;

    if (inspectPort) {
        cmd = cmd.replace('node ', `node --inspect-brk=${Number(inspectPort) + 1} `);
    }

    return cmd
        .replace('${filePath}', filePath)
        .replace('${fileName}', path.basename(filePath));
};

const fetchLatestVersion = async () => {
    const response = await r2.get('http://registry.npmjs.org/malaby').json;
    return _.get(response, ['dist-tags', 'latest']);
};

const createConfigFile = (configPath) => {
    if (fs.existsSync(configPath)) {
        logger.fileAlreadyExist(configPath);
    } else {
        fs.writeFileSync(configPath, JSON.stringify(malabyConfigExample, null, 4));
        logger.configFileWritten(configPath);
    }
};

const getFilesToWatch = context => _(DEFAULT_FILES_TO_WATCH)
    .union(context.filesToWatch)
    .union(context.config.filesToWatch) // additional filesToWatch from currentConfig
    .compact()
    .uniq()
    .value();

module.exports = {
    getConfigPath,
    getTestFileAbsolutePath,
    getConfig,
    buildContext,
    buildCommandString,
    fetchLatestVersion,
    createConfigFile,
    getFilesToWatch
};
