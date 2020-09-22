import Knex from 'knex';
export let knex: Knex;

export function connectToDB(user: string, pass: string, db: string) {
  try {
    knex = Knex({
      client: 'mysql2',
      connection: {
        host: '127.0.0.1',
        user,
        password: pass,
        database: db,
        supportBigNumbers: true,
        bigNumberStrings: true,
      },
    });
  } catch (e) {
    throw new Error('Could not connect to database');
  }
}
