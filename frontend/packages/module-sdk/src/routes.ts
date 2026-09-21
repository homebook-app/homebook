/** Route parameter pattern for GUIDs, the `:guid` constraint of the Blazor routes. */
export const GUID_ROUTE_PATTERN = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

const GUID = new RegExp(`^${GUID_ROUTE_PATTERN}$`);

/** Whether a value is a GUID in its usual textual form. */
export function isGuid(value: string): boolean {
  return GUID.test(value);
}
