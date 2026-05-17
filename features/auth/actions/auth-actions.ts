"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, type LoginFormData } from "../schemas/auth-schema";
import { redirect } from "next/navigation";
import { buildPermissionMap, defaultPermissions } from "../utils/permissions";

function mapUser(profile: any) {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as "admin" | "employee",
    avatar: profile.avatar,
    department: profile.department,
    createdAt: new Date(profile.created_at),
    isActive: profile.is_active,
  };
}

async function fetchPermissions(userId: string, supabase: any) {
  const { data: permRows } = await supabase
    .from("user_permissions")
    .select("resource, action")
    .eq("user_id", userId);

  return buildPermissionMap(permRows || []);
}

export async function loginAction(data: LoginFormData) {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid form data" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false as const, error: "Invalid email or password" };
  }

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return { success: false as const, error: "Failed to get user" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  const permissions = profile
    ? await fetchPermissions(authUser.id, supabase)
    : defaultPermissions();

  return {
    success: true as const,
    data: {
      user: profile
        ? { ...mapUser(profile), permissions }
        : {
            id: authUser.id,
            name: authUser.user_metadata?.name ?? authUser.email?.split("@")[0] ?? "",
            email: authUser.email ?? "",
            role: (authUser.user_metadata?.role as "admin" | "employee") ?? "employee",
            avatar: "",
            department: "",
            createdAt: new Date(authUser.created_at),
            isActive: true,
            permissions: defaultPermissions(),
          },
    },
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  const permissions = profile
    ? await fetchPermissions(authUser.id, supabase)
    : defaultPermissions();

  if (profile) {
    return { ...mapUser(profile), permissions };
  }

  return {
    id: authUser.id,
    name: (authUser.user_metadata?.name as string) ?? authUser.email?.split("@")[0] ?? "",
    email: authUser.email ?? "",
    role: (authUser.user_metadata?.role as "admin" | "employee") ?? "employee",
    avatar: "",
    department: "",
    createdAt: new Date(authUser.created_at),
    isActive: true,
    permissions: defaultPermissions(),
  };
}

export async function fetchCurrentPermissions() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return defaultPermissions();

  return fetchPermissions(user.id, supabase);
}
