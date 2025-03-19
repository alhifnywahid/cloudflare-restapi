import * as cheerio from "cheerio";
import { Context } from "hono";
import URL from "../../../constans/url";
import axios from "../../../lib/fetcher";

export default {
  route: "/search",
  method: "GET",
  category: "Komik",
  execute: async (c: Context) => {
    const query = c.req.query("query");

    if (!query)
      return c.json({
        status: false,
        message: "Query Wajib diisi!",
      });

    const response = await axios(URL.KOMIKCAST + "/?s=" + query);
    const $ = cheerio.load(response);

    const comics = $(".list-update .list-update_item")
      .map((_, el) => ({
        id: $(el).find("a").attr("data-tooltip-id"),
        slug: $(el).find("a").attr("href")?.split("/")[4] || "",
        type: $(el).find("span.type").text().toUpperCase(),
        thumbnail: $(el).find("img").attr("src"),
        title: $(el).find("h3.title").text(),
        chapter: {
          id: $(el).find("div.chapter").text().replace("Ch.", "").trim(),
          slug: $(el).find("div.chapter").attr("href")?.split("/")[4] || null,
        },
        rating: Number($(el).find(".numscore").text().replaceAll(",", ".")),
      }))
      .get();

      const currentPage = Number($("span.current").text()) || 0;
    const totalPage = Number($(".pagination .next").prev("a").text()) || 0;
    const pagination = {
      current: currentPage,
      totalPage: totalPage,
      prev: currentPage > 1 ? currentPage - 1 : null,
      next: currentPage && currentPage < totalPage ? currentPage + 1 : null,
    };

      if (comics.length == 0)
        return c.json({
          status: false,
          message: `Pencarian \"${query}\" tidak ditemukan!`,
        });

    return c.json({
      status: true,
      message: "Berhasil megambil data chapter.",
      data: {
        comics: comics,
        pagination: pagination
      },
    });
  },
};
