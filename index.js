import express, { json, urlencoded } from "express";
import cors from "cors";
import authRoutes from "./routes/user.routes.js";
import { BASE_URL, PORT } from "./config/constants.js";
import { connectDB } from "./utils/db.js";

const app = express();

app.use(cors());
app.use(urlencoded({ extended: true }));
app.use(json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.all("*", (req, res) => res.status(404).send("Sorry! Resource not found"));

async function main() {
  try {
    connectDB();

    app.listen(PORT, () =>
      console.log(`Server listening on ${BASE_URL}:${PORT}`)
    );
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

main();
