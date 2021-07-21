import Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("archive", function (table) {
    table.string("id", 20).primary();
    table.string("name", 100).notNullable();
    table.integer("uses").defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("archive");
}


