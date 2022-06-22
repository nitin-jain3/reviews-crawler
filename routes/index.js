var express = require('express');
var router = express.Router();
const puppeteer = require('puppeteer');

function refactorReviews({ reviews = [] }) {
  const len = reviews.length;
  if (!len || len === 1) return { data: {} }; //The first element doesn't have the needed data
  reviews.shift();
  const reviewsMap = {};
  reviews.forEach((review, index) => {
    reviewsMap[index] = review;
  });
  // As there was not specfied how the format of the reviews should, below is the array having all of it.
  return  { reviewsMap };
}

async function getHtmlFromUrl({ url = '' }) {
  if (!url) return { reviews: [] };
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(url);
  const reviews = await page.evaluate(() => {
    let customerData = document.querySelectorAll('#customerReviews');
    const headingData = [...customerData];
    return headingData.map(h => h.innerText);
  })
  await browser.close()
  return { reviews };
}

/* GET reviews listing. */
router.get('/', async function (req, res, next) {
  try {
    const { url = '' } = req.query;
    const { reviews = [] } = await getHtmlFromUrl({ url });
    const { reviewsMap } = refactorReviews({ reviews });
    res.send({ code: 200, data: reviewsMap, message: 'reviews fetched successfully' });
  } catch (e) {
    console.log(e);
    res.send({ code: 500, data: e.message, message: 'error occured' });
  }
});

module.exports = router;

module.exports = router;
