import FlakeID from "flake-idgen";

const flakeIDGenerator = new FlakeID();

export default function generateSnowflake(): string {
  return flakeIDGenerator.next().readBigInt64BE().toString();
}
