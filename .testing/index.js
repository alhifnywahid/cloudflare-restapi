const cheerio = require("cheerio");

(async () => {
	const response = await fetch("https://komiku.one/", {
		headers: {
			"Accept-Encoding": "gzip, deflate, br, zstd",
			"Accept-Language": "id,en-US;q=0.7,en;q=0.3",
			Connection: "keep-alive",
			Host: "rest-api.jackkolor69.workers.dev",
			Priority: "u=0, i",
      "Server": "cloudflare",
			"Sec-Fetch-Dest": "document",
			"Sec-Fetch-Mode": "navigate",
			"Sec-Fetch-Site": "none",
			"Sec-Fetch-User": "?1",
			TE: "trailers",
			"Upgrade-Insecure-Requests": "1",
			"User-Agent": "	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:135.0) Gecko/20100101 Firefox/135.0",
		},
	});
	const parse = await response.text();
	const $ = cheerio.load(parse);
	console.log($("title").text());
})();
