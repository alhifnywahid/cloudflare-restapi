import * as cheerio from "cheerio";
import { Context } from "hono";
import URL from "../../../constans/url";
import axios from "../../../lib/fetcher";

export default {
  route: "/komik",
  method: "GET",
  category: "Komik",
  execute: async (c: Context) => {
    const { page, genre, status, type, orderby } = c.req.query();

    const hasMultiplePages = page && Number(page) > 1;
    const pagePath = hasMultiplePages ? `/page/${page}` : "";
    const params = [
      `genre[]=${genre || ""}`,
      `status=${status || ""}`,
      `type=${type || ""}`,
      `orderby=${orderby || ""}`,
    ].join("&");

    const paramsLength = Object.keys(c.req.query()).filter(
      (v) => v != "page"
    ).length;
    const searchParams = paramsLength != 0 ? params : "";
    const response = await axios(
      URL.KOMIKCAST + `/daftar-komik${pagePath}?${searchParams}`
    ); 
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

    // Mengambil daftar genre
    const genres = $(".genrez li")
      .map((_, el) => ({
        id: $(el).find("input").attr("id"),
        title: $(el).find("label").text().trim(),
      }))
      .get();
    return c.json({
      status: true,
      message: "Berhasil mengambil data",
      data: { comics, genres, pagination },
    });
  },
};
