import { NextResponse } from "next/server";

// Simple in-memory user registry for demonstration API
const registeredUsers = new Map<string, any>([
  [
    "budi@katamereka.id",
    {
      id: "76157bdb-1804-4752-83ae-80ab3fb699df",
      name: "Budi Customer",
      email: "budi@katamereka.id",
      password: "password123",
      status: "ACTIVE",
      role: "USER"
    }
  ]
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan password wajib diisi", statusCode: 400 },
        { status: 400 }
      );
    }

    const lowerEmail = email.toLowerCase().trim();

    if (registeredUsers.has(lowerEmail)) {
      return NextResponse.json(
        { message: "Email sudah terdaftar", statusCode: 409 },
        { status: 409 }
      );
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name || lowerEmail.split("@")[0],
      email: lowerEmail,
      password: password,
      status: "ACTIVE",
      role: "USER"
    };

    registeredUsers.set(lowerEmail, newUser);

    const accessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({ id: newUser.id, email: newUser.email })
    )}.mock_signature`;

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          status: newUser.status
        },
        accessToken
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server", statusCode: 500 },
      { status: 500 }
    );
  }
}
