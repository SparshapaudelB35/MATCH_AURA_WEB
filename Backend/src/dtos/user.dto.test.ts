import {
  CreateUserDTO,
  ForgotPasswordDTO,
  LoginUserDTO,
  ResetPasswordDTO,
} from "./user.dto";

describe("Backend DTO validation (14 tests)", () => {
  const createCases = [
    [{ username: "u1", email: "u1@example.com", password: "secret12", confirmPassword: "secret12" }, true],
    [{ username: "u2", email: "u2@example.com", password: "secret12", confirmPassword: "secret13" }, false],
    [{ username: "u3", email: "bad", password: "secret12", confirmPassword: "secret12" }, false],
    [{ email: "u4@example.com", password: "secret12", confirmPassword: "secret12" }, false],
  ] as const;

  test.each(createCases)("CreateUserDTO %j", (payload, ok) => {
    expect(CreateUserDTO.safeParse(payload).success).toBe(ok);
  });

  const loginCases = [
    [{ email: "a@example.com", password: "secret12" }, true],
    [{ email: "bad", password: "secret12" }, false],
    [{ email: "a@example.com", password: "123" }, false],
  ] as const;

  test.each(loginCases)("LoginUserDTO %j", (payload, ok) => {
    expect(LoginUserDTO.safeParse(payload).success).toBe(ok);
  });

  const forgotCases = [
    [{ email: "reset@example.com" }, true],
    [{ email: "bad" }, false],
    [{}, false],
  ] as const;

  test.each(forgotCases)("ForgotPasswordDTO %j", (payload, ok) => {
    expect(ForgotPasswordDTO.safeParse(payload).success).toBe(ok);
  });

  const resetCases = [
    [{ token: "t1", password: "newpass1", confirmPassword: "newpass1" }, true],
    [{ token: "t2", password: "newpass1", confirmPassword: "newpass2" }, false],
    [{ token: "", password: "newpass1", confirmPassword: "newpass1" }, false],
    [{ password: "newpass1", confirmPassword: "newpass1" }, false],
  ] as const;

  test.each(resetCases)("ResetPasswordDTO %j", (payload, ok) => {
    expect(ResetPasswordDTO.safeParse(payload).success).toBe(ok);
  });
});
