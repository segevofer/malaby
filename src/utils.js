const _ = require('lodash');
const fs = require('fs');
const http = require('http');
const logger = require('./logger');

function getConfigPath(CWD, configFromUserInput) {
    if (configFromUserInput) {
        const relativePath = `${CWD}/${configFromUserInput}`;
        const absolutePath = configFromUserInput;

        if (fs.existsSync(relativePath)) {
            return relativePath;
        } else if (fs.existsSync(absolutePath)) {
            return absolutePath;
        } else {
            return undefined;
        }
    }
    return `${CWD}/malaby-config.json`;
}

function getConfig(configPath) {
    const isConfigFileExists = fs.existsSync(configPath);
    return isConfigFileExists ? require(configPath) : undefined;
}

const isFlagOn = (argv, flagName) => !!_.find(argv, param => param === flagName);

const buildContext = (filePath, config) => {
    const context = {
        filePath,
        config: undefined
    };

    _.forEach(config, (suffixConfig, suffix) => {
        const found = filePath.match(suffix);
        const isMatch = _.head(found) === suffix;

        if (isMatch) {
            if (context.config) {
                logger.moreThanOneConfigFound(filePath, suffix, _.head(found));
                throw(new Error(`More than one config found for ${filePath}`))
            } else {
                context.config = _.assign(suffixConfig, {suffix});
            }
        }
    });

    return context;
};

const buildCommandString = ({command, debugCommand = undefined}, filePath, fileName, isDebug) => {
    if (debugCommand && isDebug) {
        return debugCommand
            .replace('${filePath}', filePath)
            .replace('${fileName}', fileName);
    }

    return command
        .replace('${filePath}', filePath)
        .replace('${fileName}', fileName);
};

const fetchLatestVersion = () => new Promise((resolve, reject) => {
    http.get('http://registry.npmjs.org/malaby', response => {
        let body = '';
        response.on('data', d => body += d);
        response.on('error', err => reject(err));
        response.on('err', err => reject(err));
        response.on('end', () => {
            const parsed = JSON.parse(body);
            const latestVersion = parsed['dist-tags'].latest;
            resolve(latestVersion);
        });
    });
});

const createConfigFile = configPath => {
    if (fs.existsSync(configPath)) {
        logger(`File already exist ${configPath}`);
    } else {
        const configExample = require('../malaby-config-example');
        fs.writeFileSync(configPath, JSON.stringify(configExample, null, 4));
    }
};

module.exports = {
    getConfigPath,
    getConfig,
    isFlagOn,
    buildContext,
    buildCommandString,
    fetchLatestVersion,
    createConfigFile
};