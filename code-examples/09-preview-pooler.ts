/**
 * Label: Sanitized excerpt from the application
 *
 * Preview serverless instances should use the pooled hostname, not the
 * direct compute. Production, development, and already-pooled URLs stay
 * unchanged. Fictional host only.
 */

export function withPreviewPoolerHost(connectionString: string, env: string | undefined): string {
  if (env !== "preview") return connectionString;
  const at = connectionString.lastIndexOf("@");
  if (at === -1) return connectionString;
  const rest = connectionString.slice(at + 1);
  const separator = rest.search(/[/?]/);
  const hostport = separator === -1 ? rest : rest.slice(0, separator);
  const colon = hostport.lastIndexOf(":");
  const host = colon === -1 ? hostport : hostport.slice(0, colon);
  if (!host.endsWith(".example-db.test") || host.includes("-pooler")) return connectionString;
  const dot = host.indexOf(".");
  if (dot <= 0) return connectionString;
  const pooled = `${host.slice(0, dot)}-pooler${host.slice(dot)}`;
  return `${connectionString.slice(0, at + 1)}${pooled}${hostport.slice(host.length)}${rest.slice(hostport.length)}`;
}

/** Keep TLS verification when a driver treats sslmode=require as weaker. */
export function withVerifyFullSslMode(connectionString: string): string {
  const token = "sslmode=require";
  const index = connectionString.indexOf(token);
  if (index === -1) return connectionString;
  const before = connectionString.charAt(index - 1);
  if (before !== "?" && before !== "&") return connectionString;
  const afterIndex = index + token.length;
  const after = connectionString.charAt(afterIndex);
  if (after !== "" && after !== "&" && after !== "#") return connectionString;
  return `${connectionString.slice(0, index)}sslmode=verify-full${connectionString.slice(afterIndex)}`;
}
