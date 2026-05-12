import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envPath = resolve(__dirname, "..", ".env.local");
if (!existsSync(envPath)) {
  console.error("❌ .env.local not found. Create it first.");
  process.exit(1);
}

const envContent = readFileSync(envPath, "utf-8");
const supabaseUrl = envContent
  .split("\n")
  .find((l) => l.startsWith("NEXT_PUBLIC_SUPABASE_URL="))
  ?.split("=")
  .slice(1)
  .join("=");

if (!supabaseUrl) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local");
  process.exit(1);
}

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  console.error("❌ Set SUPABASE_SERVICE_ROLE_KEY env var or pass it as the first argument");
  process.exit(1);
}

const SEED_USERS = [
  {
    email: "abdul@juices4life.com",
    password: "password123",
    name: "Abdul Wahab",
    role: "admin",
    avatar: "AW",
    department: "Management",
    permissions: ["create", "read", "update", "delete"],
  },
  {
    email: "yasine@juices4life.com",
    password: "password123",
    name: "Yasine",
    role: "employee",
    avatar: "Y",
    department: "Production",
    permissions: ["read", "update"],
  },
  {
    email: "mohsin@juices4life.com",
    password: "password123",
    name: "Syed Mohsin",
    role: "employee",
    avatar: "SM",
    department: "Sales",
    permissions: ["read"],
  },
  {
    email: "shakira@juices4life.com",
    password: "password123",
    name: "Shakira",
    role: "employee",
    avatar: "S",
    department: "Marketing",
    permissions: ["read", "update", "create"],
  },
  {
    email: "elena@juices4life.com",
    password: "password123",
    name: "Elena Torres",
    role: "employee",
    avatar: "ET",
    department: "Product",
    permissions: ["read", "update"],
  },
  {
    email: "frank@juices4life.com",
    password: "password123",
    name: "Frank Okafor",
    role: "admin",
    avatar: "FO",
    department: "Operations",
    permissions: ["create", "read", "update", "delete"],
  },
];

async function main() {
  console.log("\n🔧 Supabase Seed Script\n");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Creating ${SEED_USERS.length} users...\n`);

  for (const user of SEED_USERS) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { name: user.name, role: user.role },
      });

      if (error) {
        if (error.message?.includes("already exists")) {
          console.log(`  ⏭  ${user.email} — already exists, skipping`);
          continue;
        }
        console.error(`  ❌ ${user.email} — ${error.message}`);
        continue;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          avatar: user.avatar,
          department: user.department,
          permissions: user.permissions,
        })
        .eq("id", data.user.id);

      if (profileError) {
        console.log(`  ⚠️  ${user.email} — created but profile update failed`);
      } else {
        console.log(`  ✅ ${user.email} — created (${user.role})`);
      }
    } catch (err) {
      console.error(`  ❌ ${user.email} — ${err.message}`);
    }
  }

  console.log("\n──────────────────────");
  console.log("✅ Seed complete!\n");
  console.log("Login with any of these emails, password: password123");
}

main().catch(console.error);
