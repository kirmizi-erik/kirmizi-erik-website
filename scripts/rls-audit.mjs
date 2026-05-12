#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const envText = readFileSync(".env.local", "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const anon = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Sanity: admin can read site_settings?
console.log("== Admin sanity check ==");
const { data: ssAll, error: ssErr } = await admin.from("site_settings").select("*");
console.log("site_settings rows:", ssAll?.length ?? "error:", ssErr?.message ?? "");
if (ssAll?.[0]) console.log("ilk row meta_title:", JSON.stringify(ssAll[0].meta_title));

const { data: leadsCount } = await admin.from("leads").select("id", { count: "exact", head: true });
console.log("leads erişimi:", leadsCount === null ? "table erişilebilir" : leadsCount);

console.log("\n== Test 1: anon → site_settings UPDATE ==");
const orig = ssAll?.[0]?.meta_title ?? null;
console.log("Önce:", JSON.stringify(orig));

const ATTACK = "ANON-PWN-" + Date.now();
const { error: upErr, data: upData, status: upStatus } = await anon
  .from("site_settings")
  .update({ meta_title: ATTACK })
  .eq("id", 1)
  .select();
console.log("HTTP status:", upStatus, "error:", upErr?.message ?? "(none)", "returned:", upData?.length ?? 0, "rows");

const { data: ssAfter } = await admin.from("site_settings").select("meta_title").eq("id", 1).single();
console.log("Sonra:", JSON.stringify(ssAfter?.meta_title));
console.log("Sonuç:", ssAfter?.meta_title === ATTACK ? "🚨 SECURITY HOLE — anon güncelledi" : "✅ Korundu");

// Restore if needed
if (ssAfter?.meta_title === ATTACK) {
  await admin.from("site_settings").update({ meta_title: orig }).eq("id", 1);
  console.log("Restored.");
}

console.log("\n== Test 2: anon → leads DELETE (admin seed lead) ==");
const { data: seed, error: seedErr } = await admin
  .from("leads")
  .insert({ ad_soyad: "rls-delete-seed", eposta: "del-" + Date.now() + "@example.com" })
  .select("id")
  .single();
console.log("Admin seed:", seed?.id ?? "FAILED:", seedErr?.message ?? "");

if (seed?.id) {
  const { error: delErr, data: delData, status: delStatus } = await anon
    .from("leads")
    .delete()
    .eq("id", seed.id)
    .select();
  console.log("anon delete HTTP status:", delStatus, "error:", delErr?.message ?? "(none)");

  const { data: check } = await admin.from("leads").select("id").eq("id", seed.id).maybeSingle();
  console.log("Hala duruyor mu?", check?.id ? "✅ Evet (RLS korudu)" : "🚨 SECURITY HOLE — anon sildi");

  await admin.from("leads").delete().eq("id", seed.id); // cleanup
}

console.log("\n== Test 3: anon → case_studies UPDATE ==");
const { data: csAll } = await admin.from("case_studies").select("id,baslik").limit(1);
if (csAll?.[0]) {
  const cs = csAll[0];
  const origBaslik = cs.baslik;
  const { error: csUpErr, data: csUpData, status: csStatus } = await anon
    .from("case_studies")
    .update({ baslik: "ANON-PWN-" + Date.now() })
    .eq("id", cs.id)
    .select();
  console.log("HTTP:", csStatus, "error:", csUpErr?.message ?? "(none)", "rows:", csUpData?.length ?? 0);

  const { data: csAfter } = await admin.from("case_studies").select("baslik").eq("id", cs.id).single();
  console.log("Değişti mi?", csAfter?.baslik !== origBaslik ? "🚨 SECURITY HOLE" : "✅ Korundu");

  if (csAfter?.baslik !== origBaslik) {
    await admin.from("case_studies").update({ baslik: origBaslik }).eq("id", cs.id);
  }
} else {
  console.log("(case_studies'de kayıt yok, test atlandı)");
}

console.log("\n== Test 4: anon → profiles SELECT ==");
const { data: profAll, error: profErr, status: profStatus } = await anon.from("profiles").select("*");
console.log("HTTP:", profStatus, "error:", profErr?.message ?? "(none)", "rows:", profAll?.length ?? 0);
console.log(profAll?.length === 0 ? "✅ Anon profil göremiyor" : "🚨 SECURITY HOLE — anon profil okuyor");
