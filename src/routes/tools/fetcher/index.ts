import { Context } from "hono";
import axios from "../../../lib/fetcher";

export default {
  route: "/fetch",
  method: "get",
  category: "Tools",
  execute: async (c: Context) => {
    const datetime = `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}`;
    const { url } = c.req.query();

    if (!url) {
      return c.json({
        status: false,
        datetime,
        msg: "URL parameter is required!",
      });
    }

    const response = await axios(url);

    return c.json({
      status: true,
      datetime,
      response,
    });
  },
};
