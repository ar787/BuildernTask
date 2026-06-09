import "dotenv/config";
import express from "express";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";
import { typeDefs } from "./schema/typeDefs.js";
import { resolvers } from "./schema/resolvers/index.js";
import { buildContext } from "./context.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in .env");
}

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();

app.use("/graphql", expressMiddleware(server, { context: buildContext }));

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/graphql`);
});
