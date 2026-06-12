const {
  handleAddToCart,
  handleGetCart,
  handleRemoveFromCart,
  handleIncrementQuantity,
  handleDecrementQuantity,
  handleClearCart,
} = require("./controllers/features");
const {
  handleUserSignUp,
  handleUserLogin,
  handleUserLogOut,
  handleResetPassword,
  handleVerifyOtp,
  handleGetUser,
} = require("./controllers/user");
const verifyToken = require("./middlewares/verifyToken");

const router = require("express").router();

// AUTH ROUTES
router.post("/signup", handleUserSignUp);
router.post("/login", handleUserLogin);
router.get("/logout", handleUserLogOut);
router.put("/reset-password", handleResetPassword);
router.put("/verify-otp", handleVerifyOtp);
router.get("/get-user", verifyToken, handleGetUser);

// FEATURE ROUTES
router.post("/add-to-cart/:id", handleAddToCart);
router.get("/get-cart/:id", handleGetCart);
router.delete("/remove-from-cart/:id", handleRemoveFromCart);
router.put("/increment-quantity/:id", handleIncrementQuantity);
router.put("/decrement-quantity/:id", handleDecrementQuantity);
router.get("/clear-cart", verifyToken, handleClearCart);
module.exports = router;
