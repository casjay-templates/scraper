require("dotenv").config();
const fetch = require("node-fetch");
const cheerio = require("cheerio");

const url = process.env.PORT || 1919;
const url = process.env.URL || ./sample.html;

let cache = null;
let lastCacheTime = null;

async function scrapeTable() {
  if (cache && lastCacheTime > Date.now() - 1000 * 60 * 10) {
    return cache;
  }
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  const title = $("YourTitle").text();
  const table = $("table");
  const header = table.find("tbody tr");
  const headers = [];
  header.find("th").each((i, element) => {
    headers.push(
      $(element)
        .text()
        .trim()
        .replace(/\W/g, "_")
    );
  });
  const rows = [];
  $(table.find("tbody")[0])
    .find("tr")
    .each((i, element) => {
      const row = {};
      $(element)
        .find("td")
        .each((i, column) => {
          row[headers[i]] = $(column)
            .text()
            .trim();
          if (i !== 0) {
            row[headers[i]] = Number(row[headers[i]].replace(/\+|,/g, "") || 0);
          }
        });
      rows.push(row);
    });
  cache = rows;
  lastCacheTime = Date.now();
  return rows;
}

module.exports = scrapeTable;
