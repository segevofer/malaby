const { spawn } = require("child_process");
const logger = require("./logger");

class TestRunner {
  constructor(command, commandArgs, cwd) {
    this.command = command;
    this.commandArgs = commandArgs;
    this.cwd = cwd;
  }

  run({ onStart, onFinish }) {
    onStart();
    const childProcess = spawn(this.command, this.commandArgs, {
      cwd: this.cwd,
    });

    childProcess.stdout.on("data", logger.encoded);
    childProcess.stderr.on("data", logger.encoded);
    childProcess.on("close", onFinish);
  }
}

module.exports = TestRunner;
