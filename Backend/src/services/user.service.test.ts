const mockRepo = {
  getUserByEmail: jest.fn(),
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  getUserById: jest.fn(),
  getDiscoverUsers: jest.fn(),
  recordSwipe: jest.fn(),
  getUsersByIds: jest.fn(),
  getUserByResetPasswordToken: jest.fn(),
  clearResetPasswordToken: jest.fn(),
};

const mockEmail = {
  sendPasswordResetEmail: jest.fn(),
};

jest.mock("../repositories/user.repository", () => ({
  UserRepository: jest.fn(() => mockRepo),
}));

jest.mock("./email.service", () => ({
  EmailService: jest.fn(() => mockEmail),
}));

jest.mock("bcryptjs", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(async (v: string) => `hashed-${v}`),
    compare: jest.fn(async (a: string, b: string) => a === b || b === `hashed-${a}`),
  },
}));

jest.mock("jsonwebtoken", () => ({
  __esModule: true,
  default: {
    sign: jest.fn(() => "jwt-token"),
  },
}));

jest.mock("../models/message.model", () => ({
  MessageModel: {
    find: jest.fn(() => ({ sort: jest.fn(async () => [{ content: "hello" }]) })),
    create: jest.fn(async (d: unknown) => d),
  },
}));

jest.mock("crypto", () => ({
  __esModule: true,
  default: {
    randomBytes: jest.fn(() => ({ toString: () => "rawtoken" })),
    createHash: jest.fn(() => ({
      update: jest.fn(() => ({
        digest: jest.fn(() => "hashed-token"),
      })),
    })),
  },
}));

import { HttpError } from "../errors/http-error";
import { UserService } from "./user.service";

describe("UserService (24 tests)", () => {
  const service = new UserService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createUser hashes password and creates user", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    mockRepo.getUserByUsername.mockResolvedValue(null);
    mockRepo.createUser.mockResolvedValue({ _id: "1" });
    const res = await service.createUser({
      username: "u1",
      email: "u1@example.com",
      password: "secret12",
      confirmPassword: "secret12",
    } as any);
    expect(res).toEqual({ _id: "1" });
    expect(mockRepo.createUser).toHaveBeenCalled();
  });

  test("createUser throws for duplicate email", async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: "x" });
    await expect(
      service.createUser({
        username: "u1",
        email: "u1@example.com",
        password: "secret12",
        confirmPassword: "secret12",
      } as any)
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("createUser throws for duplicate username", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    mockRepo.getUserByUsername.mockResolvedValue({ _id: "x" });
    await expect(
      service.createUser({
        username: "u1",
        email: "u1@example.com",
        password: "secret12",
        confirmPassword: "secret12",
      } as any)
    ).rejects.toBeInstanceOf(HttpError);
  });

  test("loginUser throws when user missing", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    await expect(service.loginUser({ email: "a@b.com", password: "secret12" })).rejects.toBeInstanceOf(HttpError);
  });

  test("loginUser throws for bad password", async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ password: "hashed-else", email: "a@b.com" });
    await expect(service.loginUser({ email: "a@b.com", password: "secret12" })).rejects.toBeInstanceOf(HttpError);
  });

  test("loginUser succeeds with valid password", async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: "1", email: "a@b.com", username: "u", password: "hashed-secret12", role: "user" });
    const out = await service.loginUser({ email: "a@b.com", password: "secret12" });
    expect(out.token).toBe("jwt-token");
  });

  test("getUserById returns user", async () => {
    mockRepo.getUserById.mockResolvedValue({ _id: "1" });
    const out = await service.getUserById("1");
    expect(out).toEqual({ _id: "1" });
  });

  test("getUserById throws when missing", async () => {
    mockRepo.getUserById.mockResolvedValue(null);
    await expect(service.getUserById("1")).rejects.toBeInstanceOf(HttpError);
  });

  test("getDiscoverUsers proxies repository", async () => {
    mockRepo.getDiscoverUsers.mockResolvedValue([{ _id: "2" }]);
    const out = await service.getDiscoverUsers("1", "female");
    expect(out).toEqual([{ _id: "2" }]);
  });

  test("recordSwipe blocks self-swipe", async () => {
    await expect(service.recordSwipe("1", "1", "like")).rejects.toBeInstanceOf(HttpError);
  });

  test("recordSwipe throws if target missing", async () => {
    mockRepo.getUserById.mockResolvedValue(null);
    await expect(service.recordSwipe("1", "2", "like")).rejects.toBeInstanceOf(HttpError);
  });

  test("recordSwipe like mutual adds matches", async () => {
    mockRepo.getUserById
      .mockResolvedValueOnce({ _id: "2" })
      .mockResolvedValueOnce({ _id: "1", matchedUsers: [], likedUsers: [] })
      .mockResolvedValueOnce({ _id: "2", matchedUsers: [], likedUsers: ["1"] });
    await service.recordSwipe("1", "2", "like");
    expect(mockRepo.updateUser).toHaveBeenCalledTimes(2);
  });

  test("recordSwipe dislike removes matches", async () => {
    mockRepo.getUserById
      .mockResolvedValueOnce({ _id: "2" })
      .mockResolvedValueOnce({ _id: "1", matchedUsers: ["2"] })
      .mockResolvedValueOnce({ _id: "2", matchedUsers: ["1"] });
    await service.recordSwipe("1", "2", "dislike");
    expect(mockRepo.updateUser).toHaveBeenCalledTimes(2);
  });

  test("getMatches throws when user missing", async () => {
    mockRepo.getUserById.mockResolvedValue(null);
    await expect(service.getMatches("1")).rejects.toBeInstanceOf(HttpError);
  });

  test("getMatches resolves users by ids", async () => {
    mockRepo.getUserById.mockResolvedValue({ matchedUsers: ["2"] });
    mockRepo.getUsersByIds.mockResolvedValue([{ _id: "2" }]);
    const out = await service.getMatches("1");
    expect(out).toEqual([{ _id: "2" }]);
  });

  test("getMessages blocks unmatched users", async () => {
    mockRepo.getUserById.mockResolvedValue({ matchedUsers: [] });
    await expect(service.getMessages("1", "2")).rejects.toBeInstanceOf(HttpError);
  });

  test("getMessages returns sorted chat", async () => {
    mockRepo.getUserById.mockResolvedValue({ matchedUsers: ["2"] });
    const out = await service.getMessages("1", "2");
    expect(out).toEqual([{ content: "hello" }]);
  });

  test("sendMessage blocks unmatched users", async () => {
    mockRepo.getUserById.mockResolvedValue({ matchedUsers: [] });
    await expect(service.sendMessage("1", "2", "hi")).rejects.toBeInstanceOf(HttpError);
  });

  test("sendMessage throws if receiver missing", async () => {
    mockRepo.getUserById
      .mockResolvedValueOnce({ matchedUsers: ["2"] })
      .mockResolvedValueOnce(null);
    await expect(service.sendMessage("1", "2", "hi")).rejects.toBeInstanceOf(HttpError);
  });

  test("sendMessage creates message", async () => {
    mockRepo.getUserById
      .mockResolvedValueOnce({ matchedUsers: ["2"] })
      .mockResolvedValueOnce({ _id: "2" });
    const out = await service.sendMessage("1", "2", "hi");
    expect(out).toMatchObject({ content: "hi" });
  });

  test("forgotPassword no-op for unknown email", async () => {
    mockRepo.getUserByEmail.mockResolvedValue(null);
    await service.forgotPassword("x@y.com");
    expect(mockEmail.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  test("forgotPassword stores token and sends email", async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: "1", email: "x@y.com" });
    mockRepo.updateUser.mockResolvedValue({ _id: "1" });
    mockEmail.sendPasswordResetEmail.mockResolvedValue(undefined);
    await service.forgotPassword("x@y.com");
    expect(mockRepo.updateUser).toHaveBeenCalled();
    expect(mockEmail.sendPasswordResetEmail).toHaveBeenCalled();
  });

  test("forgotPassword clears token on email send failure", async () => {
    mockRepo.getUserByEmail.mockResolvedValue({ _id: "1", email: "x@y.com" });
    mockEmail.sendPasswordResetEmail.mockRejectedValue(new Error("fail"));
    await expect(service.forgotPassword("x@y.com")).rejects.toBeInstanceOf(HttpError);
    expect(mockRepo.clearResetPasswordToken).toHaveBeenCalledWith("1");
  });

  test("resetPassword throws on invalid token", async () => {
    mockRepo.getUserByResetPasswordToken.mockResolvedValue(null);
    await expect(service.resetPassword("tok", "newpass1")).rejects.toBeInstanceOf(HttpError);
  });
});
