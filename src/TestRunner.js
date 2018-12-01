const { spawn } = require('child_process');
const logger = require('./logger');

class TestRunner {
    constructor(command, commandArgs) {
        this.command = command;
        this.commandArgs = commandArgs;
    }

    run({ onStart, onFinish }) {
        onStart();
        const childProcess = spawn(this.command, this.commandArgs);

        childProcess.stdout.on('data', logger.encoded);
        childProcess.stderr.on('data', logger.encoded);
        childProcess.on('close', onFinish);
    }
}

module.exports = TestRunner;
