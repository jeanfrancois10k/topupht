"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { getStatusColor } from "@/lib/utils";
import { Shield } from "lucide-react";
import type { AuditLog } from "@/types/shared";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabaseClient.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(50);
        if (error) throw error;
        setLogs((data ?? []) as AuditLog[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Spinner />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-surface-50">Logs d'audit</h1>
        <p className="mt-1 text-surface-400">{logs.length} entrée(s)</p>
      </div>

      {logs.length === 0 ? (
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="py-12 text-center">
            <Shield className="mx-auto h-12 w-12 text-surface-600" />
            <p className="mt-3 text-surface-400">Aucun log d'audit.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="border-surface-700 bg-surface-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-surface-50">{log.action}</p>
                    <p className="text-xs text-surface-400">{log.entity_type} - {log.entity_id} - {log.user_id}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-surface-600 text-surface-300">{log.ip_address ?? "N/A"}</Badge>
                    <p className="mt-1 text-xs text-surface-400">{log.created_at}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}