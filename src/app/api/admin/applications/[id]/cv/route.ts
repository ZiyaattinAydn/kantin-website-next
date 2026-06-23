import { NextResponse } from "next/server";

import { requireAdminActionLog } from "@/lib/admin/audit";
import { getAdminAccess } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const access = await getAdminAccess();

  if (access.status === "signed_out") {
    return NextResponse.json(
      {
        ok: false,
        error: "Oturum gerekli.",
      },
      {
        status: 401,
      },
    );
  }

  if (access.status !== "authorized") {
    return NextResponse.json(
      {
        ok: false,
        error: "Yetkisiz erişim.",
      },
      {
        status: 403,
      },
    );
  }

  const { id } = await params;
  const supabase = await createClient();

  const {
    data: application,
    error: applicationError,
  } = await supabase
    .from("job_applications")
    .select("id, cv_media_id, privacy_status")
    .eq("id", id)
    .single();

  if (applicationError || !application) {
    return NextResponse.json(
      {
        ok: false,
        error: "Başvuru bulunamadı.",
      },
      {
        status: 404,
      },
    );
  }

  if (
    application.privacy_status !== "active" ||
    !application.cv_media_id
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "CV erişimi bu başvuru için kapalı.",
      },
      {
        status: 410,
      },
    );
  }

  const { data: media, error: mediaError } =
    await supabase
      .from("media")
      .select(
        "bucket_name, object_path, source, kind",
      )
      .eq("id", application.cv_media_id)
      .single();

  const isValidCareerDocument =
    media?.source === "storage" &&
    media.kind === "document" &&
    media.bucket_name === "career-cvs" &&
    Boolean(media.object_path);

  if (
    mediaError ||
    !media ||
    !isValidCareerDocument ||
    !media.bucket_name ||
    !media.object_path
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "CV dosyası bulunamadı.",
      },
      {
        status: 404,
      },
    );
  }

  const { data: signed, error: signedError } =
    await supabase.storage
      .from(media.bucket_name)
      .createSignedUrl(media.object_path, 60, {
        download: true,
      });

  if (signedError || !signed?.signedUrl) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "CV indirme bağlantısı oluşturulamadı.",
      },
      {
        status: 500,
      },
    );
  }

  try {
    await requireAdminActionLog({
      actorId: access.admin.userId,
      action: "application_cv_download",
      entityType: "job_applications",
      entityId: application.id,
      metadata: {
        access_method: "signed_url",
        expires_in_seconds: 60,
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Güvenli denetim kaydı oluşturulamadığı için CV erişimi geçici olarak durduruldu.",
      },
      {
        status: 503,
      },
    );
  }

  const response = NextResponse.redirect(
    signed.signedUrl,
    {
      status: 302,
    },
  );

  response.headers.set("Cache-Control", "no-store");

  return response;
}