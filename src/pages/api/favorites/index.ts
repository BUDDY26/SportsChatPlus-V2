import type { NextApiRequest, NextApiResponse } from "next";
import { createAdminClient } from "@/lib/supabase";
import { z } from "zod";
import type { FavoriteTeam } from "@/lib/sports/types";

const insertSchema = z.object({
  userId: z.string().min(1),
  teamName: z.string().min(1),
  league: z.string().min(1),
  teamId: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabase = createAdminClient();

  if (req.method === "GET") {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const { data, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    const favorites: FavoriteTeam[] = (data ?? []).map((f) => ({
      id: f.id,
      userId: f.user_id,
      teamName: f.team_name,
      league: f.league as any,
      teamId: f.team_id ?? undefined,
    }));

    return res.status(200).json(favorites);
  }

  if (req.method === "POST") {
    const parsed = insertSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid data" });

    const { userId, teamName, league, teamId } = parsed.data;
    const { data, error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, team_name: teamName, league, team_id: teamId })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const fav: FavoriteTeam = {
      id: data.id,
      userId: data.user_id,
      teamName: data.team_name,
      league: data.league as any,
      teamId: data.team_id ?? undefined,
    };

    return res.status(201).json(fav);
  }

  if (req.method === "DELETE") {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "id required" });

    const { error } = await supabase.from("favorites").delete().eq("id", id);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(204).end();
  }

  return res.status(405).end();
}
