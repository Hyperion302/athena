import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("action", function (table) {
    table.integer("id").notNullable();
    table.bigInteger("proposal_id").unsigned().notNullable();
    table.string("action_string", 2048).notNullable();
    table.primary(["proposal_id", "id"]);
    table.foreign("proposal_id").references("proposal.id");
  });
  await knex.schema.createTable("proposal", function (table) {
    table.bigInteger("id").unsigned().notNullable().primary();
    table.bigInteger("server_id").unsigned().notNullable();
    table.bigInteger("author_id").unsigned().notNullable();
    table.dateTime("created_on").defaultTo(knex.fn.now()).notNullable();
    table.dateTime("expires_on").defaultTo(null);
    table.string("name", 256).notNullable();
    table.string("description", 1024).notNullable();
    table.integer("status").notNullable();
    table.bigInteger("message_id").unsigned().defaultTo(null);
    table.bigInteger("channel_id").unsigned().notNullable();
    table.integer("duration").notNullable();
  });
  await knex.schema.createTable("vote", function (table) {
    table.bigInteger("proposal_id").unsigned().notNullable();
    table.bigInteger("user_id").unsigned().notNullable();
    table.integer("vote").defaultTo(null);
    table.primary(["proposal_id", "user_id"]);
    table.foreign("proposal_id").references("proposal.id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("action");
  await knex.schema.dropTable("proposal");
  await knex.schema.dropTable("vote");
}
