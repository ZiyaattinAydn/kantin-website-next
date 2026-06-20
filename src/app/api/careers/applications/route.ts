import { NextRequest, NextResponse } from "next/server";
import {
  CAREER_MAX_REQUEST_BYTES,
  hashRequestSignal,
  validateCareerApplicationForm,
} from "@/lib/careers/validation";
import { STORAGE_BUCKETS } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
} as const;

type BeginRow = {
  session_id: string;
  upload_token: string;
  object_path: string;
  expires_at: string;
};

type CompleteRow = {
  application_id: string;
  receipt_token: string;
};

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE_HEADERS });
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    const originHost = new URL(origin).host.toLowerCase();
    const forwardedHost = request.headers.get("x-forwarded-host")?.toLowerCase();
    const host = request.headers.get("host")?.toLowerCase();
    return originHost === forwardedHost || originHost === host;
  } catch {
    return false;
  }
}

function firstForwardedIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;
  return request.headers.get("x-real-ip")?.trim() || null;
}

function publicErrorFromRpc(message: string | undefined): {
  status: number;
  message: string;
} {
  switch (message) {
    case "duplicate_submission":
      return {
        status: 429,
        message: "Bu bilgilerle kısa süre içinde bir başvuru zaten gönderilmiş.",
      };
    case "too_many_attempts":
    case "rate_limited":
      return {
        status: 429,
        message: "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.",
      };
    case "temporarily_unavailable":
      return {
        status: 503,
        message: "Başvuru sistemi şu anda yoğun. Lütfen kısa süre sonra tekrar deneyin.",
      };
    case "upload_session_expired":
      return {
        status: 408,
        message: "Dosya yükleme süresi doldu. Lütfen formu yeniden gönderin.",
      };
    default:
      return {
        status: 400,
        message: "Başvuru bilgileri doğrulanamadı. Alanları kontrol edip tekrar deneyin.",
      };
  }
}

async function cancelSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
  uploadToken: string,
) {
  await supabase.rpc("cancel_job_application", {
    p_session_id: sessionId,
    p_upload_token: uploadToken,
  });
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return json({ ok: false, message: "Geçersiz istek kaynağı." }, 403);
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > CAREER_MAX_REQUEST_BYTES) {
    return json({ ok: false, field: "cv", message: "İstek boyutu çok büyük." }, 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return json({ ok: false, message: "Form verisi okunamadı." }, 400);
  }

  const validation = await validateCareerApplicationForm(formData);
  if (!validation.ok) {
    return json(
      { ok: false, field: validation.field, message: validation.message },
      validation.message === "Başvuru gönderilemedi." ? 400 : 422,
    );
  }

  const input = validation.data;
  const sourceIpHash = hashRequestSignal(firstForwardedIp(request), "ip");
  const userAgentHash = hashRequestSignal(request.headers.get("user-agent"), "ua");
  const supabase = await createClient();

  const { data: beginData, error: beginError } = await supabase.rpc(
    "begin_job_application",
    {
      p_full_name: input.fullName,
      p_phone: input.phone,
      p_email: input.email,
      p_branch_slug: input.branchSlug,
      p_department: input.department,
      p_employment_type: input.employmentType,
      p_shift_preference: input.shiftPreference,
      p_availability_days: input.availabilityDays,
      p_experience: input.experience,
      p_introduction: input.introduction,
      p_consent_given: input.consentGiven,
      p_cv_mime_type: input.cv.type,
      p_cv_size_bytes: input.cv.size,
      p_cv_extension: input.cvExtension,
      p_source_ip_hash: sourceIpHash,
      p_user_agent_hash: userAgentHash,
    },
  );

  const beginRow = (beginData?.[0] ?? null) as BeginRow | null;
  if (beginError || !beginRow) {
    const safeError = publicErrorFromRpc(beginError?.message);
    console.error("[careers] begin_job_application failed", {
      code: beginError?.code,
      message: beginError?.message,
    });
    return json({ ok: false, message: safeError.message }, safeError.status);
  }

  const fileBytes = new Uint8Array(await input.cv.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.careerCvs)
    .upload(beginRow.object_path, fileBytes, {
      contentType: input.cv.type,
      cacheControl: "0",
      upsert: false,
    });

  if (uploadError) {
    await cancelSession(supabase, beginRow.session_id, beginRow.upload_token);
    console.error("[careers] CV upload failed", {
      status: uploadError.statusCode,
      message: uploadError.message,
    });
    return json(
      {
        ok: false,
        field: "cv",
        message: "CV yüklenemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.",
      },
      502,
    );
  }

  const { data: completeData, error: completeError } = await supabase.rpc(
    "complete_job_application",
    {
      p_session_id: beginRow.session_id,
      p_upload_token: beginRow.upload_token,
    },
  );

  const completeRow = (completeData?.[0] ?? null) as CompleteRow | null;
  if (completeError || !completeRow) {
    await supabase.storage
      .from(STORAGE_BUCKETS.careerCvs)
      .remove([beginRow.object_path]);
    await cancelSession(supabase, beginRow.session_id, beginRow.upload_token);

    const safeError = publicErrorFromRpc(completeError?.message);
    console.error("[careers] complete_job_application failed", {
      code: completeError?.code,
      message: completeError?.message,
    });
    return json(
      {
        ok: false,
        message:
          safeError.status === 408
            ? safeError.message
            : "Başvuru kaydedilemedi. Lütfen tekrar deneyin.",
      },
      safeError.status === 408 ? 408 : 502,
    );
  }

  return json({
    ok: true,
    message: "Başvurunuz başarıyla alındı.",
    reference: completeRow.application_id.slice(0, 8).toUpperCase(),
  });
}
