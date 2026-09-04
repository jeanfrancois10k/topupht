// @ts-nocheck
import { createClient } from "@supabase/supabase-js";
import { supabaseClient } from "@/config/supabase";
import { type Database } from "@/types/database";

export function getSupabase() {
  return supabaseClient;
}

export async function supabaseQuery<T>(query: Promise<{ data: T | null; error: unknown }>, fallback?: T): Promise<T | null> {
  const { data, error } = await query;
  if (error) {
    console.error("Supabase query error:", error);
    return fallback ?? null;
  }
  return data;
}

export async function supabaseInsert<T>(table: keyof Database["public"]["Tables"], data: unknown, fallback?: T): Promise<T | null> {
  const { data: result, error } = await supabaseClient.from(table as string).insert(data as any).select().single();
  if (error) {
    console.error(`Supabase insert error on ${table}:`, error);
    return fallback ?? null;
  }
  return result as T;
}

export async function supabaseUpdate<T>(table: keyof Database["public"]["Tables"], id: string, data: unknown, fallback?: T): Promise<T | null> {
  const { data: result, error } = await supabaseClient.from(table as string).update(data as any).eq("id", id).select().single();
  if (error) {
    console.error(`Supabase update error on ${table}:`, error);
    return fallback ?? null;
  }
  return result as T;
}

export async function supabaseDelete(table: keyof Database["public"]["Tables"], id: string): Promise<boolean> {
  const { error } = await supabaseClient.from(table as string).delete().eq("id", id);
  if (error) {
    console.error(`Supabase delete error on ${table}:`, error);
    return false;
  }
  return true;
}

export async function supabaseFetch<T>(table: keyof Database["public"]["Tables"], options?: { id?: string; filter?: Record<string, string>; order?: { column: string; ascending: boolean } }): Promise<T[]> {
  let query = supabaseClient.from(table as string).select("*");
  if (options?.id) query = query.eq("id", options.id);
  if (options?.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) query = query.eq(key, value);
    });
  }
  if (options?.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending });
  }
  const { data, error } = await query;
  if (error) {
    console.error(`Supabase fetch error on ${table}:`, error);
    return [];
  }
  return (data ?? []) as T[];
}

export async function supabaseFetchOne<T>(table: keyof Database["public"]["Tables"], id: string): Promise<T | null> {
  const { data, error } = await supabaseClient.from(table as string).select("*").eq("id", id).single();
  if (error) {
    console.error(`Supabase fetchOne error on ${table}:`, error);
    return null;
  }
  return data as T;
}

export async function supabaseRpc<T>(functionName: string, parameters?: Record<string, unknown>): Promise<T | null> {
  const { data, error } = await supabaseClient.rpc(functionName, parameters);
  if (error) {
    console.error(`Supabase RPC error on ${functionName}:`, error);
    return null;
  }
  return data as T;
}