import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { createLead, type LeadInput } from "@workspace/api-client-react";
import launchIds from "../../../api-server/src/lib/signature-launches.json";

declare global {
  interface Window {
    SignatureTracking?: {
      pageContext(): { page_url: string; page_title: string };
      pageView(): void;
      lead(id: string): void;
    };
  }
}

export function launchId(id: string, stored?: unknown) {
  return Object.hasOwn(launchIds, id)
    ? launchIds[id as keyof typeof launchIds]
    : typeof stored === "string" && /^\d{1,10}$/.test(stored) ? stored : "";
}

export function useSignatureLead() {
  const submission = useRef<{id: string; key: string} | null>(null);
  return useMutation({
    mutationFn: async ({ data }: { data: LeadInput & { "100bug_id_lanc"?: string } }) => {
      const key = JSON.stringify(data);
      if (submission.current?.key !== key)
        submission.current = {id: crypto.randomUUID(), key};
      const request = {
        ...data,
        ...window.SignatureTracking?.pageContext(),
        event_id: submission.current.id,
      };
      const result = await createLead(request) as Awaited<ReturnType<typeof createLead>> & {event_id?: string};
      if (!result?.id) throw new Error("Envio não confirmado.");
      submission.current = null;
      if (result.event_id) window.SignatureTracking?.lead(result.event_id);
      return result;
    },
  });
}
