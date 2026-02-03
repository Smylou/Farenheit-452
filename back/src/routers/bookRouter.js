import express from "express"
import { addBook, getAllBooks, getAvailableBook, getBookByAuthor, getBookByDate, getBookByTitle } from "../controllers/bookController.js"

export const bookRouter = express.Router()
bookRouter.post("/addBook", addBook)
bookRouter.get("/allbooks", getAllBooks)
bookRouter.get("/book/title/:title", getBookByTitle)
bookRouter.get("/book/author/:author", getBookByAuthor)
bookRouter.get("/book/publicDate/:publicDate", getBookByDate)
bookRouter.get("/book/available/:available", getAvailableBook)


