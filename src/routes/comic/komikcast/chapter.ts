import * as cheerio from "cheerio";
import { Context } from "hono";
import URL from "../../../constans/url";
import axios from "../../../lib/fetcher";

export default {
  route: "/chapter/:chapterID",
  method: "GET",
  category: "Komik",
  execute: async (c: Context) => {
    try {
      const { chapterID } = c.req.param();
      const response = await axios(URL.KOMIKCAST + "/chapter/" + chapterID);
      const $ = cheerio.load(response);
      const title: string = $('h1[itemprop="name"]').text();
      const chapters = $(".left-control-new #slch option")
        .map((_, v) => ({
          title: $(v).text().trim(),
          slug: $(v).attr("value")?.trim().split("/")[4],
        }))
        .get()
        .reverse();
      const chapter: string[] = $(".main-reading-area img")
        .map((_, v) => $(v).attr("src"))
        .get();

      
      const findCurrent = chapters.findIndex((v) => v.slug == chapterID);
      const currentChapter = chapters[findCurrent];
      const nextChapter =
        findCurrent < chapters.length - 1 ? chapters[findCurrent + 1] : null;
      const previousChapter =
        findCurrent > 0 ? chapters[findCurrent - 1] : null;

      console.log({
        indexNow: findCurrent,
        check: chapters.length,
        findCurrent: chapters[findCurrent],
      });

      return c.json({
        status: true,
        message: "Berhasil megambil data chapter.",
        data: {
          title,
          chapters,
          chapter: {
            previousChapter: previousChapter,
            currentChapter: {
              title: currentChapter.title,
              slug: currentChapter.slug,
              images: chapter,
            },
            nextChapter: nextChapter,
          },
        },
      });
    } catch (error) {
      return c.json({
        status: false,
        message: JSON.stringify(error),
      });
    }
  },
};
