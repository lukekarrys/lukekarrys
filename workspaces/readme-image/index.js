const Parser = require("rss-parser");
const { sample } = require("lodash");
const fs = require("fs/promises");
const { resolve } = require("path");
const cheerio = require("cheerio");

const DOMAIN = "https://photos.lukelov.es";

const main = async ({ dry = true } = {}) => {
  const parser = new Parser();
  const feed = await parser.parseURL(`${DOMAIN}/feed.xml`);

  const readmePath = resolve(__dirname, "..", "..", "README.md");

  const item = sample(feed.items);
  const $ = cheerio.load(item.content.trim());
  const img = $("img").attr("src");
  const md = `[![${item.title}](${img})](${item.link})`;

  // replace first line of readme with the image
  const readme = await fs.readFile(readmePath, "utf-8");
  const lines = readme.split("\n").slice(1);
  !dry && (await fs.writeFile(readmePath, [md, ...lines].join("\n"), "utf-8"));

  return {
    title: item.title,
    link: item.link,
    img,
    raw: item,
  };
};

main({ dry: !process.env.CI }).then(console.log).catch(console.error);
