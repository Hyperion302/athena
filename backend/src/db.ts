import Knex from "knex";
import glob from "glob";
import path from "path";
import logger from "@/logging";

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

type Migration = {
  name: string,
  up(k: Knex): Promise<void>,
  down(k: Knex): Promise<void>
};

class RuntimeMigrationSource {
  getMigrations(): Promise<string[]> {
    return new Promise<string[]>((res, rej) => {
      glob("dist/src/migrations/*.js", (err, matches) => {
        if (err !== null) rej(err);
        res(matches);
      });
    })
    .then((matches) => {
      return matches
        .map(str => path.basename(str))
        .map(str => str.split('.')[0])
    });
  }

  getMigrationName(migration: string): string {
    return migration;
  }

  getMigration(migration: string): Migration {
    return require(`./migrations/${migration}`);
  }
}

export async function runLatestMigration() {
  const [batchNo, log] = await knex.migrate.latest({ migrationSource: new RuntimeMigrationSource() });
  if (!log.length) {
    logger.info("Database already up to date");
  } else {
    logger.info(`Ran migrations: ${log.join(", ")}`);
  }
}
