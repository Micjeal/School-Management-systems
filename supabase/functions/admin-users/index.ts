import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type User } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const normalizeEmail = (value: unknown) =>
  String(value ?? "").trim().toLowerCase();

async function findUserByEmail(
  admin: ReturnType<typeof createClient>,
  email: string,
): Promise<User | null> {
  const perPage = 200;

  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find(
      (candidate) => normalizeEmail(candidate.email) === email,
    );
    if (user) return user;

    if (data.users.length < perPage) return null;
  }

  throw new Error("Unable to complete the user lookup safely");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const url = Deno.env.get("SUPABASE_URL");
    const anon = Deno.env.get("SUPABASE_ANON_KEY");
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!url || !anon || !service) {
      return json({ error: "Supabase function secrets are incomplete" }, 500);
    }

    const token = request.headers
      .get("Authorization")
      ?.replace(/^Bearer\s+/i, "");

    if (!token) return json({ error: "Missing authorization" }, 401);

    // Use admin method to get user by ID extracted from JWT
    let userId: string | null = null;
    try {
      // Simple JWT decode to get user ID (header.payload.signature)
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        userId = payload.sub;
      }
    } catch (e) {
      return json({ error: "Invalid token format" }, 401);
    }

    if (!userId) return json({ error: "Unable to extract user ID from token" }, 401);

    // Create separate clients for auth and database operations to avoid JWT verification issues
    const authAdmin = createClient(url, service, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const dbAdmin = createClient(url, service, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${service}`,
        },
      },
    });

    const { data: userData, error: userError } = await authAdmin.auth.admin.getUserById(userId);

    if (userError || !userData?.user) return json({ error: "Invalid session" }, 401);

    const user = userData.user;

    const { data: platform, error: platformError } = await dbAdmin
      .from("platform_user_roles")
      .select("role:roles(code)")
      .eq("user_id", user.id);

    if (platformError) {
      return json(
        {
          error: "Unable to verify platform authorization",
          stage: "authorization",
          details: platformError.message,
        },
        500,
      );
    }

    const platformAdmin = (platform ?? []).some((item: any) =>
      ["super_admin", "platform_admin"].includes(item.role?.code),
    );

    const body = await request.json();
    const action = body.action;

    const hasSchoolPermission = async (
      schoolId: string,
      permission: string,
    ) => {
      const { data, error } = await dbAdmin
        .from("school_memberships")
        .select(
          "id,membership_roles(role:roles(role_permissions(permission:permissions(code))))",
        )
        .eq("user_id", user.id)
        .eq("school_id", schoolId)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      return Boolean(
        data?.membership_roles?.some((membershipRole: any) =>
          membershipRole.role?.role_permissions?.some(
            (rolePermission: any) =>
              rolePermission.permission?.code === permission,
          ),
        ),
      );
    };

    if (action === "list") {
      if (!platformAdmin) {
        return json({ error: "Platform administrator required" }, 403);
      }

      const page = Math.max(1, Number(body.page || 1));
      const perPage = Math.min(100, Number(body.perPage || 50));
      const { data, error } = await authAdmin.auth.admin.listUsers({
        page,
        perPage,
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "invite") {
      const email = normalizeEmail(body.email);
      const temporaryPassword = String(body.temporaryPassword ?? "");
      const schoolId = body.schoolId ? String(body.schoolId) : null;
      const roleCode = body.roleCode ? String(body.roleCode) : null;
      const platformRole = body.platformRole
        ? String(body.platformRole)
        : null;

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return json({ error: "Valid email required", stage: "validation" }, 400);
      }

      if (temporaryPassword.length < 10) {
        return json(
          {
            error: "Temporary password must contain at least 10 characters",
            stage: "validation",
          },
          400,
        );
      }

      if (schoolId && !roleCode) {
        return json(
          {
            error: "A school role is required",
            stage: "validation",
          },
          400,
        );
      }

      if (platformRole && !platformAdmin) {
        return json(
          {
            error: "Platform administrator access is required",
            stage: "authorization",
          },
          403,
        );
      }

      if (
        schoolId &&
        !platformAdmin &&
        !(await hasSchoolPermission(schoolId, "users.manage"))
      ) {
        return json(
          {
            error: "users.manage permission is required",
            stage: "authorization",
          },
          403,
        );
      }

      if (
        roleCode &&
        ["super_admin", "platform_admin"].includes(roleCode)
      ) {
        return json(
          {
            error: "Platform roles cannot be assigned as school roles",
            stage: "role_assignment",
          },
          400,
        );
      }

      let invited = await findUserByEmail(authAdmin, email);
      const existingAccount = Boolean(invited);
      let temporaryPasswordApplied = false;

      if (!invited) {
        console.log(`Creating new user ${email}, password length: ${temporaryPassword.length}`);
        const { data, error } = await authAdmin.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            school_id: schoolId,
            invited_by: user.id,
            must_change_password: true,
          },
        });

        if (error || !data.user) {
          console.error(`User creation failed for ${email}:`, error);
          return json(
            {
              error: "Auth account creation failed",
              stage: "auth_user",
              details: error?.message ?? "No Auth user was returned",
            },
            error?.status ?? 500,
          );
        }

        console.log(`User created successfully for ${email}, temporaryPasswordApplied set to true`);
        invited = data.user;
        temporaryPasswordApplied = true;
      } else {
        // Check if existing user has platform admin roles
        const { data: existingPlatformRoles, error: platformRoleError } = await dbAdmin
          .from("platform_user_roles")
          .select("role:roles(code)")
          .eq("user_id", invited.id);

        if (platformRoleError) {
          return json(
            {
              error: "Unable to verify existing user platform roles",
              stage: "authorization",
              details: platformRoleError.message,
            },
            500,
          );
        }

        const hasPlatformAdminRole = (existingPlatformRoles ?? []).some((item: any) =>
          ["super_admin", "platform_admin"].includes(item.role?.code),
        );

        if (hasPlatformAdminRole) {
          return json(
            {
              error: "User already has platform administrator role and cannot be onboarded to a school",
              stage: "authorization",
            },
            409,
          );
        }

        // Update password for existing users when temporary password is provided
        console.log(`Updating password for existing user ${invited.id} (${invited.email}), password length: ${temporaryPassword.length}`);
        const { data: updated, error: updateError } =
          await authAdmin.auth.admin.updateUserById(invited.id, {
            password: temporaryPassword,
            email_confirm: true,
            user_metadata: {
              ...invited.user_metadata,
              school_id: schoolId,
              invited_by: user.id,
              must_change_password: true,
            },
          });

        if (updateError) {
          console.error(`Password update failed for ${invited.id}:`, updateError);
          return json(
            {
              error: "Temporary password assignment failed",
              stage: "auth_user",
              details: updateError.message,
            },
            updateError.status ?? 500,
          );
        }

        if (!updated.user) {
          console.error(`No updated user returned for ${invited.id}`);
          return json(
            {
              error: "Temporary password assignment failed",
              stage: "auth_user",
              details: "No updated Auth user was returned",
            },
            500,
          );
        }

        console.log(`Password updated successfully for ${invited.id}, temporaryPasswordApplied set to true`);
        invited = updated.user;
        temporaryPasswordApplied = true;
      }

      const profileValues: Record<string, unknown> = {
        id: invited.id,
        display_name:
          invited.user_metadata?.display_name || email.split("@")[0],
        is_active: true,
      };

      if (temporaryPasswordApplied) {
        profileValues.must_change_password = true;
      }

      const { error: profileError } = await dbAdmin
        .from("profiles")
        .upsert(profileValues, { onConflict: "id" });

      if (profileError) {
        return json(
          {
            error: "Profile creation failed",
            stage: "profile",
            details: profileError.message,
          },
          500,
        );
      }

      if (schoolId) {
        const { data: membership, error: membershipError } = await dbAdmin
          .from("school_memberships")
          .upsert(
            {
              school_id: schoolId,
              user_id: invited.id,
              status: "active",
              invited_by: user.id,
              ended_at: null,
            },
            { onConflict: "school_id,user_id" },
          )
          .select("id")
          .single();

        if (membershipError || !membership) {
          return json(
            {
              error: "School membership creation failed",
              stage: "school_membership",
              details:
                membershipError?.message ?? "No membership was returned",
            },
            500,
          );
        }

        const { data: roles, error: roleError } = await dbAdmin
          .from("roles")
          .select("id,school_id")
          .eq("code", roleCode)
          .eq("is_active", true)
          .or(`school_id.eq.${schoolId},school_id.is.null`);

        if (roleError) {
          return json(
            {
              error: "Role lookup failed",
              stage: "role_lookup",
              details: roleError.message,
            },
            500,
          );
        }

        const role = (roles ?? []).sort((left: any, right: any) => {
          if (left.school_id === schoolId && right.school_id !== schoolId) {
            return -1;
          }
          if (right.school_id === schoolId && left.school_id !== schoolId) {
            return 1;
          }
          return 0;
        })[0];

        if (!role) {
          return json(
            {
              error: "Requested school role was not found",
              stage: "role_lookup",
            },
            400,
          );
        }

        const { error: assignmentError } = await dbAdmin
          .from("membership_roles")
          .upsert(
            {
              membership_id: membership.id,
              role_id: role.id,
              assigned_by: user.id,
            },
            { onConflict: "membership_id,role_id" },
          );

        if (assignmentError) {
          return json(
            {
              error: "School role assignment failed",
              stage: "role_assignment",
              details: assignmentError.message,
            },
            500,
          );
        }
      }

      if (platformRole) {
        const { data: role, error: roleError } = await dbAdmin
          .from("roles")
          .select("id")
          .is("school_id", null)
          .eq("code", platformRole)
          .eq("is_active", true)
          .single();

        if (roleError || !role) {
          return json(
            {
              error: "Platform role lookup failed",
              stage: "platform_role_lookup",
              details: roleError?.message ?? "No platform role was returned",
            },
            500,
          );
        }

        const { error: assignmentError } = await dbAdmin
          .from("platform_user_roles")
          .upsert(
            {
              user_id: invited.id,
              role_id: role.id,
              assigned_by: user.id,
            },
            { onConflict: "user_id,role_id" },
          );

        if (assignmentError) {
          return json(
            {
              error: "Platform role assignment failed",
              stage: "platform_role_assignment",
              details: assignmentError.message,
            },
            500,
          );
        }
      }

      return json({
        userId: invited.id,
        email: invited.email,
        existingAccount,
        temporaryPasswordApplied,
      });
    }

    if (action === "disable") {
      if (!platformAdmin) {
        return json({ error: "Platform administrator required" }, 403);
      }
      if (!body.userId) return json({ error: "userId required" }, 400);

      const { data, error } = await authAdmin.auth.admin.updateUserById(
        body.userId,
        { ban_duration: body.disabled === false ? "none" : "876000h" },
      );
      if (error) throw error;

      await dbAdmin
        .from("profiles")
        .update({ is_active: body.disabled === false })
        .eq("id", body.userId);

      return json({ user: data.user });
    }

    return json({ error: "Unsupported action" }, 400);
  } catch (error) {
    console.error(error);
    return json(
      {
        error: error instanceof Error ? error.message : "Unexpected error",
      },
      500,
    );
  }
});