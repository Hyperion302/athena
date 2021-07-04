import { permissions } from "athena-common";

export function getPermissionStringsFor(permission: number): String[] {
  return permissions.filter((e) => e.id & permission).map((e) => e.display);
}
