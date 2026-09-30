"use client";
import { useState, useTransition } from "react";
import { loadManagementHistory } from "@/lib/admin/history-actions";
import type { AdminResource } from "@/lib/admin/resources";
import type { AdminRecordRevision } from "@/lib/admin/revisions";
import AdminRevisionHistory from "../crud/AdminRevisionHistory";
import AdminDialog from "./AdminDialog";
export default function RecordHistory({
  resourceKey,
  id,
  label,
}: {
  resourceKey: string;
  id: string;
  label: string;
}) {
  const [records, setRecords] = useState<AdminRecordRevision[] | null>(null),
    [failed, setFailed] = useState(false),
    [pending, start] = useTransition();
  const [resource, setResource] = useState<AdminResource | null>(null);
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              const result = await loadManagementHistory(resourceKey, id);
              setFailed(!result.ok);
              setResource(result.resource);
              setRecords(result.records);
            } catch {
              setFailed(true);
              setResource(null);
              setRecords([]);
            }
          })
        }
      >
        {pending ? "Geçmiş yükleniyor…" : "Değişiklik geçmişi / geri al"}
      </button>
      {records ? (
        <AdminDialog
          title={`${label} — Değişiklik geçmişi`}
          open
          onClose={() => setRecords(null)}
        >
          {failed || !resource ? (
            <p role="alert">Değişiklik geçmişi okunamadı. Tekrar deneyin.</p>
          ) : (
            <AdminRevisionHistory
              resource={resource}
              recordId={id}
              recordLabel={label}
              revisions={records}
            />
          )}
        </AdminDialog>
      ) : null}
    </div>
  );
}
