const mockService = {
  createUser: jest.fn(),
  loginUser: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  getUserById: jest.fn(),
  getDiscoverUsers: jest.fn(),
  getMatches: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
  recordSwipe: jest.fn(),
  updateUser: jest.fn(),
};

jest.mock("../services/user.service", () => ({
  UserService: jest.fn(() => mockService),
}));

import { AuthController } from "./auth.controller";

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("AuthController (12 tests)", () => {
  const controller = new AuthController();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("register returns 400 for invalid payload", async () => {
    const req: any = { body: { email: "bad" } };
    const res = mockRes();
    await controller.register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("register returns 201 on success", async () => {
    mockService.createUser.mockResolvedValue({ _id: "1" });
    const req: any = { body: { username: "u", email: "u@e.com", password: "secret12", confirmPassword: "secret12" } };
    const res = mockRes();
    await controller.register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("login returns 400 for invalid body", async () => {
    const req: any = { body: { email: "bad" } };
    const res = mockRes();
    await controller.login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("login returns 200 for valid credentials", async () => {
    mockService.loginUser.mockResolvedValue({ token: "t", user: { _id: "1" } });
    const req: any = { body: { email: "u@e.com", password: "secret12" } };
    const res = mockRes();
    await controller.login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("forgotPassword returns 400 for invalid email", async () => {
    const req: any = { body: { email: "bad" } };
    const res = mockRes();
    await controller.forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("forgotPassword returns 200 for valid email", async () => {
    const req: any = { body: { email: "u@e.com" } };
    const res = mockRes();
    await controller.forgotPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("resetPassword returns 400 for invalid body", async () => {
    const req: any = { body: { token: "", password: "a", confirmPassword: "b" } };
    const res = mockRes();
    await controller.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("resetPassword returns 200 for valid body", async () => {
    const req: any = { body: { token: "tok", password: "secret12", confirmPassword: "secret12" } };
    const res = mockRes();
    await controller.resetPassword(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("getProfile returns 400 when req.user is missing", async () => {
    const req: any = {};
    const res = mockRes();
    await controller.getProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("getProfile returns 200 with user data", async () => {
    mockService.getUserById.mockResolvedValue({ _id: "1" });
    const req: any = { user: { _id: "1" } };
    const res = mockRes();
    await controller.getProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("swipeUser returns 400 when user missing", async () => {
    const req: any = { body: { targetUserId: "2", action: "like" } };
    const res = mockRes();
    await controller.swipeUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("swipeUser returns 200 for valid request", async () => {
    const req: any = { user: { _id: "1" }, body: { targetUserId: "2", action: "like" } };
    const res = mockRes();
    await controller.swipeUser(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
