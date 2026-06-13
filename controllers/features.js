const Food = require("../models/food");
const User = require("../models/user");

// ADD TO CART ROUTE
async function handleAddToCart(req, res) {
  const userId = req.params.id;
  const { id, name, price, rating, image, quantity } = req.body;

  try {
    let existingItem = await Food.findOne({
      id,
      userId,
    });

    if (existingItem) {
      let updatedItem = await Food.findOneAndUpdate(
        {
          id,
          userId,
        },
        {
          $set: {
            quantity: existingItem.quantity + 1,
            totalPrice: existingItem.price * (existingItem.quantity + 1),
          },
        },
        {
          new: true,
        }
      );

      if (!updatedItem) {
        return res.status(400).json({
          success: false,
          message: "Failed to add to cart",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Added to Cart!",
      });
    }

    let newFood = await Food.create({
      id,
      name,
      price,
      rating,
      image,
      quantity,
      userId,
      totalPrice: price * quantity,
    });

    let user = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          cartItems: newFood._id,
        },
      }
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Failed to add to cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Added to cart",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// GET CART ITEMS ROUTE
async function handleGetCart(req, res) {
  const userId = req.params.id;

  try {
    const cartItems = await Food.find({ userId });

    if (!cartItems) {
      return res.status(400).json({
        success: false,
        message: "No items found",
      });
    }

    return res.status(200).json({
      success: true,
      cartItems,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// REMOVE FROM CART ROUTE
async function handleRemoveFromCart(req, res) {
  const id = req.params.id;

  try {
    let food = await Food.findOneAndDelete({ _id: id, quantity: { $gt: 0 } });

    if (!food) {
      return res.status(400).json({
        success: false,
        message: "Food item not found!",
      });
    }
    await User.findOneAndUpdate(
      { _id: food.userId },
      {
        $pull: {
          cartItems: food._id,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Food item removed!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// INCREMENT QUANTITY ROUTE
async function handleIncrementQuantity(req, res) {
  const id = req.params.id;

  try {
    const food = await Food.findById(id);

    if (!food) {
      return res.status(400).json({
        success: false,
        message: "Food not found",
      });
    }

    food.quantity += 1;
    food.totalPrice = food.price * food.quantity;

    await food.save();

    return res.status(200).json({
      success: true,
      message: "Food quantity incremented",
      food,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// DECREMENT QUANTITY ROUTE
async function handleDecrementQuantity(req, res) {
  const id = req.params.id;

  try {
    const food = await Food.findById(id);

    if (!food) {
      return res.status(400).json({
        success: false,
        message: "Food not found",
      });
    }
    food.quantity -= 1;
    food.totalPrice = food.price * food.quantity;
    if (food.quantity < 1) {
      await Food.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        removed: true,
        message: "Food removed from cart",
      });
    }
    await food.save();

    return res.status(200).json({
      success: true,
      message: "Food quantity decremented",
      food,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
// CLEAR CART ROUTE
async function handleClearCart(req, res) {
  const userId = req.id;

  try {
    const deletedItems = await Food.deleteMany({
      userId,
    });

    const deletedList = await User.findOneAndUpdate(
      {
        _id: userId,
      },
      {
        cartItems: [],
      }
    );

    if (!deletedItems) {
      return res.status(400).json({
        success: false,
        message: "Failed to clear cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order Confirmed",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
module.exports = {
  handleAddToCart,
  handleGetCart,
  handleRemoveFromCart,
  handleClearCart,
  handleIncrementQuantity,
  handleDecrementQuantity,
};
