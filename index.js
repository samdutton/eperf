const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const lighthouse = require('lighthouse');
// const log = require('lighthouse-logger');

const OUTPUT_FILEPATH = 'lhr.json';

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

const name = 'John Lewis';
const type = 'home';
const url = 'https://johnlewis.com';

let allSiteResults = [];
fs.writeFile(OUTPUT_FILEPATH, '', () => {
  console.log('Deleted old output file contents');
});

launchChromeAndRunLighthouse(url, flags).then(results => {
  // fs.appendFileSync(OUTPUT_FILEPATH, JSON.stringify(results));
  // console.log('>>>>>', JSON.stringify(results));
  const runtimeErrorMessage = results.lhr.runtimeError.message;
  if (runtimeErrorMessage) {
    console.log(`Runtime error for ${url}`);
  } else {
    let siteResults = [`${name}`,`${type}`,`${url}`];
    const categories = Object.values(results.lhr.categories);
    for (let category of categories) {
      siteResults.push(`${category.score}`);
    }
    allSiteResults.push(siteResults.join(','));
    // console.log(allSiteResults.join('\n'));
    fs.appendFileSync(OUTPUT_FILEPATH, allSiteResults.join('\n'));
  }
});


