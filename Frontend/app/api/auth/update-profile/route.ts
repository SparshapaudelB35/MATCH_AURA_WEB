import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export async function PUT(req: Request) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const incoming = await req.formData();
    const formData = new FormData();
    for (const [key, value] of incoming.entries()) {
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (typeof value === "string") {
        formData.append(key, value);
      }
    }

    const res = await fetch(`${BASE_URL}/api/auth/update-profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      cache: "no-store",
    });

    const raw = await res.text();
    let data: any = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = { success: res.ok, message: raw };
      }
    }
    if (!data) {
      data = { success: res.ok, message: res.statusText || "No response body" };
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: Error | any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile" },
      { status: 502 }
    );
  }
}
