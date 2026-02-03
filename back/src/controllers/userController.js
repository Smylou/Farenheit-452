import { User } from "../models/userModel.js";

export async function addUser(req, res) {
    try {
        const data = req.body
        const user = new User(data)
        await user.save();
        res.json({ ok: true })
    } catch (error) {
        console.error(error);
        res.json({ ok: false, error: error })
    }
}
