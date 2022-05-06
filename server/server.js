const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const AdmZip = require("adm-zip");
const { ffprobe } = require('fluent-ffmpeg');

app.use(cors());

app.get('/scrape/:station', async (req, res) => {
  console.log(`got request ${req.params.station}`);
  const nowPlayingLink = `https://myonlineradio.hu/${req.params.station}/most-szol`;

  const browser = await puppeteer.launch({});
  const page = await browser.newPage();
  await page.setViewport({width: 500, height: 3200, hasTouch: false, isMobile: false});
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
  page.goto(nowPlayingLink);

  await Promise.race([
    page.waitForNavigation({waitUntil: 'domcontentloaded'}),
    page.waitForNavigation({waitUntil: 'load'})
  ]);

  try {
    await page.waitForSelector('.page-404', {timeout: 250});
    console.log(`fulfilled request ${req.params.station} with error message`);
    res.json({status: 'doesn\'t exists', musics: []});
    return;
  } catch(e) {}

  let toDelete = '#main > div.container > div > div.span10 > div.box2 > div.row > div > div > div.radio-songs-cont-list > div.ajax-contact-form.column4.archive-filter.songlist-filter.filter-box';

  await page.evaluate(sel => {
    let e = document.querySelector(sel);
    let e2 = document.querySelector('#main > div.container > div > div.span10 > div.box2 > div.row > div > div > div.radio-songs-cont-list > p');
    let e3 = document.querySelector('#main > div.container > div > div.span10 > div.box2 > div.row > div > div > div.radio-songs-cont-list > div:nth-child(10)');
    e.innerHTML = '';
    e2.innerHTML = '';
    e3.innerHTML = '';
  }, toDelete)

  await page.screenshot({
    path: './debug/delete.jpg',
    type: 'jpeg'
  })

  let cookieButton = await page.waitForSelector('body > div.cookie-policy > a.button1.js-cookiePolicyOke');
  await cookieButton.click();

  let songs = {status: 'parsed', musics: []};
  for (let i = 3; i < 90; i+=2) {
    let songElement = await page.waitForSelector(`#main > div.container > div > div.span10 > div.box2 > div.row > div > div > div.radio-songs-cont-list > div.js-songListC > div:nth-child(${i}) > div.txt1.anim._video.plist-item > span.txtsong.mcolumn`)
    let text = await page.evaluate(e => e.textContent, songElement);

    if (i == 87) {
      await page.screenshot({
        path: './debug/idk.jpg',
        type: 'jpeg'
      })
    }

    //open
    await songElement.click();
    
    let youtubeIFrame = await page.waitForSelector('body > div.popup_layer > div.layer > div > span > div > iframe');
    let link = await page.evaluate(element => element.getAttribute('src'), youtubeIFrame);
    let videoLink = `https://youtube.com/watch?v=${link.split('/')[4].split('?')[0]}`;
    songs.musics.push({
      title: text,
      embedLink: link,
      ytLink: videoLink
    })
    await page.mouse.click(10,10);
    console.log(`done with ${i}`);
  }

  res.json(songs);
  console.log(`fulfilled request ${req.params.station} with music array`);
  browser.close();
})

app.get('/downloadmusic', async (req, res) => {
  if (req.query.data) {
    let zipPath = `./cache/${new Date().valueOf()}.zip`
    console.log(`got download request ${zipPath}`);
    let returnZip = new AdmZip();
    let done = 0;
    let jsonData = JSON.parse(decodeURIComponent(req.query.data));
    for (let i = 0; i < jsonData.length; i++) {
      const music = jsonData[i];
      let stream = ytdl(music.link, {quality: 'highestaudio'});
      ffmpeg(stream).audioBitrate(128).save(`./cache/${music.artist} - ${music.title}.mp3`)
        .outputOptions('-metadata', `title=${music.title}`, '-metadata', `artist=${music.artist}`)
        .on('start', cmd => console.log(cmd))
        .on('error', (err) => console.log(err.message))
        .on('end', function(stdout, stderr) {
          done+=1;
          returnZip.addLocalFile(`./cache/${music.artist} - ${music.title}.mp3`);
          if (done === jsonData.length) {
            returnZip.writeZip(zipPath);
            res.sendFile(`${__dirname}${zipPath.replace('./', '\\')}`);
            console.log(`fulfilled request ${zipPath}`);
          }
        })
    }
    // fs.writeFileSync('./debug/ffprobe.json', JSON.stringify(metadatas, null, 4), 'utf-8');
    // for (const file of fileList) {
    //   fs.unlinkSync(file);
    // }
  }
});

app.listen(3001, () => {
  console.log('started backend on :3001');
});