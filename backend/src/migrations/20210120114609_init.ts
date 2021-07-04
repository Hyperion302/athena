import * as Knex from "knex";
import { PROPOSAL_NAME_MAX, PROPOSAL_DESCRIPTION_MAX } from "athena-common";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("action", function (table) {
    table.integer("id").notNullable();
    table.string("proposal_id", 20).notNullable();
    table.string("action_string", 2048).notNullable();
    table.primary(["proposal_id", "id"]);
    table.foreign("proposal_id").references("proposal.id");
  });
  await knex.schema.createTable("proposal", function (table) {
    table.string("id", 20).notNullable().primary();
    table.string("server_id", 20).notNullable();
    table.string("author_id", 20).notNullable();
    table.dateTime("created_on").defaultTo(knex.fn.now()).notNullable();
    table.dateTime("expires_on").defaultTo(null);
    table.string("name", PROPOSAL_NAME_MAX).notNullable();
    table.string("description", PROPOSAL_DESCRIPTION_MAX).notNullable();
    table.integer("status").notNullable();
    table.string("message_id", 20).defaultTo(null);
    table.string("channel_id", 20).notNullable();
    table.integer("duration").notNullable();
  });
  await knex.schema.createTable("vote", function (table) {
    table.string("proposal_id", 20).notNullable();
    table.string("user_id", 20).notNullable();
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
