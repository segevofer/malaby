const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const r2 = require('r2');
const globToRegExp = require('glob-to-regexp');
const logger = require('./logger');
const malabyConfigExample = require('./malaby-config-example');

const DEFAULT_FILES_TO_WATCH = ['.js'];

function getConfigPath(CWD, configFromUserInput) {
    if (configFromUserInput) {
        const relativePath = `${CWD}/${configFromUserInput}`;
        const absolutePath = configFromUserInput;

        // TODO: change this to use path search backwards
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

    if (fs.existsSync(path.join(CWD, 'malaby-config.json'))) {
        return path.join(CWD, 'malaby-config.json');
    }
    if (fs.existsSync(path.join(CWD, 'malaby-config.js'))) {
        return path.join(CWD, 'malaby-config.js');
    }

    return undefined;
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

const buildCommandString = (config, CWD, filePath, options) => {
    const { command, debugCommand } = config;
    const { isDebug, isInspect } = options;
    let cmd = debugCommand && isDebug ? debugCommand : command;

    if (isInspect) {
        cmd = cmd.replace('node ', 'node --inspect '); // TODO: check that it works!
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
    getConfig,
    buildContext,
    buildCommandString,
    fetchLatestVersion,
    createConfigFile,
    getFilesToWatch
};
