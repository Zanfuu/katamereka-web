import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized access token required", statusCode: 401 },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: "Berhasil mengambil daftar user/customer/admin",
        data: [
          {
            id: "76157bdb-1804-4752-83ae-80ab3fb699df",
            name: "Budi Customer",
            email: "budi@katamereka.id",
            role: "USER",
            status: "ACTIVE"
          }
        ]
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server", statusCode: 500 },
      { status: 500 }
    );
  }
}
