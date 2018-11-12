const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const http = require('http');
const logger = require('./logger');
const globToRegExp = require('glob-to-regexp');
const DEFAULT_FILES_TO_WATCH = ['.js'];

function getConfigPath(CWD, configFromUserInput) {
    if (configFromUserInput) {
        const relativePath = `${CWD}/${configFromUserInput}`;
        const absolutePath = configFromUserInput;

        if (fs.existsSync(relativePath)) {
            return relativePath;
        } else if (fs.existsSync(absolutePath)) {
            return absolutePath;
        } else if (fs.existsSync(`${relativePath}.js`)) {
            return `${relativePath}.js`;
        } else if (fs.existsSync(`${absolutePath}.js`)) {
            return `${absolutePath}.js`;
        } else {
            return undefined;
        }
    }

    if (fs.existsSync(path.join(CWD, 'malaby-config.json'))) {
        return path.join(CWD, 'malaby-config.json');
    } else if (fs.existsSync(path.join(CWD, 'malaby-config.js'))) {
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
            const matchingConfig = _.defaults(currentConfig, {pattern});
            context.matchingConfigs.push(matchingConfig);
            context.config = matchingConfig;
        }
    });

    return context;
};

const buildCommandString = ({command, debugCommand = undefined}, filePath, fileName, isDebug, inspectPort) => {
    let cmd = debugCommand && isDebug ? debugCommand : command;

    if (inspectPort) {
        cmd = cmd.replace('node ', `node --inspect-brk=${Number(inspectPort) + 1} `);
    }

    return cmd
        .replace('${filePath}', filePath)
        .replace('${fileName}', fileName);
};

const fetchLatestVersion = currentVersion => new Promise(resolve => {
    http.get('http://registry.npmjs.org/malaby', response => {
        let body = '';
        response.on('data', d => body += d);
        response.on('error', () => resolve(currentVersion));
        response.on('err', () => resolve(currentVersion));
        response.on('end', () => {
            const parsed = JSON.parse(body);
            const latestVersion = parsed['dist-tags'].latest;
            resolve(latestVersion);
        });
    }).on('error' , () => resolve(currentVersion));
});

const createConfigFile = configPath => {
    if (fs.existsSync(configPath)) {
        logger(`File already exist ${configPath}`);
    } else {
        const configExample = require('./malaby-config-example');
        fs.writeFileSync(configPath, JSON.stringify(configExample, null, 4));
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