const _ = require('lodash');
const path = require('path');
const watch = require('node-watch');
const logger = require('./logger');
const TestRunner = require('./TestRunner');

const malabyRunner = (command, commandArgs, { cwd, isWatchMode, isDebug, filesToWatch }) => { // eslint-disable-line
    const runTest = new TestRunner(command, commandArgs, cwd);

    let inProgress = false;
    let shouldRunNextTime = false;

    const onStart = () => {
        inProgress = true;
        logger.testInProgress();
    };

    const onRestart = () => {
        inProgress = true;
        logger.restartTestInProgress();
    };

    const onFinish = (exitCode) => {
        inProgress = false;
        if (exitCode === 0) {
            if (isDebug) {
                logger.debuggerDisconnected();
            } else {
                logger.malabyIsHappy();
            }
        } else if (shouldRunNextTime) {
            shouldRunNextTime = false;
            runTest.run({ onStart: onRestart, onFinish });
        }
    };

    runTest.run({ onStart, onFinish });

    const shouldRunMultipleTimes = isWatchMode && !isDebug;
    if (shouldRunMultipleTimes) {
        const watchConfig = {
            recursive: true,
            delay: 500,
            filter: file => _.includes(filesToWatch, path.extname(file))
        };

        watch(cwd, watchConfig, (event, filePath) => {
            logger.logFileChanged(filePath);
            if (inProgress) {
                shouldRunNextTime = true;
            } else {
                runTest.run({ onStart: onRestart, onFinish });
            }
        });
    }
};

module.exports = malabyRunner;
