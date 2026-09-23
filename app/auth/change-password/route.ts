import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized token missing", statusCode: 401 },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { message: "Password baru minimal 6 karakter", statusCode: 400 },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Password berhasil diperbarui" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server", statusCode: 500 },
      { status: 500 }
    );
  }
}
