import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getDbItemById } from "./db";
import filePath from "./filePath";
import { Client } from "pg";

// read in contents of any environment variables in the .env file
dotenv.config();

const dbUrl = process.env.DATABASE_URL;

console.log(dbUrl);
if (!dbUrl) {
  throw new Error("Missing env variable DATABASE_URL");
}

const client = new Client(dbUrl);
client.connect();

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// POST /to-dos
app.post("/to-dos", async (req, res) => {
  const postData = req.body;

  const queryText =
    "INSERT INTO todos(title, creationdate, completed, duedate) VALUES($1, $2, $3, $4)";
  const values = [
    postData.title,
    postData.creationDate,
    postData.completed,
    postData.dueDate,
  ];

  const result = await client.query(queryText, values);

  res.status(201).json({
    status: "success",
    data: {
      signature: result,
    },
  });
});

// GET /to-dos
app.get<{ id: string }>("/to-dos/:id", (req, res) => {
  const matchingToDo = getDbItemById(parseInt(req.params.id));
  if (matchingToDo === "not found") {
    res.status(404).json(matchingToDo);
  } else {
    res.status(200).json(matchingToDo);
  }
});

// GET /to-dos
app.get("/to-dos", async (req, res) => {
  //GET all todos from the db
  const queryText = "SELECT * FROM todos";
  const result = await client.query(queryText);

  if (result) {
    res.status(200).json({
      status: "sucesss",
      data: result.rows,
    });
  } else {
    res.status(404).json({
      status: "fail",
      data: {
        id: "Could not find any todos",
      },
    });
  }
});

//PATCH /to-dos
app.patch<{ id: string }>("/to-dos/:id", async (req, res) => {
  const patchId = parseInt(req.params.id);
  const patchData = req.body.completed;

  const queryText = "UPDATE todos SET completed = $1 WHERE id = $2";
  const values = [patchData, patchId];

  console.log(queryText, values);

  const result = await client.query(queryText, values);

  console.log(result);

  res.status(200).json(result);
});

//delete /to-dos
app.delete<{ id: string }>("/to-dos/:id", async (req, res) => {
  const patchId = parseInt(req.params.id);

  const queryText = "DELETE FROM todos WHERE id = $1";
  const values = [patchId];

  const result = await client.query(queryText, values);
  const removed = result.rowCount;

  if (removed > 0) {
    console.log(`to-do id ${patchId} has been deleted`);
    res.status(200).json({
      status: "success",
    });
  } else {
    res.status(404).json({
      status: "fail",
      data: {
        id: "Could not find a todo with that id identifier",
      },
    });
  }
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
