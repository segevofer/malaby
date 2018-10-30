const logger = require('./logger');

const {spawn} = require('child_process');

class TestRunner {
    constructor(command, commandArgs) {
        this.command = command;
        this.commandArgs = commandArgs;
    }

    run({onStart, onFinish}) {
        const command = spawn(this.command, this.commandArgs);

        onStart();
        command.stdout.on('data', logger.encoded);
        command.stderr.on('data', logger.encoded);
        command.on('close', onFinish);
    }
}

module.exports = TestRunner;