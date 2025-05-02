const express = require("express");
const cors = require("cors");
const chatRoutes = require("./routes"); // Use require
const { vectorStore } = require("./vectorStore"); // Use require

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(chatRoutes);

// Initialize Vector Store and Start Server
vectorStore
  .initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend server listening on port ${port}`);
      console.log(
        `Ready to accept requests at http://localhost:${port}/api/chat`
      );
    });
  })
  .catch((error) => {
    console.error("Failed to initialize vector store:", error);
    process.exit(1);
  });
