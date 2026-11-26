import type { CollectionSchema } from "deepspace/schema";

export const prepSessionsSchema: CollectionSchema = {
  name: "prep-sessions",
  columns: [
    { name: "companyName", storage: "text", interpretation: "plain" },
    { name: "jobRole", storage: "text", interpretation: "plain" },
    { name: "jobDescription", storage: "text", interpretation: "plain" },
    { name: "questions", storage: "text", interpretation: { kind: "json" } },
  ],
  permissions: {
    member: { read: "own", create: true, update: "own", delete: "own" },
    admin: { read: true, create: true, update: true, delete: true },
  },
};
