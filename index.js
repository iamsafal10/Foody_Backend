require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const dbConnect = require("./connection");
const PORT = 5000;
const cookieParser = require("cookie-parser");
const routes = require("./routes");

dbConnect();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api", routes);
app.listen(PORT, () => console.log(`Server has started at ${PORT}`));
