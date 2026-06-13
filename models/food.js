const mongoose = require("mongoose");
const foodSchema = new mongoose.Schema(
  {
    id: Number,
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    rating: Number,
    image: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);
const Food = mongoose.model("food", foodSchema);
module.exports = Food;
