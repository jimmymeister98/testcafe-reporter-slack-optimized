import config from './config';
import SlackMessage from './SlackMessage';
import LoggingLevels from './const/LoggingLevels';
import emojis from './utils/emojis';
import { bold, italics } from './utils/textFormatters';

const { loggingLevel } = config;

export default function () {
  return {

    noColors: true,

    reportTaskStart(startTime, userAgents, testCount) {
      this.slack = new SlackMessage();
      this.startTime = startTime;
      this.testCount = testCount;

      const startTimeFormatted = this.moment(this.startTime).format('M/D/YYYY h:mm:ss a');

      //this.slack.sendMessage(`${emojis.rocket} ${'Starting TestCafe:'} ${bold(startTimeFormatted)}\n${emojis.computer} Running ${bold(testCount)} tests in: ${bold(userAgents)}\n`)
    },

    reportFixtureStart(name, path) {
      this.currentFixtureName = name;

      //if (loggingLevel === LoggingLevels.TEST) this.slack.addMessage(bold(this.currentFixtureName));
    },

    reportTestDone(name, testRunInfo) {
      const hasErr = !!testRunInfo.errs.length;
      let message = null;

      if (testRunInfo.skipped) {
        message = `${emojis.fastForward} ${italics(name)} - ${bold('skipped')}`;
      } else if (hasErr) {
        if (this.lastFixtureName !== this.currentFixtureName){
          this.slack.addMessage(this.currentFixtureName.trim() + ":");
        }
        this.lastFixtureName = this.currentFixtureName;
        this.slack.addMessage('•' + name)
        this.renderErrors(testRunInfo.errs);
      }


      //if (loggingLevel === LoggingLevels.TEST) this.slack.addMessage(message);
    },

    renderErrors(errors) {
      errors.forEach((error, id) => {
        this.slack.addErrorMessage(this.formatError(error, `${id + 1} `));
      })
    },

    reportTaskDone(endTime, passed, warnings, result) {
      var durationMs = endTime - this.startTime;
      var durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
      var footer = passed === this.testCount ? passed + '/' +this.testCount + ' tests passed' : this.testCount - passed + '/' + this.testCount + ' failed';

      //var footer = passed + "/" + this.testCount + " tests passed";

      footer = '\n*' + footer + '* (Duration: ' + durationStr + ')';

      this.slack.unshiftMessage(footer);
      this.slack.sendTestReport(this.testCount - passed);
    }
  }
}
