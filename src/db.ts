import Knex from 'knex';
export var knex: Knex;

export function connectToDB(user: string, pass: string, db: string) {
  knex = Knex({
    client: 'mysql2',
    connection: {
      host: '127.0.0.1',
      user: user,
      password: pass,
      database: db,
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
  });
}
