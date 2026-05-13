"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inviteEmployeeSchema, acceptInviteSchema, type AcceptInviteData } from "../schemas/invite-schema";
import crypto from "crypto";
import { buildPermissionMap, defaultPermissions } from "../utils/permissions";

export async function inviteEmployeeAction(email: string) {
  const parsed = inviteEmployeeSchema.safeParse({ email });
  if (!parsed.success) {
    return { success: false as const, error: "Invalid email address" };
  }

  const supabase = await createClient();

  const {
    data: { user: admin },
  } = await supabase.auth.getUser();
  if (!admin) {
    return { success: false as const, error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", admin.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false as const, error: "Only admins can invite employees" };
  }

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile) {
    return { success: false as const, error: "User already registered" };
  }

  const { data: existingInvite } = await supabase
    .from("invitations")
    .select("id")
    .eq("email", email)
    .is("accepted_at", null)
    .maybeSingle();

  if (existingInvite) {
    return { success: false as const, error: "Invitation already sent to this email" };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const { error: inviteError } = await supabase.from("invitations").insert({
    email: email,
    token,
    expires_at: expiresAt.toISOString(),
    created_by: admin.id,
  });

  if (inviteError) {
    return { success: false as const, error: "Failed to create invitation" };
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const inviteUrl = `${origin}/invite?token=${token}`;

  return {
    success: true as const,
    data: { inviteUrl },
  };
}

export async function getInvitationByToken(token: string) {
  const supabase = createAdminClient();

  const { data: invitation } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (!invitation) {
    return { valid: false as const, error: "Invalid invitation link" };
  }

  if (invitation.accepted_at) {
    return { valid: false as const, error: "Invitation already accepted" };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { valid: false as const, error: "Invitation has expired" };
  }

  return { valid: true as const, email: invitation.email, token: invitation.token };
}

export async function acceptInviteAction(data: AcceptInviteData) {
  const parsed = acceptInviteSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid form data" };
  }

  const { token, name, password } = parsed.data;

  const adminClient = createAdminClient();

  const { data: invitation } = await adminClient
    .from("invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (!invitation || invitation.accepted_at) {
    return { success: false as const, error: "Invalid or expired invitation" };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { success: false as const, error: "Invitation has expired" };
  }

  const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
    email: invitation.email,
    password,
    email_confirm: true,
    user_metadata: { name, role: "employee" },
  });

  if (createError) {
    if (createError.message?.includes("already exists")) {
      return { success: false as const, error: "User already registered" };
    }
    return { success: false as const, error: "Failed to create account" };
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      name,
      avatar: name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase(),
      department: "General",
    })
    .eq("id", authData.user.id);

  if (profileError) {
    return { success: false as const, error: "Account created but profile setup failed" };
  }

  const defaults = defaultPermissions();
  const permRows = Object.entries(defaults).flatMap(([resource, actions]) =>
    actions.map((action) => ({
      user_id: authData.user.id,
      resource,
      action,
    }))
  );

  if (permRows.length > 0) {
    await adminClient.from("user_permissions").insert(permRows);
  }

  await adminClient
    .from("invitations")
    .update({ accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  const supabase = await createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: invitation.email,
    password,
  });

  if (signInError) {
    return { success: false as const, error: "Account created but auto-login failed" };
  }
}

export async function listEmployees() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const adminClient = createAdminClient();
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (!profiles) return [];

  const { data: permRows } = await adminClient
    .from("user_permissions")
    .select("user_id, resource, action");

  const permsByUser: Record<string, { resource: string; action: string }[]> = {};
  if (permRows) {
    for (const row of permRows) {
      if (!permsByUser[row.user_id]) permsByUser[row.user_id] = [];
      permsByUser[row.user_id].push({ resource: row.resource, action: row.action });
    }
  }

  return profiles.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    role: p.role as "admin" | "employee",
    avatar: p.avatar,
    department: p.department,
    createdAt: new Date(p.created_at),
    isActive: p.is_active,
    permissions: buildPermissionMap(permsByUser[p.id] || []),
  }));
}

export async function updateUserPermissions(
  userId: string,
  permissionMap: Record<string, string[]>
) {
  const adminClient = createAdminClient();

  const { error: deleteError } = await adminClient
    .from("user_permissions")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return { success: false as const, error: "Failed to update permissions" };
  }

  const rows: { user_id: string; resource: string; action: string }[] = [];
  for (const [resource, actions] of Object.entries(permissionMap)) {
    for (const action of actions) {
      rows.push({ user_id: userId, resource, action });
    }
  }

  if (rows.length > 0) {
    const { error: insertError } = await adminClient
      .from("user_permissions")
      .insert(rows);

    if (insertError) {
      return { success: false as const, error: "Failed to update permissions" };
    }
  }

  return { success: true as const };
}

export async function deleteUserAction(userId: string) {
  const adminClient = createAdminClient();

  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    return { success: false as const, error: "Failed to delete user" };
  }

  return { success: true as const };
}

export async function updateEmployeeAction(
  userId: string,
  data: { name?: string; email?: string; role?: string; department?: string }
) {
  const adminClient = createAdminClient();

  const updateData: Record<string, string> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.department !== undefined) updateData.department = data.department;

  if (Object.keys(updateData).length === 0) {
    return { success: true as const };
  }

  const { error } = await adminClient.from("profiles").update(updateData).eq("id", userId);

  if (error) {
    return { success: false as const, error: "Failed to update employee" };
  }

  return { success: true as const };
}
