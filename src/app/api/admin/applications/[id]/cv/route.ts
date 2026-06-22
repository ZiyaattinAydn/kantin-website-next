import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/auth/admin";
import { logAdminAction } from "@/lib/admin/audit";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getAdminAccess();
  if (access.status === "signed_out") return NextResponse.json({ ok: false, error: "Oturum gerekli." }, { status: 401 });
  if (access.status !== "authorized") return NextResponse.json({ ok: false, error: "Yetkisiz erişim." }, { status: 403 });

  const { id } = await params;
  const supabase = await createClient();
  const { data: application, error: applicationError } = await supabase
    .from("job_applications")
    .select("id, full_name, cv_media_id, privacy_status")
    .eq("id", id)
    .single();
  if (applicationError || !application) return NextResponse.json({ ok: false, error: "Başvuru bulunamadı." }, { status: 404 });
  if (application.privacy_status !== "active" || !application.cv_media_id) {
    return NextResponse.json({ ok: false, error: "CV erişimi bu başvuru için kapalı." }, { status: 410 });
  }

  const { data: media, error: mediaError } = await supabase
    .from("media")
    .select("bucket_name, object_path")
    .eq("id", application.cv_media_id)
    .single();
  if (mediaError || !media?.bucket_name || !media.object_path) {
    return NextResponse.json({ ok: false, error: "CV dosyası bulunamadı." }, { status: 404 });
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(media.bucket_name)
    .createSignedUrl(media.object_path, 60, { download: true });
  if (signedError || !signed?.signedUrl) return NextResponse.json({ ok: false, error: "CV indirme bağlantısı oluşturulamadı." }, { status: 500 });

  await logAdminAction({
    actorId: access.admin.userId,
    action: "application_cv_download",
    entityType: "job_applications",
    entityId: application.id,
    entityLabel: application.full_name,
  });

  return NextResponse.redirect(signed.signedUrl, { status: 302 });
}
