import { Context, Hono } from "hono";

export type ValidMethods = "get" | "post" | "put" | "delete";

interface Route {
  category: string;
  route: string;
  method: ValidMethods;
  execute: (c: Context) => Response | Promise<Response>; 
} 

export default Route;
