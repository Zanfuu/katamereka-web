import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      const res = await pool.query(`
        SELECT category, COUNT(*)::int as count 
        FROM businesses 
        WHERE category IS NOT NULL AND TRIM(category) != '' 
        GROUP BY category 
        ORDER BY count DESC, category ASC
      `);
      return NextResponse.json({
        success: true,
        data: res.rows.map((r) => ({
          category: r.category,
          count: r.count,
        })),
        categories: res.rows.map((r) => r.category),
      });
    }

    const res = await pool.query(
      "SELECT id, category, categories FROM businesses WHERE id = $1 LIMIT 1",
      [businessId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Bisnis tidak ditemukan" },
        { status: 404 }
      );
    }

    const row = res.rows[0];
    const rawCategories = row.categories;
    let categories: string[] = [];

    if (rawCategories) {
      if (Array.isArray(rawCategories)) {
        categories = rawCategories;
      } else if (typeof rawCategories === "string") {
        categories = rawCategories
          .split(",")
          .map((c: string) => c.trim())
          .filter(Boolean);
      }
    }

    return NextResponse.json({
      success: true,
      category: row.category,
      categories,
    });
  } catch (err: any) {
    console.error("GET /api/business/categories error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, categories, category } = body;

    if (!businessId) {
      return NextResponse.json(
        { success: false, message: "Parameter businessId diperlukan" },
        { status: 400 }
      );
    }

    let catString: string | null = null;
    if (Array.isArray(categories) && categories.length > 0) {
      catString = categories
        .map((c) => String(c).trim())
        .filter(Boolean)
        .join(",");
    }

    if (category) {
      await pool.query(
        "UPDATE businesses SET categories = $1, category = $2, updated_at = NOW() WHERE id = $3",
        [catString, category, businessId]
      );
    } else {
      await pool.query(
        "UPDATE businesses SET categories = $1, updated_at = NOW() WHERE id = $2",
        [catString, businessId]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kategori bisnis berhasil diperbarui di database",
      categories: catString ? catString.split(",") : [],
    });
  } catch (err: any) {
    console.error("POST /api/business/categories error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
