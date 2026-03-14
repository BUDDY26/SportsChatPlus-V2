import type { NextApiRequest, NextApiResponse } from "next";
import { createAdminClient } from "@/lib/supabase";
import { z } from "zod";

const schema = z.object({
  userId: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type SuccessResponse = { id: string; fullName: string | null };
type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== "PATCH") return res.status(405).end();

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors[0].message });
  }

  const { userId, name } = parsed.data;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: name })
    .eq("id", userId)
    .select("id, full_name")
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ id: data.id, fullName: data.full_name });
}
