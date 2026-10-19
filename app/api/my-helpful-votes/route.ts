import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

function parseJwt(token: string): { sub?: string; id?: string; email?: string } | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized", data: [] },
        { status: 401 }
      );
    }

    const payload = parseJwt(token);
    const userId = payload?.sub || payload?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Invalid token payload", data: [] },
        { status: 401 }
      );
    }

    const res = await pool.query(
      `SELECT review_id FROM review_helpful_votes WHERE user_id = $1`,
      [userId]
    );

    const voteIds = res.rows.map((r: { review_id: string }) => r.review_id);

    return NextResponse.json({
      success: true,
      message: "Berhasil mengambil daftar vote helpful",
      data: voteIds,
    });
  } catch (error: any) {
    console.error("Error fetching my helpful votes:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error", data: [] },
      { status: 500 }
    );
  }
}
