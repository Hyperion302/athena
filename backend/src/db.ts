import Knex from "knex";
import logger from "./logging";
export let knex: Knex;

export function connectToProdDB(user: string, pass: string, db: string) {
  try {
    knex = Knex({
      client: "mysql2",
      connection: {
        host: "127.0.0.1",
        user,
        password: pass,
        database: db,
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
    });
  } catch (e) {
    throw new Error("Could not connect to database");
  }
}

export function connectToDevDB(path: string) {
  try {
    knex = Knex({
      client: "sqlite3",
      connection: {
        filename: path,
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
    });
  } catch (e) {
    throw new Error("Could not connect to database");
  }
}

export async function runLatestMigration() {
  const [batchNo, log] = await knex.migrate.latest();
  if (!log.length) {
    logger.info("Database already up to date");
  } else {
    logger.info(`Ran migrations: ${log.join(", ")}`);
  }
}
