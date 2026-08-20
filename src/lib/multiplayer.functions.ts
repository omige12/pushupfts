import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const searchPlayer = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ playerId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, xp, record, avatar_url, level, player_id, last_seen_at')
      .eq('player_id', data.playerId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return profile;
  });

export const createChallenge = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    challengerId: z.string(),
    challengedId: z.string(),
    duration: z.number()
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: challenge, error } = await supabaseAdmin
      .from('challenges')
      .insert({
        challenger_id: data.challengerId,
        challenged_id: data.challengedId,
        duration: data.duration,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return challenge;
  });

export const getRanking = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ 
    type: z.enum(['global', 'friends']),
    userId: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    let query = supabaseAdmin
      .from('profiles')
      .select('id, name, xp, record, wins, streak, avatar_url, player_id')
      .order('xp', { ascending: false });

    if (data.type === 'friends' && data.userId) {
      const { data: friendships } = await supabaseAdmin
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${data.userId},friend_id.eq.${data.userId}`)
        .eq('status', 'accepted');
      
      const friendIds = friendships ? friendships.map((f: any) => 
        f.user_id === data.userId ? f.friend_id : f.user_id
      ) : [];
      
      query = query.in('id', [...friendIds, data.userId]);
    } else {
        query = query.limit(100);
    }

    const { data: results, error } = await query;
    if (error) throw new Error(error.message);
    return results;
  });
