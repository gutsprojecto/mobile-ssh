/** Opens the inbox of one server: shellpad://alert?account=<id>. */
export function alertLink(accountId: string): string {
  return `shellpad://alert?account=${encodeURIComponent(accountId)}`;
}

/** The account a push was sent for, from its data. */
export function accountFromPush(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const key = (data as { accountKey?: unknown }).accountKey;
  return typeof key === "string" && key ? key : null;
}
