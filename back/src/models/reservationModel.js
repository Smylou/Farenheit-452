import mongoose from "mongoose";

const reservationSchema = mongoose.Schema({
    Book: {
        type : mongoose.Schema.Types.ObjectId, 
        ref: "Book", 
        required:true
    },
    User: { type: String, required: true, minlength: 2, maxlength: 50 },
    StartDate: { type: Date, default: Date.now },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value > this.StartDate;
            },
            message: "La date de fin doit être après la date de début."
        }
    },
},
    { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);