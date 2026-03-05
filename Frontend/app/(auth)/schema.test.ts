import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./schema";

describe("Frontend schema validation (20 tests)", () => {
  const loginCases = [
    [{ email: "user@example.com", password: "secret12" }, true],
    [{ email: "bad", password: "secret12" }, false],
    [{ email: "user@example.com", password: "123" }, false],
    [{ password: "secret12" }, false],
    [{ email: "user@example.com" }, false],
  ] as const;

  test.each(loginCases)("loginSchema %j", (payload, ok) => {
    expect(loginSchema.safeParse(payload).success).toBe(ok);
  });

  const registerCases = [
    [{ name: "John Doe", email: "john@example.com", password: "secret12", confirmPassword: "secret12" }, true],
    [{ name: "J", email: "john@example.com", password: "secret12", confirmPassword: "secret12" }, false],
    [{ name: "John", email: "bad", password: "secret12", confirmPassword: "secret12" }, false],
    [{ name: "John", email: "john@example.com", password: "secret12", confirmPassword: "secret13" }, false],
    [{ name: "John", email: "john@example.com", password: "123", confirmPassword: "123" }, false],
    [{ email: "john@example.com", password: "secret12", confirmPassword: "secret12" }, false],
    [{ name: "John", password: "secret12", confirmPassword: "secret12" }, false],
    [{ name: "John", email: "john@example.com", confirmPassword: "secret12" }, false],
  ] as const;

  test.each(registerCases)("registerSchema %j", (payload, ok) => {
    expect(registerSchema.safeParse(payload).success).toBe(ok);
  });

  const forgotCases = [
    [{ email: "reset@example.com" }, true],
    [{ email: "bad" }, false],
    [{}, false],
    [{ email: "" }, false],
  ] as const;

  test.each(forgotCases)("forgotPasswordSchema %j", (payload, ok) => {
    expect(forgotPasswordSchema.safeParse(payload).success).toBe(ok);
  });

  const resetCases = [
    [{ password: "secret12", confirmPassword: "secret12" }, true],
    [{ password: "secret12", confirmPassword: "secret13" }, false],
    [{ password: "123", confirmPassword: "123" }, false],
  ] as const;

  test.each(resetCases)("resetPasswordSchema %j", (payload, ok) => {
    expect(resetPasswordSchema.safeParse(payload).success).toBe(ok);
  });
});
