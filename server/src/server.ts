require("dotenv").config();
import http from "http";
import { Client } from "@notionhq/client";

// This is Typescript  interface for the shape of the object we will
// create based on our database to send to the React app
// When the data is queried it will come back in a much more complicated shape, so our goal is to
// simplify it to make it easy to work with on the front end
interface SpreadSheet {
  key : string;
  name: string;
  shares: string;
}

// The dotenv library will read from your .env file into these values on `process.env`
const notionDatabaseId = process.env.NOTION_DATABASE_ID;
const notionSecret = process.env.NOTION_SECRET;

// Will provide an error to users who forget to create the .env file
// with their Notion data in it
if (!notionDatabaseId || !notionSecret) {
  throw Error("Must define NOTION_SECRET and NOTION_DATABASE_ID in env");
}

// Initializing the Notion client with your secret
const notion = new Client({
  auth: notionSecret,
});

const host = "localhost";
const port = 8000;

// Require an async function here to support await with the DB query
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  switch (req.url) {
    case "/":
      // Query the database and wait for the result
      const query = await notion.databases.query({
        database_id: notionDatabaseId,
      });

      // We map over the complex shape of the results and return a nice clean array of
      // objects in the shape of our `SpreadSheet` interface
      const list: SpreadSheet[] = query.results.map((row) => {
        // row represents a row in our database and the name of the column is the
        // way to reference the data in that column
        const keyCell = row.properties.key;
        const nameCell = row.properties.name;
        const sharesCell = row.properties.shares;

        // Depending on the column "type" we selected in Notion there will be different
        // data available to us (shares vs Date vs text for example) so in order for Typescript
        // to safely infer we have to check the `type` value.  We had one text and one shares column.
        const isKey = keyCell.type === "title";
        const isname = nameCell.type === "rich_text";
        const isshares = sharesCell.type === "rich_text";

        // Verify the types are correct
        if (isKey && isname && isshares) {
          // Pull the string values of the cells off the column data
          const key = keyCell.title?.[0].plain_text;
          const name = nameCell.rich_text?.[0].plain_text;
          const shares = sharesCell.rich_text?.[0].plain_text;

          // Return it in our `SpreadSheet` shape
          return { key, name, shares };
        }

        // If a row is found that does not match the rules we checked it will still return in the
        // the expected shape but with a NOT_FOUND name
        return { name: "NOT_FOUND", shares: "", key: ""};
      });

      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify(list));
      break;

    default:
      res.setHeader("Content-Type", "application/json");
      res.writeHead(404);
      res.end(JSON.stringify({ error: "Resource not found" }));
  }
});

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
