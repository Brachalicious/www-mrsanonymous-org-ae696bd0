/** Returns true when this user's inbox is locked pending admin verification. */
export async function isInboxLocked(supabaseAdmin: any, userId: string) {
  const { data } = await supabaseAdmin
    .from("inbox_recovery_locks")
    .select("status")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.status === "pending";
}
