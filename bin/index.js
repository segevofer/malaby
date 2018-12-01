#!/usr/bin/env node
/* eslint-disable no-var */
/* eslint-disable prefer-template */
var chalk = require('chalk');

var nodeVersion = process.versions.node;
var versions = nodeVersion.split('.').map(num => parseInt(num, 10));
var isNodeVersionCompatible = versions[0] > 7 || (versions[0] === 7 && versions[1] >= 7);

if (!isNodeVersionCompatible) {
    console.log(chalk.red('Your node version is ' + nodeVersion)); // eslint-disable-line
    console.log(chalk.red('malaby requires node version 7.7.0 and above')); // eslint-disable-line
    process.exit(1);
}

module.exports = require('../src/malaby');
