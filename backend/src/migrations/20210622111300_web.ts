import Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  // Store actions as JSON
  await knex.schema.table("action", function (table) {
    table.dropColumn("action_string");
    table.json("action_data").notNullable();
  });
  // No more messages
  await knex.schema.table("proposal", function (table) {
    table.dropColumn("message_id");
    table.dropColumn("channel_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("action", function (table) {
    table.dropColumn("action_data");
    table.string("action_string", 2048).notNullable();
  });
  await knex.schema.table("proposal", function (table) {
    table.string("message_id", 20).defaultTo(null);
    table.string("channel_id", 20).notNullable();
  });
}

