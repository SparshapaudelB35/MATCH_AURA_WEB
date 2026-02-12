import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params?.id || req.url.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing user id" },
        { status: 400 }
      );
    }
    const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
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
      { success: false, message: error.message || "Failed to delete user" },
      { status: 502 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params?.id || req.url.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing user id" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
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
      { success: false, message: error.message || "Failed to fetch user" },
      { status: 502 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = params?.id || req.url.split("/").pop();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing user id" },
        { status: 400 }
      );
    }

    const incoming = await req.formData();
    const formData = new FormData();
    for (const [key, value] of incoming.entries()) {
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (typeof value === "string" && value.trim() !== "") {
        formData.append(key, value);
      }
    }

    const res = await fetch(`${BASE_URL}/api/admin/users/${id}`, {
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
      { success: false, message: error.message || "Failed to update user" },
      { status: 502 }
    );
  }
}
