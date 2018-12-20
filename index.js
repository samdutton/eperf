const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const lighthouse = require('lighthouse');
// const log = require('lighthouse-logger');

const INPUT = 'input.csv';
const OUTPUT = 'output.csv';

function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
  return chromeLauncher.launch(flags).then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config)
      .then(results => chrome.kill().then(() => results));
  });
}

const flags = {
  chromeFlags: ['--headless'],
  logLevel: 'info'
};

// log.setLevel(flags.logLevel);

fs.writeFile(OUTPUT, '', () => {
  console.log('Deleted old output file contents');
});

var inputFileText = fs.readFileSync(INPUT, 'utf8');
const allPageData = inputFileText.split('\n');
for (let pageData of allPageData) {
  if (pageData !== '') {
    audit(pageData);
  }
}

function audit(pageData) {
  const url = pageData.split(',')[0];
  launchChromeAndRunLighthouse(url, flags).then(results => {
    const runtimeErrorMessage = results.lhr.runtimeError.message;
    if (runtimeErrorMessage) {
      console.log(`Runtime error for ${url}`);
    } else {
      const categories = Object.values(results.lhr.categories);
      let scores = [];
      for (let category of categories) {
        scores.push(category.score);
      }
      fs.appendFileSync(OUTPUT, `${scores.join(',')},${pageData}\n`);
    }
  });
}

