import { NextResponse } from "next/server";
import { getDraft } from "@/lib/draft-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get("id");

    if (!draftId) {
      return NextResponse.json({ error: "Missing draft id" }, { status: 400 });
    }

    const draft = await getDraft(draftId);

    if (!draft) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      status: draft.status, // "pending" | "confirmed" | "expired"
      draftId: draft.id,
      fullName: draft.full_name,
      email: draft.email,
      tierName: draft.tier_name,
      amount: draft.amount,
      quantity: draft.quantity,
    });
  } catch (err: unknown) {
    console.error("[draft-status] Error:", err);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
