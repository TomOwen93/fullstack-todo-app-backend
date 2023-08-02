import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  deleteDbItemById,
  addDbItem,
  getAllDbItems,
  getDbItemById,
  DbItem,
  updateDbItemById,
} from "./db";
import filePath from "./filePath";

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// POST /to-dos
app.post<{}, {}, DbItem>("/to-dos", (req, res) => {
  const postData = req.body;
  const createdToDo = addDbItem(postData);
  res.status(201).json(createdToDo);
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
app.get<{ id: string }>("/to-dos", (req, res) => {
  //GET all todos from the db
  const allToDos = getAllDbItems();
  res.status(200).json(allToDos);
});

//PATCH /to-dos
app.patch<{ id: string }>("/to-dos/:id", (req, res) => {
  const patchId = parseInt(req.params.id);
  const patchData = req.body;

  updateDbItemById(patchId, patchData);
  res.status(200).json(patchData);
});

//delete /to-dos
app.delete<{ id: string }>("/to-dos/:id", (req, res) => {
  const patchId = parseInt(req.params.id);
  deleteDbItemById(patchId);
  res.status(200);
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
