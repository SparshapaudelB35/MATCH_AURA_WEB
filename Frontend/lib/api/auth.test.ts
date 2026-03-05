import {
  fetchDiscoverUsers,
  fetchWhoAmI,
  forgotPassword,
  loginUser,
  registerUser,
  resetPassword,
  updateProfile,
} from "./auth";
import { API } from "./endpoints";

jest.mock("./axios", () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

import axios from "./axios";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Frontend lib/api/auth (18 tests)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("registerUser returns response data", async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    await expect(registerUser({})).resolves.toEqual({ success: true });
    expect(mockedAxios.post).toHaveBeenCalledWith(API.AUTH.REGISTER, {});
  });

  test("registerUser throws readable error", async () => {
    mockedAxios.post.mockRejectedValue({ response: { data: { message: "bad register" } } });
    await expect(registerUser({})).rejects.toThrow("bad register");
  });

  test("loginUser returns response data", async () => {
    mockedAxios.post.mockResolvedValue({ data: { token: "t" } });
    await expect(loginUser({})).resolves.toEqual({ token: "t" });
  });

  test("loginUser throws readable error", async () => {
    mockedAxios.post.mockRejectedValue({ response: { data: { message: "bad login" } } });
    await expect(loginUser({})).rejects.toThrow("bad login");
  });

  test("forgotPassword posts payload", async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    await forgotPassword({ email: "a@b.com" });
    expect(mockedAxios.post).toHaveBeenCalledWith(API.AUTH.FORGOTPASSWORD, { email: "a@b.com" });
  });

  test("forgotPassword throws fallback error", async () => {
    mockedAxios.post.mockRejectedValue(new Error("net"));
    await expect(forgotPassword({ email: "a@b.com" })).rejects.toThrow("net");
  });

  test("resetPassword posts payload", async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true } });
    await resetPassword({ token: "t", password: "p", confirmPassword: "p" });
    expect(mockedAxios.post).toHaveBeenCalledWith(API.AUTH.RESETPASSWORD, { token: "t", password: "p", confirmPassword: "p" });
  });

  test("resetPassword throws readable error", async () => {
    mockedAxios.post.mockRejectedValue({ response: { data: { message: "bad reset" } } });
    await expect(resetPassword({ token: "t", password: "p", confirmPassword: "p" })).rejects.toThrow("bad reset");
  });

  test("fetchWhoAmI returns data", async () => {
    mockedAxios.get.mockResolvedValue({ data: { id: "1" } });
    await expect(fetchWhoAmI()).resolves.toEqual({ id: "1" });
    expect(mockedAxios.get).toHaveBeenCalledWith(API.AUTH.WHOAMI);
  });

  test("fetchWhoAmI throws readable error", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "unauthorized" } } });
    await expect(fetchWhoAmI()).rejects.toThrow("unauthorized");
  });

  test("fetchDiscoverUsers with targetGender sends params", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchDiscoverUsers("female");
    expect(mockedAxios.get).toHaveBeenCalledWith(API.AUTH.DISCOVER, { params: { targetGender: "female" } });
  });

  test("fetchDiscoverUsers without targetGender omits params", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchDiscoverUsers();
    expect(mockedAxios.get).toHaveBeenCalledWith(API.AUTH.DISCOVER, { params: undefined });
  });

  test("fetchDiscoverUsers throws readable error", async () => {
    mockedAxios.get.mockRejectedValue({ response: { data: { message: "bad discover" } } });
    await expect(fetchDiscoverUsers()).rejects.toThrow("bad discover");
  });

  test("updateProfile sends multipart header", async () => {
    const fd = new FormData();
    mockedAxios.put.mockResolvedValue({ data: { success: true } });
    await updateProfile(fd);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      API.AUTH.UPDATEPROFILE,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  });

  test("updateProfile throws readable error", async () => {
    mockedAxios.put.mockRejectedValue({ response: { data: { message: "bad update" } } });
    await expect(updateProfile(new FormData())).rejects.toThrow("bad update");
  });

  test("registerUser falls back to generic error message", async () => {
    mockedAxios.post.mockRejectedValue({});
    await expect(registerUser({})).rejects.toThrow("Registration failed");
  });

  test("loginUser falls back to generic error message", async () => {
    mockedAxios.post.mockRejectedValue({});
    await expect(loginUser({})).rejects.toThrow("Login failed");
  });

  test("updateProfile falls back to generic error message", async () => {
    mockedAxios.put.mockRejectedValue({});
    await expect(updateProfile(new FormData())).rejects.toThrow("Update profile failed");
  });
});
