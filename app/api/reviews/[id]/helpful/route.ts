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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await context.params;
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const payload = parseJwt(token);
    const userId = payload?.sub || payload?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Token autentikasi tidak valid" },
        { status: 401 }
      );
    }

    // 1. Fetch review with business info
    const revRes = await pool.query(
      `SELECT r.*, b.name as business_name, b.id as b_id
       FROM reviews r
       LEFT JOIN businesses b ON b.id = r.business_id
       WHERE r.id = $1`,
      [reviewId]
    );

    if (revRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Ulasan tidak ditemukan" },
        { status: 404 }
      );
    }

    const review = revRes.rows[0];

    // 2. Prevent self-voting
    if (review.user_id === userId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak dapat menandai ulasan milik sendiri" },
        { status: 400 }
      );
    }

    // 3. Check existing vote
    const voteCheck = await pool.query(
      `SELECT id FROM review_helpful_votes WHERE review_id = $1 AND user_id = $2`,
      [reviewId, userId]
    );

    const businessName = review.business_name || "Bisnis";
    const businessId = review.business_id || review.b_id;
    const reviewTitle = review.title || review.content?.slice(0, 40) || "Ulasan";

    if (voteCheck.rows.length > 0) {
      // ── DELETE VOTE (UNHELPFUL) ──
      await pool.query(
        `DELETE FROM review_helpful_votes WHERE review_id = $1 AND user_id = $2`,
        [reviewId, userId]
      );

      const updateRes = await pool.query(
        `UPDATE reviews 
         SET helpful_count = GREATEST(0, COALESCE(helpful_count, 1) - 1),
             updated_at = NOW()
         WHERE id = $1
         RETURNING helpful_count`,
        [reviewId]
      );

      const finalCount = updateRes.rows[0]?.helpful_count ?? 0;

      // Log to customer_logs
      await pool.query(
        `INSERT INTO customer_logs (id, user_id, action_type, data, created_at)
         VALUES (
           gen_random_uuid(),
           $1,
           'DELETE',
           $2,
           NOW()
         )`,
        [
          userId,
          JSON.stringify({
            action: "UNHELPFUL_REVIEW",
            reviewId,
            reviewTitle,
            businessId,
            businessName,
          }),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Vote helpful berhasil dihapus",
        isHelpful: false,
        helpfulCount: finalCount,
        helpful_count: finalCount,
      });
    } else {
      // ── ADD VOTE (HELPFUL) ──
      await pool.query(
        `INSERT INTO review_helpful_votes (id, review_id, user_id, created_at)
         VALUES (gen_random_uuid(), $1, $2, NOW())`,
        [reviewId, userId]
      );

      const updateRes = await pool.query(
        `UPDATE reviews 
         SET helpful_count = COALESCE(helpful_count, 0) + 1,
             updated_at = NOW()
         WHERE id = $1
         RETURNING helpful_count`,
        [reviewId]
      );

      const finalCount = updateRes.rows[0]?.helpful_count ?? 1;

      // Log to customer_logs
      await pool.query(
        `INSERT INTO customer_logs (id, user_id, action_type, data, created_at)
         VALUES (
           gen_random_uuid(),
           $1,
           'CREATE',
           $2,
           NOW()
         )`,
        [
          userId,
          JSON.stringify({
            action: "HELPFUL_REVIEW",
            reviewId,
            reviewTitle,
            businessId,
            businessName,
          }),
        ]
      );

      return NextResponse.json({
        success: true,
        message: "Vote helpful berhasil ditambahkan",
        isHelpful: true,
        helpfulCount: finalCount,
        helpful_count: finalCount,
      });
    }
  } catch (error: any) {
    console.error("Error toggling review helpful:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
