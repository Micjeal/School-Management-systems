import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type User } from "@supabase/supabase-js";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });

const normalizeEmail = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

function generateTemporaryPassword() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const random = btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  return `Aa1!${random}`;
}

async function findUserByEmail(
  admin: ReturnType<typeof createClient>,
  email: string
): Promise<User | null> {
  const perPage = 200;

  for (let page = 1; page <= 100; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find((candidate) => normalizeEmail(candidate.email) === email);
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

    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) return json({ error: "Missing authorization" }, 401);

    // Validate the caller's access token with Supabase Auth. Decoding a JWT and
    // looking up its `sub` is not authentication because the signature and
    // expiry have not been verified.
    const authClient = createClient(url, anon, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    const { data: callerData, error: callerError } = await authClient.auth.getUser(token);
    if (callerError || !callerData.user) {
      return json({ error: "Invalid or expired session" }, 401);
    }

    const userId = callerData.user.id;

    // Create separate service-role clients only after caller authentication.
    const authAdmin = createClient(url, service, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    const dbAdmin = createClient(url, service, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${service}`
        }
      }
    });

    const user = callerData.user;

    const { data: platform, error: platformError } = await dbAdmin
      .from("platform_user_roles")
      .select("role:roles(code)")
      .eq("user_id", user.id);

    if (platformError) {
      return json(
        {
          error: "Unable to verify platform authorization",
          stage: "authorization",
          details: platformError.message
        },
        500
      );
    }

    const platformAdmin = (platform ?? []).some((item: any) =>
      ["super_admin", "platform_admin"].includes(item.role?.code)
    );
    const superAdmin = (platform ?? []).some((item: any) => item.role?.code === "super_admin");

    const body = await request.json();
    const action = body.action;

    const hasSchoolPermission = async (schoolId: string, permission: string) => {
      const { data, error } = await dbAdmin
        .from("school_memberships")
        .select("id,membership_roles(role:roles(role_permissions(permission:permissions(code))))")
        .eq("user_id", user.id)
        .eq("school_id", schoolId)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      return Boolean(
        data?.membership_roles?.some((membershipRole: any) =>
          membershipRole.role?.role_permissions?.some(
            (rolePermission: any) => rolePermission.permission?.code === permission
          )
        )
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
        perPage
      });
      if (error) throw error;
      return json(data);
    }

    if (action === "invite" || action === "link-existing") {
      const email = normalizeEmail(body.email);
      const schoolId = body.schoolId ? String(body.schoolId) : null;
      const roleCode = body.roleCode ? String(body.roleCode) : null;
      const platformRole = body.platformRole ? String(body.platformRole) : null;
      const personId = body.personId ? String(body.personId) : null;
      const explicitExistingLink = action === "link-existing";

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        return json({ error: "Valid email required", stage: "validation" }, 400);
      }

      if (schoolId && !roleCode) {
        return json(
          {
            error: "A school role is required",
            stage: "validation"
          },
          400
        );
      }

      if (personId && !schoolId) {
        return json({ error: "A school is required when linking a person", stage: "validation" }, 400);
      }

      if (platformRole && !superAdmin) {
        return json(
          {
            error: "Only a platform super administrator may assign platform roles",
            stage: "authorization"
          },
          403
        );
      }

      if (platformRole && !["super_admin", "platform_admin"].includes(platformRole)) {
        return json({ error: "Invalid platform role", stage: "validation" }, 400);
      }

      if (schoolId && !platformAdmin && !(await hasSchoolPermission(schoolId, "users.manage"))) {
        return json(
          {
            error: "users.manage permission is required",
            stage: "authorization"
          },
          403
        );
      }

      if (roleCode && ["super_admin", "platform_admin"].includes(roleCode)) {
        return json(
          {
            error: "Platform roles cannot be assigned as school roles",
            stage: "role_assignment"
          },
          400
        );
      }

      let invited = await findUserByEmail(authAdmin, email);
      const existingAccount = Boolean(invited);
      let temporaryPasswordApplied = false;
      let temporaryPassword: string | null = null;

      if (!invited) {
        temporaryPassword = generateTemporaryPassword();

        const { data, error } = await authAdmin.auth.admin.createUser({
          email,
          password: temporaryPassword,
          email_confirm: true,
          user_metadata: {
            school_id: schoolId,
            invited_by: user.id,
            must_change_password: true
          }
        });

        if (error || !data.user) {
          return json(
            {
              error: "Auth account creation failed",
              stage: "auth_user",
              details: error?.message ?? "No Auth user was returned"
            },
            error?.status ?? 500
          );
        }

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
              details: platformRoleError.message
            },
            500
          );
        }

        const hasPlatformAdminRole = (existingPlatformRoles ?? []).some((item: any) =>
          ["super_admin", "platform_admin"].includes(item.role?.code)
        );

        if (hasPlatformAdminRole) {
          return json(
            {
              error:
                "User already has platform administrator role and cannot be onboarded to a school",
              stage: "authorization"
            },
            409
          );
        }
        const { data: existingProfile, error: existingProfileError } = await dbAdmin
          .from("profiles").select("must_change_password").eq("id", invited.id).maybeSingle();
        if (existingProfileError) {
          return json({ error: "Unable to verify invitation recovery state", stage: "profile", details: existingProfileError.message }, 500);
        }
        const recoverablePartialInvitation =
          !invited.last_sign_in_at &&
          invited.user_metadata?.invited_by === user.id &&
          invited.user_metadata?.must_change_password === true &&
          existingProfile?.must_change_password === true;
        if (recoverablePartialInvitation) {
          temporaryPassword = generateTemporaryPassword();
          const { error: retryPasswordError } = await authAdmin.auth.admin.updateUserById(invited.id, { password: temporaryPassword });
          if (retryPasswordError) {
            return json({ error: "Partial invitation password recovery failed", stage: "auth_user", details: retryPasswordError.message }, 500);
          }
          temporaryPasswordApplied = true;
        }
        // A domain-person request must never attach an arbitrary existing Auth
        // account by matching email. The only retry exception is the narrowly
        // verified partial invitation created by this same caller.
        if (personId && !recoverablePartialInvitation && !explicitExistingLink) {
          return json(
            {
              code: "existing_account",
              email,
              userId: invited.id,
              canLink: !hasPlatformAdminRole
            },
            409
          );
        }
        if (personId && explicitExistingLink) {
          const { data: person, error: personError } = await dbAdmin.from("people").select("user_id").eq("id", personId).eq("school_id", schoolId).maybeSingle();
          const { data: otherLink, error: otherLinkError } = await dbAdmin.from("people").select("id").eq("school_id", schoolId).eq("user_id", invited.id).neq("id", personId).maybeSingle();
          if (personError || otherLinkError || !person) return json({ error: "Student person was not found", stage: "person_link" }, 404);
          if (person.user_id && person.user_id !== invited.id) return json({ error: "This student is already linked to another account.", stage: "person_link" }, 409);
          if (otherLink) return json({ error: "This account is already linked to another person and cannot be attached to this student.", stage: "person_link" }, 409);
        }
      }

      const profileValues: Record<string, unknown> = {
        id: invited.id,
        display_name: invited.user_metadata?.display_name || email.split("@")[0],
        is_active: true
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
            details: profileError.message
          },
          500
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
              ended_at: null
            },
            { onConflict: "school_id,user_id" }
          )
          .select("id")
          .single();

        if (membershipError || !membership) {
          return json(
            {
              error: "School membership creation failed",
              stage: "school_membership",
              details: membershipError?.message ?? "No membership was returned"
            },
            500
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
              details: roleError.message
            },
            500
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
              stage: "role_lookup"
            },
            400
          );
        }

        const { error: assignmentError } = await dbAdmin.from("membership_roles").upsert(
          {
            membership_id: membership.id,
            role_id: role.id,
            assigned_by: user.id
          },
          { onConflict: "membership_id,role_id" }
        );

        if (assignmentError) {
          return json(
            {
              error: "School role assignment failed",
              stage: "role_assignment",
              details: assignmentError.message
            },
            500
          );
        }

        if (personId) {
          const { error: linkError } = await dbAdmin.rpc("link_person_to_user", {
            target_school_id: schoolId,
            target_person_id: personId,
            target_user_id: invited.id
          });
          if (linkError) {
            return json({
              error: "Account provisioning completed but person linkage failed",
              stage: "person_link",
              details: linkError.message,
              partialSuccess: { authAccountCreated: !existingAccount, membershipCreated: true, personLinked: false },
              userId: invited.id,
              existingAccount,
              temporaryPasswordApplied,
              ...(temporaryPassword ? { temporaryPassword } : {})
            }, 409);
          }
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
              details: roleError?.message ?? "No platform role was returned"
            },
            500
          );
        }

        const { error: assignmentError } = await dbAdmin.from("platform_user_roles").upsert(
          {
            user_id: invited.id,
            role_id: role.id,
            assigned_by: user.id
          },
          { onConflict: "user_id,role_id" }
        );

        if (assignmentError) {
          return json(
            {
              error: "Platform role assignment failed",
              stage: "platform_role_assignment",
              details: assignmentError.message
            },
            500
          );
        }
      }

      return json({
        userId: invited.id,
        email: invited.email,
        existingAccount,
        temporaryPasswordApplied,
        personLinked: Boolean(personId),
        ...(temporaryPassword ? { temporaryPassword } : {})
      });
    }

    if (action === "enable-school-access" || action === "disable-school-access") {
      const schoolId = body.schoolId ? String(body.schoolId) : "";
      const personId = body.personId ? String(body.personId) : "";
      const userId = body.userId ? String(body.userId) : "";
      const roleCode = body.roleCode ? String(body.roleCode) : "";
      if (!schoolId || !personId || !userId || !["student", "teacher"].includes(roleCode)) {
        return json({ error: "A school, linked person, user, and supported school role are required", stage: "validation" }, 400);
      }
      if (!platformAdmin && !(await hasSchoolPermission(schoolId, "users.manage"))) {
        return json({ error: "users.manage permission is required", stage: "authorization" }, 403);
      }

      // The caller supplies identifiers only as locators. The authoritative
      // relationship must already be person.user_id inside this school.
      const { data: person, error: personError } = await dbAdmin
        .from("people")
        .select("id,user_id")
        .eq("id", personId)
        .eq("school_id", schoolId)
        .maybeSingle();
      if (personError || !person || person.user_id !== userId) {
        return json({ error: "The linked person is not available in this school", stage: "person_link" }, 404);
      }

      const { data: role, error: roleError } = await dbAdmin
        .from("roles")
        .select("id,school_id")
        .eq("code", "student")
        .eq("is_active", true)
        .or(`school_id.eq.${schoolId},school_id.is.null`)
        .order("school_id", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (roleError || !role) return json({ error: "The requested school role is not available", stage: "role_lookup" }, 400);

      const { data: membership, error: membershipError } = await dbAdmin
        .from("school_memberships")
        .select("id,status")
        .eq("school_id", schoolId)
        .eq("user_id", userId)
        .maybeSingle();

      if (action === "disable-school-access") {
        if (!membershipError && membership) {
          const { error: removeRoleError } = await dbAdmin
            .from("membership_roles")
            .delete()
            .eq("membership_id", membership.id)
            .eq("role_id", role.id);
          if (removeRoleError) return json({ error: "School role removal failed", stage: "role_assignment", details: removeRoleError.message }, 500);
        }
        // Do not ban the Auth account or end the membership: it can hold
        // other roles in this school and memberships in other schools.
        return json({ ok: true, access: "disabled" });
      }

      const { data: activeMembership, error: activateMembershipError } = await dbAdmin
        .from("school_memberships")
        .upsert({ school_id: schoolId, user_id: userId, status: "active", invited_by: user.id, ended_at: null }, { onConflict: "school_id,user_id" })
        .select("id")
        .single();
      if (activateMembershipError || !activeMembership) return json({ error: "School membership activation failed", stage: "school_membership", details: activateMembershipError?.message }, 500);
      const { error: assignmentError } = await dbAdmin.from("membership_roles").upsert({ membership_id: activeMembership.id, role_id: role.id, assigned_by: user.id }, { onConflict: "membership_id,role_id" });
      if (assignmentError) return json({ error: "Student role assignment failed", stage: "role_assignment", details: assignmentError.message }, 500);
      const { error: linkError } = await dbAdmin.rpc("link_person_to_user", { target_school_id: schoolId, target_person_id: personId, target_user_id: userId });
      if (linkError) return json({ error: "Person link repair failed", stage: "person_link", details: linkError.message }, 409);
      return json({ ok: true, access: "enabled" });
    }

    if (action === "issue-temporary-password") {
      const schoolId = body.schoolId ? String(body.schoolId) : "";
      const personId = body.personId ? String(body.personId) : "";
      const userId = body.userId ? String(body.userId) : "";
      const roleCode = body.roleCode ? String(body.roleCode) : "";
      if (!schoolId || !personId || !userId || !["student", "teacher"].includes(roleCode)) {
        return json({ error: "A school, linked person, user, and supported school role are required", stage: "validation" }, 400);
      }
      if (!platformAdmin && !(await hasSchoolPermission(schoolId, "users.manage"))) {
        return json({ error: "users.manage permission is required", stage: "authorization" }, 403);
      }

      const { data: person, error: personError } = await dbAdmin
        .from("people")
        .select("id,user_id")
        .eq("id", personId)
        .eq("school_id", schoolId)
        .maybeSingle();
      if (personError || !person || person.user_id !== userId) {
        return json({ error: "The linked person is not available in this school", stage: "person_link" }, 404);
      }

      const { data: targetPlatformRoles, error: targetPlatformRoleError } = await dbAdmin
        .from("platform_user_roles")
        .select("role:roles(code)")
        .eq("user_id", userId);
      if (targetPlatformRoleError) return json({ error: "Unable to verify account authorization", stage: "authorization" }, 500);
      if ((targetPlatformRoles ?? []).some((item: any) => ["super_admin", "platform_admin"].includes(item.role?.code))) {
        return json({ error: "Platform administrator accounts cannot receive a temporary password here", stage: "authorization" }, 409);
      }

      const temporaryPassword = generateTemporaryPassword();
      // Supabase Auth hashes and stores this password. The plaintext is only
      // returned in this immediate response and is never persisted by SchoolDB.
      const { data: updated, error: updateError } = await authAdmin.auth.admin.updateUserById(userId, { password: temporaryPassword });
      if (updateError || !updated.user) return json({ error: "Temporary password issuance failed", stage: "auth_user", details: updateError?.message }, 500);
      const { error: profileError } = await dbAdmin.from("profiles").upsert({ id: userId, must_change_password: true }, { onConflict: "id" });
      if (profileError) return json({ error: "Unable to require a password change", stage: "profile", details: profileError.message }, 500);
      return json({ ok: true, email: updated.user.email, temporaryPassword, mustChangePassword: true });
    }

    if (action === "disable") {
      if (!platformAdmin) {
        return json({ error: "Platform administrator required" }, 403);
      }
      if (!body.userId) return json({ error: "userId required" }, 400);

      if (body.disabled !== false) {
        const { data: superRoleAssignments, error: superRoleError } = await dbAdmin
          .from("platform_user_roles")
          .select("user_id,role:roles!inner(code)")
          .eq("role.code", "super_admin");

        if (superRoleError) {
          return json({ error: "Unable to verify super administrator coverage" }, 500);
        }

        const superAdminIds = [
          ...new Set(
            (superRoleAssignments ?? []).map((assignment: any) => String(assignment.user_id))
          )
        ];

        if (superAdminIds.includes(String(body.userId))) {
          if (!superAdmin) {
            return json(
              { error: "Only a super administrator may disable another super administrator" },
              403
            );
          }

          const { count, error: activeSuperAdminError } = await dbAdmin
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .in("id", superAdminIds)
            .eq("is_active", true);

          if (activeSuperAdminError) {
            return json({ error: "Unable to verify super administrator coverage" }, 500);
          }

          if ((count ?? 0) <= 1) {
            return json({ error: "The last active super administrator cannot be disabled" }, 409);
          }
        }
      }

      const { data, error } = await authAdmin.auth.admin.updateUserById(body.userId, {
        ban_duration: body.disabled === false ? "none" : "876000h"
      });
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
        error: error instanceof Error ? error.message : "Unexpected error"
      },
      500
    );
  }
});
