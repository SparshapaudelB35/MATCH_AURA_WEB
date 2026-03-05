jest.mock("@/lib/api/auth", () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(),
  fetchWhoAmI: jest.fn(),
  fetchDiscoverUsers: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  updateProfile: jest.fn(),
}));

jest.mock("@/lib/cookie", () => ({
  setAuthToken: jest.fn(),
  setUserData: jest.fn(),
  clearAuthCookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((to: string) => to),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

import {
  handleDiscoverUsers,
  handleForgotPassword,
  handleLogin,
  handleRegister,
  handleResetPassword,
  handleUpdateProfile,
  handleWhoAmI,
} from "./auth-action";
import * as authApi from "@/lib/api/auth";
import * as cookie from "@/lib/cookie";
import { revalidatePath } from "next/cache";

describe("Frontend lib/actions/auth-action (12 tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("handleRegister maps name and returns success", async () => {
    (authApi.registerUser as jest.Mock).mockResolvedValue({ success: true, data: { id: "1" } });
    const out = await handleRegister({ name: "John Doe", email: "john@example.com", password: "secret12", confirmPassword: "secret12" });
    expect(out.success).toBe(true);
    expect(authApi.registerUser).toHaveBeenCalledWith(expect.objectContaining({ firstName: "John", lastName: "Doe", username: "John Doe" }));
  });

  test("handleRegister returns failure on thrown error", async () => {
    (authApi.registerUser as jest.Mock).mockRejectedValue(new Error("fail"));
    const out = await handleRegister({ name: "John Doe", email: "john@example.com", password: "secret12", confirmPassword: "secret12" });
    expect(out.success).toBe(false);
  });

  test("handleLogin stores cookies on success", async () => {
    (authApi.loginUser as jest.Mock).mockResolvedValue({ success: true, token: "t", data: { id: "1" } });
    const out = await handleLogin({ email: "john@example.com", password: "secret12" });
    expect(out.success).toBe(true);
    expect(cookie.setAuthToken).toHaveBeenCalledWith("t");
    expect(cookie.setUserData).toHaveBeenCalledWith({ id: "1" });
  });

  test("handleLogin returns failure when API rejects", async () => {
    (authApi.loginUser as jest.Mock).mockRejectedValue(new Error("bad"));
    const out = await handleLogin({ email: "john@example.com", password: "secret12" });
    expect(out.success).toBe(false);
  });

  test("handleWhoAmI returns mapped success", async () => {
    (authApi.fetchWhoAmI as jest.Mock).mockResolvedValue({ success: true, data: { id: "1" } });
    const out = await handleWhoAmI();
    expect(out.success).toBe(true);
  });

  test("handleWhoAmI handles errors", async () => {
    (authApi.fetchWhoAmI as jest.Mock).mockRejectedValue(new Error("err"));
    const out = await handleWhoAmI();
    expect(out.success).toBe(false);
  });

  test("handleForgotPassword returns success response", async () => {
    (authApi.forgotPassword as jest.Mock).mockResolvedValue({ success: true, message: "sent" });
    const out = await handleForgotPassword({ email: "john@example.com" });
    expect(out).toEqual({ success: true, message: "sent" });
  });

  test("handleForgotPassword handles thrown errors", async () => {
    (authApi.forgotPassword as jest.Mock).mockRejectedValue(new Error("x"));
    const out = await handleForgotPassword({ email: "john@example.com" });
    expect(out.success).toBe(false);
  });

  test("handleResetPassword passes token and passwords", async () => {
    (authApi.resetPassword as jest.Mock).mockResolvedValue({ success: true, message: "ok" });
    const out = await handleResetPassword("tok", { password: "secret12", confirmPassword: "secret12" });
    expect(out.success).toBe(true);
    expect(authApi.resetPassword).toHaveBeenCalledWith({ token: "tok", password: "secret12", confirmPassword: "secret12" });
  });

  test("handleDiscoverUsers returns empty array on failure", async () => {
    (authApi.fetchDiscoverUsers as jest.Mock).mockRejectedValue(new Error("x"));
    const out = await handleDiscoverUsers("female");
    expect(out.success).toBe(false);
    expect(out.data).toEqual([]);
  });

  test("handleUpdateProfile sets user data and revalidates paths on success", async () => {
    (authApi.updateProfile as jest.Mock).mockResolvedValue({ success: true, data: { id: "1" } });
    const out = await handleUpdateProfile(new FormData());
    expect(out.success).toBe(true);
    expect(cookie.setUserData).toHaveBeenCalledWith({ id: "1" });
    expect(revalidatePath).toHaveBeenCalledWith("/auth/profile");
    expect(revalidatePath).toHaveBeenCalledWith("/auth/dashboard");
  });

  test("handleUpdateProfile returns failure on rejected call", async () => {
    (authApi.updateProfile as jest.Mock).mockRejectedValue(new Error("bad"));
    const out = await handleUpdateProfile(new FormData());
    expect(out.success).toBe(false);
  });
});
