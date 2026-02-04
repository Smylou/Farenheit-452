import Books from "../models/bookModel.js";


export async function addBook(req, res) {
    try {
        const data = req.body
        const book = new Books(data)
        await book.save();
        res.json({ ok: true })
    } catch (error) {
        console.error(error);
        res.json({ ok: false, error: error })
    }
}

export async function getAllBooks(req, res) {
    try {
        const book = await Books.find({}, "title author publicationDate");
        res.json(book)
    } catch (error) {
        console.error(error);
        res.json({ ok: false, error: error })
    }
}
export async function getBookByTitle(req, res) {
    const title = req.params.title;
    try {
        const regex = new RegExp(title.trim().replace(/\s+/g, ".*"), "i");
        const book = await Books.find({ title: { $regex: regex } })
        res.json(book)
    } catch (error) {
        console.error(error);
        res.json({ ok: false, error: error })
    }
}
export async function getBookByAuthor(req, res) {
    const author = req.params.author;
    try {
        const regex = new RegExp(author.trim().replace(/\s+/g, ".*"), "i");
        const book = await Books.find({ author: { $regex: regex } })
        res.json(book)

    } catch (error) {
        console.error(error);
        res.json({ ok: false, error: error })

    }
}

// A CORRIGER FILTRER PAR DATE
export async function getBookByDate(req, res) {
    const publicationDate = req.params.publicationDate;
    try {
        const book = await Books.find({ publicationDate: publicationDate })
        res.json(book)
        console.log(book);

    } catch (error) {
        console.error(error);
        res.json({ ok: false, error: error })
    }
}

export async function getAvailableBook(req, res) {
    const available = req.params.available;
    try {
        const book = await Books.find({ available: available })
        res.json(book)
    } catch (error) {
        console.error(error);
        res.json({ ok: false, error: error })
    }
}