'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _SlackMessage = require('./SlackMessage');

var _SlackMessage2 = _interopRequireDefault(_SlackMessage);

var _constLoggingLevels = require('./const/LoggingLevels');

var _constLoggingLevels2 = _interopRequireDefault(_constLoggingLevels);

var _utilsEmojis = require('./utils/emojis');

var _utilsEmojis2 = _interopRequireDefault(_utilsEmojis);

var _utilsTextFormatters = require('./utils/textFormatters');

var loggingLevel = _config2['default'].loggingLevel;

exports['default'] = function () {
  return {

    noColors: true,

    reportTaskStart: function reportTaskStart(startTime, userAgents, testCount) {
      this.slack = new _SlackMessage2['default']();
      this.startTime = startTime;
      this.testCount = testCount;

      var startTimeFormatted = this.moment(this.startTime).format('M/D/YYYY h:mm:ss a');

      //this.slack.sendMessage(`${emojis.rocket} ${'Starting TestCafe:'} ${bold(startTimeFormatted)}\n${emojis.computer} Running ${bold(testCount)} tests in: ${bold(userAgents)}\n`)
    },

    reportFixtureStart: function reportFixtureStart(name, path) {
      this.currentFixtureName = name;

      //if (loggingLevel === LoggingLevels.TEST) this.slack.addMessage(bold(this.currentFixtureName));
    },

    reportTestDone: function reportTestDone(name, testRunInfo) {
      var hasErr = !!testRunInfo.errs.length;
      var message = null;

      if (testRunInfo.skipped) {
        message = _utilsEmojis2['default'].fastForward + ' ' + (0, _utilsTextFormatters.italics)(name) + ' - ' + (0, _utilsTextFormatters.bold)('skipped');
      } else if (hasErr) {
        if (this.lastFixtureName !== this.currentFixtureName) {
          this.slack.addMessage(this.currentFixtureName.trim() + ":");
        }
        this.lastFixtureName = this.currentFixtureName;
        this.slack.addMessage('•' + name);
        this.renderErrors(testRunInfo.errs);
      }

      //if (loggingLevel === LoggingLevels.TEST) this.slack.addMessage(message);
    },

    renderErrors: function renderErrors(errors) {
      var _this = this;

      errors.forEach(function (error, id) {
        _this.slack.addErrorMessage(_this.formatError(error, id + 1 + ' '));
      });
    },

    reportTaskDone: function reportTaskDone(endTime, passed, warnings, result) {
      var durationMs = endTime - this.startTime;
      var durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
      var footer = passed === this.testCount ? passed + '/' + this.testCount + ' tests passed' : this.testCount - passed + '/' + this.testCount + ' failed';

      //var footer = passed + "/" + this.testCount + " tests passed";

      footer = '\n*' + footer + '* (Duration: ' + durationStr + ')';

      this.slack.unshiftMessage(footer);
      this.slack.sendTestReport(this.testCount - passed);
    }
  };
};

module.exports = exports['default'];