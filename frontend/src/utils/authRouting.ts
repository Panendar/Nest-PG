type AuthUser = {
  email: string;
  role: string;
};

const ownerRoles = new Set(["owner"]);

export function isBuilderUser(user: AuthUser | null | undefined): boolean {
  if (!user) {
    return false;
  }

  const normalizedRole = user.role.trim().toLowerCase();
  const normalizedEmail = user.email.trim().toLowerCase();

  return ownerRoles.has(normalizedRole) || normalizedEmail.startsWith("owner-");
}

export function getHomePathForUser(user: AuthUser | null | undefined): string {
  return isBuilderUser(user) ? "/owner/overview" : "/app/search";
}
