type AuthUser = {
  email: string;
  role: string;
};

const builderRoles = new Set(["builder", "owner", "pg_poster", "pg-poster"]);

export function isBuilderUser(user: AuthUser | null | undefined): boolean {
  if (!user) {
    return false;
  }

  const normalizedRole = user.role.trim().toLowerCase();
  const normalizedEmail = user.email.trim().toLowerCase();

  return builderRoles.has(normalizedRole) || normalizedEmail.startsWith("owner-");
}

export function getHomePathForUser(user: AuthUser | null | undefined): string {
  return isBuilderUser(user) ? "/owner" : "/app/search";
}
