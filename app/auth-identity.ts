// These headers are supplied by Sites after authenticating the visitor.
// Some deployments supply email without the optional Site-scoped user ID.
export function resolveIdentity(userId: string | null, email: string | null) {
  const normalizedEmail = email?.trim().toLowerCase();
  if (!normalizedEmail) return null;
  return { userId: userId || `email:${normalizedEmail}`, email: normalizedEmail };
}
