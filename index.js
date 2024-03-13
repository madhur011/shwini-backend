const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require("path");
const cors = require("cors");
require("dotenv").config({ path: ".env" });

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/storage", express.static(path.join(__dirname, "storage")));
const Routes = require("./route/index.route");
app.use(Routes);

// app.get("/*", function (req, res) {
//   res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
// });


//mongodb connection
mongoose.set("strictQuery", true);
mongoose.connect(
  `mongodb+srv://${process?.env.MONGODB_USERNAME}:${process?.env.MONGODB_PASSWORD}@cluster0.fc5injy.mongodb.net/${process?.env.MONGODB_DB_NAME}`,
  // `mongodb+srv://Madhur:Mm01138@cluster0.fc5injy.mongodb.net/thevini?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true,
  }
);

// mongodb + srv://Madhur:Mm01138@cluster0.fc5injy.mongodb.net/?retryWrites=true&w=majority

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("MONGO: successfully connected to db");
});

app.listen(process?.env?.PORT, () => {
  console.log("Magic happens on port " + process?.env?.PORT);
});
