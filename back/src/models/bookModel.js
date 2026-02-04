import mongoose from "mongoose";

const bookSchema = mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    publicationDate: { type: Number, required: true },
    available: { type: Boolean, default: true }
});

export default mongoose.model("Book", bookSchema);