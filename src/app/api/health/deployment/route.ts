import { NextResponse } from "next/server";
import { getDeploymentReadiness } from "@/lib/deployment/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = getDeploymentReadiness();

  return NextResponse.json(
    {
      ok: readiness.productionReady,
      checkedAt: new Date().toISOString(),
      ...readiness,
    },
    {
      status: readiness.productionReady ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
