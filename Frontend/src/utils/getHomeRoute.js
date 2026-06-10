export function getHomeRoute(role) {
  return role === "admin" ? "/admin" : "/dashboard";
}
