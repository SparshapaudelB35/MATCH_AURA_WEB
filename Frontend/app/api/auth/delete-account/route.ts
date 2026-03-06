import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export async function DELETE() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const res = await fetch(`${BASE_URL}/api/auth/delete-account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
      { success: false, message: error.message || "Failed to delete account" },
      { status: 502 }
    );
  }
}
