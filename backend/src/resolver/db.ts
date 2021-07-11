import { knex } from '@/db';

export type ArchivedName = { id: string, name: string, uses: number };

export async function checkArchive(id: string): Promise<ArchivedName | null> {
  const result = await knex
    .select("*")
    .from("archive")
    .where("id", id)
  if (result.length < 1) return null;
  return result[0];
}

export async function archiveName(id: string, name: string): Promise<void> {
  const current = await checkArchive(id);
  if (current !== null) {
    await knex("archive")
      .update("name", name)
      .increment("uses")
      .where("id", id)
  }
  else {
    await knex
      .insert({ id, name, uses: 1 })
      .into("archive")
  }
}

export async function removeArchive(id: string): Promise<void> {
  const current = await checkArchive(id);
  if (current.uses > 1) {
    await knex("archive")
      .decrement("uses")
      .where("id", id)
  }
  else {
    await knex("archive")
      .where("id", id)
      .del()
  }
}

