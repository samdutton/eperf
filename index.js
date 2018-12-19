const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const lighthouse = require('lighthouse');
const log = require('lighthouse-logger');

const OUTPUT_FILEPATH = 'lhr.json';

function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
  return chromeLauncher.launch(flags).then(chrome => {
    flags.port = chrome.port;
    return lighthouse(url, flags, config).then(results =>
      chrome.kill().then(() => results));
  });
}

const flags = {
  chromeFlags: ['--headless'],
  logLevel: 'info', 
};

//log.setLevel(flags.logLevel);

const url = 'https://github.com';
launchChromeAndRunLighthouse(url, flags).then(results => {
    fs.writeFile(OUTPUT_FILEPATH, '', 
      () => {console.log('Deleted old file contents')});
    // console.log('results.lhr.categories', results.lhr.categories);
    const categories = Object.values(results.lhr.categories);
    categories.forEach(category => {
        console.log(category.title, category.score);
        fs.appendFileSync(OUTPUT_FILEPATH, 
          `${url}, ${category.title}, ${category.score}\n`);
  });
});

