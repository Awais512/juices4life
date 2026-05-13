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

const ALL_RESOURCES = ["tasks", "backlog", "employees", "permissions"];
const ALL_ACTIONS = ["create", "read", "update", "delete"];

const SEED_USERS = [
  {
    email: "abdul@juices4life.com",
    password: "password123",
    name: "Abdul Wahab",
    role: "admin",
    avatar: "AW",
    department: "Management",
    permissions: { tasks: [...ALL_ACTIONS], backlog: [...ALL_ACTIONS], employees: [...ALL_ACTIONS], permissions: [...ALL_ACTIONS] },
  },
  {
    email: "yasine@juices4life.com",
    password: "password123",
    name: "Yasine",
    role: "employee",
    avatar: "Y",
    department: "Production",
    permissions: { tasks: ["read", "update"], backlog: ["read"], employees: ["read"], permissions: [] },
  },
  {
    email: "mohsin@juices4life.com",
    password: "password123",
    name: "Syed Mohsin",
    role: "employee",
    avatar: "SM",
    department: "Sales",
    permissions: { tasks: ["read"], backlog: ["read"], employees: [], permissions: [] },
  },
  {
    email: "shakira@juices4life.com",
    password: "password123",
    name: "Shakira",
    role: "employee",
    avatar: "S",
    department: "Marketing",
    permissions: { tasks: ["read", "update", "create"], backlog: ["read"], employees: ["read"], permissions: [] },
  },
  {
    email: "elena@juices4life.com",
    password: "password123",
    name: "Elena Torres",
    role: "employee",
    avatar: "ET",
    department: "Product",
    permissions: { tasks: ["read", "update"], backlog: ["read"], employees: ["read"], permissions: [] },
  },
  {
    email: "frank@juices4life.com",
    password: "password123",
    name: "Frank Okafor",
    role: "admin",
    avatar: "FO",
    department: "Operations",
    permissions: { tasks: [...ALL_ACTIONS], backlog: [...ALL_ACTIONS], employees: [...ALL_ACTIONS], permissions: [...ALL_ACTIONS] },
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
        })
        .eq("id", data.user.id);

      if (profileError) {
        console.log(`  ⚠️  ${user.email} — created but profile update failed`);
      } else {
        console.log(`  ✅ ${user.email} — created (${user.role})`);
      }

      const permRows = [];
      for (const [resource, actions] of Object.entries(user.permissions)) {
        for (const action of actions) {
          permRows.push({ user_id: data.user.id, resource, action });
        }
      }
      if (permRows.length > 0) {
        const { error: permError } = await supabase
          .from("user_permissions")
          .insert(permRows);
        if (permError) {
          console.log(`  ⚠️  ${user.email} — created but permissions insert failed`);
        }
      }
    } catch (err) {
      console.error(`  ❌ ${user.email} — ${err.message}`);
    }
  }

  console.log("\n──────────────────────");
  console.log("Seeding tasks...\n");

  const { data: profiles } = await supabase.from("profiles").select("id, name, role, email");
  const adminProfiles = profiles?.filter((p) => p.role === "admin") || [];
  const empProfiles = profiles?.filter((p) => p.role === "employee") || [];

  const seedTasks = [
    { title: "Redesign landing page", description: "Create a modern, conversion-focused landing page", priority: "high", status: "todo", tags: ["design", "frontend"] },
    { title: "Implement user authentication", description: "Set up OAuth 2.0 integration with Google and GitHub", priority: "urgent", status: "todo", tags: ["backend", "security"] },
    { title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automated testing and deployment", priority: "high", status: "in-progress", tags: ["devops"] },
    { title: "Write unit tests for API", description: "Achieve at least 80% code coverage on all API endpoints", priority: "medium", status: "review", tags: ["testing"] },
    { title: "Database optimization", description: "Add indexes and optimize slow queries", priority: "medium", status: "done", tags: ["backend", "performance"] },
    { title: "Mobile responsive fixes", description: "Fix layout issues on tablet and mobile viewports", priority: "low", status: "backlog", tags: ["frontend", "mobile"] },
    { title: "Add dark mode support", description: "Implement theme switching with system preference detection", priority: "low", status: "backlog", tags: ["frontend", "ux"] },
    { title: "Quarterly review presentation", description: "Compile Q2 metrics and prepare stakeholder presentation", priority: "high", status: "todo", tags: ["management"] },
    { title: "Email notification system", description: "Send email alerts for task assignments and @mentions", priority: "medium", status: "backlog", tags: ["backend", "feature"] },
    { title: "API rate limiting", description: "Implement rate limiting to prevent abuse of public endpoints", priority: "medium", status: "done", tags: ["backend", "security"] },
  ];

  const { data: existingTasks } = await supabase.from("tasks").select("id").limit(1);
  if (!existingTasks || existingTasks.length === 0) {
    for (const task of seedTasks) {
      const assignee = empProfiles[Math.floor(Math.random() * empProfiles.length)];
      const creator = adminProfiles[0];

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 1);

      const { error } = await supabase.from("tasks").insert({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        assignee_id: assignee?.id || creator?.id,
        created_by: creator?.id,
        due_date: dueDate.toISOString(),
        tags: task.tags,
      });

      if (error) {
        console.log(`  ❌ Failed to create task "${task.title}": ${error.message}`);
      } else {
        console.log(`  ✅ Task created: "${task.title}"`);
      }
    }

    console.log("\nSeeding comments...\n");
    const { data: tasks } = await supabase.from("tasks").select("id, title");
    if (tasks && tasks.length > 0) {
      const commentTexts = [
        "Great work on this!",
        "I'll take a look at this today.",
        "Let me know if you need any help with this.",
        "This needs more clarification.",
        "Updated the requirements in the description.",
      ];

      for (const task of tasks.slice(0, 4)) {
        const author = empProfiles[Math.floor(Math.random() * empProfiles.length)];
        if (author) {
          await supabase.from("task_comments").insert({
            task_id: task.id,
            author_id: author.id,
            content: commentTexts[Math.floor(Math.random() * commentTexts.length)],
          });
        }
      }
      console.log(`  ✅ Comments created for ${Math.min(tasks.length, 4)} tasks`);
    }
  } else {
    console.log("  ⏭  Tasks already exist, skipping");
  }

  console.log("\n──────────────────────");
  console.log("✅ Seed complete!\n");
  console.log("Login with any of these emails, password: password123");
}

main().catch(console.error);
