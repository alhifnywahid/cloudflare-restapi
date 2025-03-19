import * as cheerio from "cheerio";
import { Context } from "hono";
import URL from "../../../constans/url";
import axios from "../../../lib/fetcher";
import { komikcastReplacer } from "../../../lib/komikcast.tools";
import { Genres } from "../../../types/komikcast-type";

export default {
  route: "/genre/:genreId/:page?",
  method: "GET",
  category: "Komik",
  execute: async (c: Context) => {
    const { genreId, page } = c.req.param();
    const isPage: string = page ? `/page/${page}` : ""
    const response = await axios(URL.KOMIKCAST + "/genres/" + genreId + isPage);
    const $ = cheerio.load(response);
    const genres: Genres[] = $(".genresx li")
      .map((_, v) => {
        const split = $(v).text().trim().split("(");
        return {
          title: split[0].trim(),
          total: Number(split[1].replace(")", "")),
          slug: `/genre/${komikcastReplacer(
            $(v).find("a").attr("href") || ""
          )}`,
        };
      })
      .get();

    const comics = $(".list-update_item")
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

    const currentPage = Number($("span.current").text()) || 1;
    const totalPage = Number($(".pagination .next").prev("a").text()) || 1;
    const pagination = {
      current: currentPage,
      totalPage: totalPage,
      prev: currentPage > 1 ? currentPage - 1 : null,
      next: currentPage && currentPage < totalPage ? currentPage + 1 : null,
    };

    return c.json({
      status: true,
      message: "Berhasil megambil data chapter.",
      data: {
        genres,
        comics,
        pagination,
      },
    });
  },
};
