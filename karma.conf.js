// karma.conf.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {},
      clearContext: false, // deja visible el runner en el browser (útil en test:watch)
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    coverageReporter: {
      dir: path.join(__dirname, './coverage'),
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
      check: { global: { statements: 80, branches: 70, functions: 80, lines: 80 } },
    },
    browsers: ['ChromeHeadless'],
    singleRun: false,
    restartOnFileChange: true,
  });
};
