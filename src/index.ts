import { Hono } from "hono";
import routes from "./routes";
import { ValidMethods } from "./types/route";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(cors())

app.get("/", (c) => {
  const all_routes = routes.map((v) => {
    return {
      path: ["/", v.category.toLowerCase(), v.route].join(""),
      method: v.method.toUpperCase(),
      category: v.category,
    };
  });
  return c.json({
    creator: "https://github.com/alhifnywahid",
    routes: all_routes
  });
});

routes.forEach((v) => {
  const route = ["/", v.category.toLowerCase(), v.route].join("");
  app[v.method.toLowerCase() as ValidMethods](route, v.execute);
});

export default app;
