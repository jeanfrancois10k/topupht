"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { getStatusColor } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import type { SupportTicket } from "@/types/shared";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, error } = await supabaseClient.from("support_tickets").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setTickets((data ?? []) as SupportTicket[]);
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
        <h1 className="text-3xl font-bold text-white">Support</h1>
        <p className="mt-1 text-surface-400">{tickets.length} ticket(s)</p>
      </div>

      {tickets.length === 0 ? (
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="py-12 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-surface-600" />
            <p className="mt-3 text-surface-400">Aucun ticket pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="border-surface-700 bg-surface-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{ticket.subject}</p>
                    <p className="text-xs text-surface-400">{ticket.user_id} - {ticket.category}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                    <Badge className="mt-1 ml-2" variant="outline">{ticket.priority}</Badge>
                    <p className="mt-1 text-xs text-surface-400">{ticket.created_at}</p>
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