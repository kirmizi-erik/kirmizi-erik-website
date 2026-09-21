import "server-only";

/**
 * Basitleştirilmiş robots.txt değerlendirmesi: verilen bot için "/" yolu
 * taranabilir mi? Bot'a özel grup varsa o, yoksa "*" grubu geçerlidir.
 */
export function isPathAllowed(robotsTxt: string, botToken: string, path = "/"): boolean {
  type Group = { agents: string[]; allow: string[]; disallow: string[] };
  const groups: Group[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;

  for (const rawLine of robotsTxt.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (field === "user-agent") {
      if (!lastWasAgent || !current) {
        current = { agents: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (field === "allow" || field === "disallow") {
      lastWasAgent = false;
      if (!current) continue;
      if (field === "allow") current.allow.push(value);
      else current.disallow.push(value);
    } else {
      lastWasAgent = false;
    }
  }

  const bot = botToken.toLowerCase();
  const specific = groups.filter((g) =>
    g.agents.some((a) => a !== "*" && (bot.includes(a) || a.includes(bot))),
  );
  const applicable = specific.length ? specific : groups.filter((g) => g.agents.includes("*"));
  if (!applicable.length) return true;

  // En uzun eşleşen kural kazanır; eşitlikte allow kazanır.
  let best: { rule: "allow" | "disallow"; len: number } | null = null;
  for (const g of applicable) {
    for (const [rule, patterns] of [
      ["allow", g.allow],
      ["disallow", g.disallow],
    ] as const) {
      for (const p of patterns) {
        if (!p) continue; // boş Disallow = her şey serbest
        if (
          matches(path, p) &&
          (!best ||
            p.length > best.len ||
            (p.length === best.len && rule === "allow" && best.rule === "disallow"))
        ) {
          best = { rule, len: p.length };
        }
      }
    }
  }
  return !best || best.rule === "allow";
}

function matches(path: string, pattern: string): boolean {
  // robots joker desteği: * herhangi bir dizi, $ satır sonu
  const esc = pattern
    .replace(/[.+?^{}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\\\$$/, "$");
  try {
    return new RegExp(`^${esc}`).test(path);
  } catch {
    return path.startsWith(pattern.replace(/\*.*$/, ""));
  }
}
