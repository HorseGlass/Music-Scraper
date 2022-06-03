import { NextApiRequest, NextApiResponse } from "next";
const puppeteer = require('puppeteer');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const nowPlayingLink = `https://myonlineradio.hu/${req.query.station}/most-szol`;

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
    console.log(`fulfilled request ${req.query.station} with error message`);
    res.json({status: 'doesn\'t exists', musics: []});
    return;
  } catch(e) {}

  let toDelete = '#main > div.container > div > div.span10 > div.box2 > div.row > div > div > div.radio-songs-cont-list > div.ajax-contact-form.column4.archive-filter.songlist-filter.filter-box';

  await page.evaluate((sel: any) => {
    let e = document.querySelector(sel);
    let e2 = document.querySelector('#main > div.container > div > div.span10 > div.box2 > div.row > div > div > div.radio-songs-cont-list > p');
    let e3 = document.querySelector('#main > div.container > div > div.span10 > div.box2 > div.row > div > div > div.radio-songs-cont-list > div:nth-child(10)');
    e.innerHTML = '';
    (e2 as any).innerHTML = '';
    (e3 as any).innerHTML = '';
  }, toDelete)

  // await page.screenshot({
  //   path: './debug/delete.jpg',
  //   type: 'jpeg'
  // })

  let cookieButton = await page.waitForSelector('body > div.cookie-policy > a.button1.js-cookiePolicyOke');
  await cookieButton.click();

  let songs: {status: string, musics: any[]} = {status: 'parsed', musics: []};
  for (let i = 3; i < 90; i+=2) {
    let songElement = await page.waitForSelector(`#main > div.container > div > div.span10 > div.box2 > div.row > div > div > div.radio-songs-cont-list > div.js-songListC > div:nth-child(${i}) > div.txt1.anim._video.plist-item > span.txtsong.mcolumn`)
    let text = await page.evaluate((e:any) => e.textContent, songElement);

    // if (i == 87) {
    //   await page.screenshot({
    //     path: './debug/idk.jpg',
    //     type: 'jpeg'
    //   })
    // }

    //open
    await songElement.click();
    
    let youtubeIFrame = await page.waitForSelector('body > div.popup_layer > div.layer > div > span > div > iframe');
    let link: string = await page.evaluate((element:any) => element.getAttribute('src'), youtubeIFrame);
    let videoLink: string = `https://youtube.com/watch?v=${link.split('/')[4].split('?')[0]}`;
    songs.musics.push({
      title: text,
      embedLink: link,
      ytLink: videoLink
    })
    await page.mouse.click(10,10);
    // console.log(`done with ${i}`);
  }

  res.status(200).json(songs);
  console.log(`fulfilled request ${req.query.station} with music array`);
  browser.close();
}