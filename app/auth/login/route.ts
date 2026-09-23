import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email atau password salah", statusCode: 401 },
        { status: 401 }
      );
    }

    const lowerEmail = email.toLowerCase().trim();

    // Mock validation: accept valid credentials
    // If password is less than 6 chars, reject
    if (password.length < 6) {
      return NextResponse.json(
        { message: "Email atau password salah", statusCode: 401 },
        { status: 401 }
      );
    }

    const namePart = lowerEmail.split("@")[0] || "User";
    const formattedName = namePart
      .split(/[._-]/)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const user = {
      id: "76157bdb-1804-4752-83ae-80ab3fb699df",
      name: formattedName || "Budi Customer",
      email: lowerEmail,
      status: "ACTIVE"
    };

    const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ id: user.id, email: user.email })
    )}.mock_signature`;

    return NextResponse.json(
      {
        message: "Login berhasil",
        user,
        accessToken
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
