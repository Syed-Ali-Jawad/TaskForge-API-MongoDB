import createApp from "./src/app";
import connectDB from "./src/config/db";
import env from "./src/config/env";

const server = createApp();

// Vercel imports the Express app as a serverless function. Keep the local
// listener for `npm run dev` and other non-Vercel environments.
export default server;

const startServer = async () => {
  if (env.vercel) return;
  
  await connectDB();
  const port = Number(env.port) || 3000;
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer();
