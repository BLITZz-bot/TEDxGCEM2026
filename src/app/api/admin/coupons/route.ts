// Copyright (c) 2026 M M BHARATH — TEDxGCEM. All rights reserved.
// Proprietary and confidential. Unauthorized copying, modification, or
// distribution of this file is strictly prohibited. See LICENSE for details.

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCoupon, deleteCoupon, generateRandomCouponCode, getAllCoupons } from "@/lib/coupon-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminEmail = process.env.ADMIN_EMAIL || "";
    if (!user?.email || user.email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const coupons = await getAllCoupons();
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Admin coupons GET error:", error);
    return NextResponse.json({ error: "Failed to load coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminEmail = process.env.ADMIN_EMAIL || "";
    if (!user?.email || user.email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { customCode, discountAmount, durationMinutes, autoGenerate } = body;

    let codeToUse = customCode ? customCode.trim().toUpperCase() : "";
    if (autoGenerate || !codeToUse) {
      codeToUse = generateRandomCouponCode("TEDX");
    }

    const duration = typeof durationMinutes === "number" && durationMinutes > 0 ? durationMinutes : 10;
    const discount = typeof discountAmount === "number" && discountAmount > 0 ? discountAmount : 100;

    const newCoupon = await createCoupon(codeToUse, discount, duration);
    const updatedCoupons = await getAllCoupons();

    return NextResponse.json({ success: true, coupon: newCoupon, coupons: updatedCoupons });
  } catch (error) {
    console.error("Admin coupon creation error:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const adminEmail = process.env.ADMIN_EMAIL || "";
    if (!user?.email || user.email.toLowerCase() !== adminEmail.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const couponId = searchParams.get("id");

    if (!couponId) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await deleteCoupon(couponId);
    const updatedCoupons = await getAllCoupons();

    return NextResponse.json({ success: true, coupons: updatedCoupons });
  } catch (error) {
    console.error("Admin coupon deletion error:", error);
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
