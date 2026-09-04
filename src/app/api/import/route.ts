import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseCsvText } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  let text = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    text = await (file as File).text();
  } else {
    const body = await req.json().catch(() => null);
    text = body?.csv || body?.text || "";
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "CSV 내용이 비어 있습니다." }, { status: 400 });
  }

  const rows = parseCsvText(text);
  if (rows.length === 0) {
    return NextResponse.json(
      { error: "가져올 행이 없습니다. 헤더(이름 등)를 확인해 주세요." },
      { status: 400 }
    );
  }

  const result = await prisma.customer.createMany({ data: rows });
  return NextResponse.json({ imported: result.count });
}
