import * as cheerio from "cheerio";
import { Context } from "hono";
import URL from "../../../constans/url";
import axios from "../../../lib/fetcher";
import { Chapter } from "../../../types/comics-response";

export default {
  route: "/komik/:comicID",
  method: "GET",
  category: "Komik",
  execute: async (c: Context) => {
    const { comicID } = c.req.param();

    if (!comicID)
      return c.json({
        status: false,
        message: "comicID is required!!!",
      });

    const response = await axios(URL.KOMIKCAST + "/komik/" + comicID);
    const $ = cheerio.load(response);

    if (!$(".komik_info-content-body-title").text())
      return c.json({
        status: false,
        message: "Komik yang anda cari tidak ada!!!",
      });

    const data: string[] = [];
    const chapter: Chapter[] = [];

    $(".komik_info-content-meta span").each((_, v) => {
      let value = $(v)
        .contents()
        .filter((_, el) => el.type === "text")
        .text()
        .trim();
      const link = $(v).find("a").text().trim();
      const time = $(v).find("time").text().trim();
      if (link) value = link;
      if (time) value = time;

      data.push(value);
    });

    $("#chapter-wrapper li").each((_, v) => {
      chapter.push({
        chapter: $(v).find("a").text().replace("Chapter", "").trim(),
        update: $(v).find("div").text().trim(),
        slug: $(v).find("a").attr("href")?.split("/").reverse()[1] || "",
        visitor: Number($(v).attr("data-visited")) || 0,
      });
    });

    return c.json({
      status: true,
      message: "Berhasil mengambil komik.",
      comic: {
        title: $(".komik_info-content-body-title").text().trim(),
        description: $(".komik_info-content-native").text().trim(),
        thubmnail: $(".komik_info-cover-image > img:nth-child(1)").attr("src"),
        rating: getRate($(".data-rating > strong:nth-child(1)").text()),
        genre: $(".komik_info-content-genre").text().trim().split("\n"),
        released: data[0],
        author: data[1],
        status: data[2],
        type: data[3],
        totalChapter: data[4],
        updateOn: data[5],
        sinopsis: $(".komik_info-description-sinopsis > p:nth-child(1)")
          .text()
          .trim(),
        chapter: chapter.reverse(),
      },
    });
  },
};

function getRate(str: string): number {
  return Number(str.replace("Rating ", "").trim());
}
