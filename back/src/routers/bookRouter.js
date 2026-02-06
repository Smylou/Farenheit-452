import express from "express";
import { 
    addBook, 
    getAllBooks, 
    getAvailableBook, 
    getBorrowableBooks,
    getBookByAuthor, 
    getBookByDate, 
    getBookByTitle,
    deleteBook,
    updateBook,
    getBookById,
} from "../controllers/bookController.js";
import LoginController from "../controllers/loginController.js";

export const bookRouter = express.Router();

bookRouter.post("/addBook", LoginController.verifyToken, addBook);
bookRouter.delete("/book/:id", LoginController.verifyToken, deleteBook);
bookRouter.put("/book/:id", LoginController.verifyToken, updateBook);
bookRouter.get("/allbooks", getAllBooks);
// Routes spécifiques EN PREMIER
bookRouter.get("/book/title/:title", getBookByTitle);
bookRouter.get("/book/author/:author", getBookByAuthor);
bookRouter.get("/book/publicDate/:publicDate", getBookByDate);
bookRouter.get("/book/available/:available", getAvailableBook);
bookRouter.get("/books/availables", getBorrowableBooks);
// Route générique EN DERNIER
bookRouter.get("/book/:id", getBookById);
