const path = require('path');
const watch = require('node-watch');
const logger = require('./logger');
const TestRunner = require('./TestRunner');

module.exports = (command, commandArgs, {CWD, isWatchMode, isDebug}) => {
    const runTest = new TestRunner(command, commandArgs);

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

    const onFinish = exitCode => {
        inProgress = false;
        if (exitCode === 0) {
            logger.malabyIsSatisfied();
            return;
        }
        if (shouldRunNextTime) {
            shouldRunNextTime = false;
            runTest.run({onStart: onRestart, onFinish});
        }
    };

    runTest.run({onStart, onFinish});

    const shouldRunMultipleTimes = isWatchMode && !isDebug;
    if (shouldRunMultipleTimes) {
        const watchConfig = {
            recursive: true,
            delay: 500,
            filter: file => path.extname(file) === '.js'
        };

        watch(CWD, watchConfig, (/*evt, name*/) => {
            if (inProgress) {
                shouldRunNextTime = true;
            } else {
                runTest.run({onStart: onRestart, onFinish});
            }
        });
    }
};