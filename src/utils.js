const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const findUp = require('find-up');
const globToRegExp = require('glob-to-regexp');
const logger = require('./logger');
const malabyConfigExample = require('./malaby-config-example');

const NPM_REGISTRY_URL = 'http://registry.npmjs.org/malaby';
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
    const { isDebug, isInspect, inspectPort, cwd } = options;
    let cmd = debugCommand && isDebug ? debugCommand : command;

    const npmModuleCmd = _.head(cmd.split(' '));
    const commandBinCliPath = path.join(cwd, 'node_modules', '.bin', npmModuleCmd);

    if (fs.existsSync(commandBinCliPath) && (inspectPort || isDebug || isInspect)) {
        cmd = cmd.replace(`${npmModuleCmd} `, `node ${commandBinCliPath} `);
    }

    if (inspectPort) {
        cmd = cmd.replace('node ', `node --inspect-brk=${Number(inspectPort) + 1} `); // Hail to Webstorm
    } else if (isDebug || isInspect) {
        cmd = cmd.replace('node ', 'node --inspect '); // attach to normal node debugger
    }

    return cmd
        .replace('${filePath}', filePath)
        .replace('${fileName}', path.basename(filePath));
};

const fetchLatestVersion = async () => {
    try {
        const response = await axios.get(NPM_REGISTRY_URL);
        return _.get(response.data, ['dist-tags', 'latest']);
    } catch (e) {
        console.log(e); // eslint-disable-line
    }
    return undefined;
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

const getFilesToIgnore = context => _.map(context.config.ignoreOnWatch, globToRegExp);

module.exports = {
    getConfigPath,
    getTestFileAbsolutePath,
    getConfig,
    buildContext,
    buildCommandString,
    fetchLatestVersion,
    createConfigFile,
    getFilesToWatch,
    getFilesToIgnore
};
