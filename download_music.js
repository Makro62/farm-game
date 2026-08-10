const https = require('https');
const fs = require('fs');
const path = require('path');

const url = 'https://archive.org/download/lofi-chill/1.%20lofi-chill.mp3';
const dest1 = path.join(__dirname, 'public', 'music', 'farm-theme.mp3');
const dest2 = path.join(__dirname, 'public', 'music', 'menu-theme.mp3');
const dest3 = path.join(__dirname, 'public', 'music', 'event-theme.mp3');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  try {
    console.log('Downloading MP3...');
    await download(url, dest1);
    console.log('Downloaded to farm-theme.mp3');
    fs.copyFileSync(dest1, dest2);
    fs.copyFileSync(dest1, dest3);
    console.log('Copied to menu-theme and event-theme.mp3. Done!');
  } catch (err) {
    console.error('Download failed:', err);
  }
}

run();
