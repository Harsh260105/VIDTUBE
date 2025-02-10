import { app } from "./app.js";
import "dotenv/config";
import connectDB from "./db/index.js";

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Failed to connect the database...");
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
