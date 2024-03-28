import { Elysia } from "elysia";
import { Database } from "bun:sqlite";
import config from "./config.json";

const app = new Elysia();
const db = new Database("../data/linker.db");


app.post("/:id", async (req) => {
  const id = req.params.id;
  // Get params of the request
  const params = req.body;
  // Get headers of the request
  const headers = req.headers;
  // Get query of the request
  const query = req.query;
  if ("type" in query) {
    if (query.type === "update"){
      if ("url" in query){
        const query = db.query("UPDATE links SET url = ? WHERE id = ?", [query.url, id]);
        
        return `Updating ${id} with ${query.url}`;
      }
      else {
        return `Missing url parameter`;
      }
    }
    else if (query.type === "delete"){
      return `Deleting ${id}`;
    }
    else if (query.type === "check"){
      return `Checking ${id}`;
    }
  }
});

app.get("/", async (req) =>{
  return "Hello, World!";
});

app.listen(config.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);