#!/usr/bin/env node
var chalk = require('chalk');
var nodeVersion = process.versions.node;
var versions = nodeVersion.split('.').map(num => parseInt(num, 10));
var isNodeVersionCompatible = versions[0] > 7 || (versions[0] === 7 && versions[1] >= 7);

if (!isNodeVersionCompatible) {
    console.log(chalk.red('Your node version is ' + nodeVersion));
    console.log(chalk.red('malaby requires node version 7.7.0 and above'));
    return;
}

module.exports = require('../src/malaby');