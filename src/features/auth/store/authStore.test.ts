import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "../types";

vi.mock("../services/authService", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
  DEMO_CREDENTIALS: { email: "demo@example.com", password: "demo1234" },
}));

const { authService } = await import("../services/authService");
const { useAuthStore } = await import("./authStore");

const loginMock = vi.mocked(authService.login);
const registerMock = vi.mocked(authService.register);
const logoutMock = vi.mocked(authService.logout);

const mockUser: User = {
  id: "usr_1",
  name: "Demo User",
  email: "demo@example.com",
  role: "admin",
  avatarUrl: null,
};

// Snapshot the store's initial state (including actions) before any test mutates it,
// so it can be restored wholesale between tests without losing login/register/logout.
const initialState = useAuthStore.getState();

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState(initialState, true);
    window.localStorage.clear();
    loginMock.mockReset();
    registerMock.mockReset();
    logoutMock.mockReset();
  });

  it("sets the user and authenticated status on a successful login", async () => {
    loginMock.mockResolvedValueOnce({ user: mockUser });

    await useAuthStore.getState().login({ email: mockUser.email, password: "demo1234" });

    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user).toEqual(mockUser);
    expect(state.error).toBeNull();
  });

  it("sets status to error and records a message when login fails", async () => {
    loginMock.mockRejectedValueOnce(new Error("Email and password are required."));

    await expect(
      useAuthStore.getState().login({ email: "", password: "" }),
    ).rejects.toThrow("Email and password are required.");

    const state = useAuthStore.getState();
    expect(state.status).toBe("error");
    expect(state.error).toBe("Email and password are required.");
    expect(state.user).toBeNull();
  });

  it("sets the user and authenticated status on successful registration", async () => {
    registerMock.mockResolvedValueOnce({ user: mockUser });

    await useAuthStore.getState().register({ name: mockUser.name, email: mockUser.email, password: "demo1234" });

    const state = useAuthStore.getState();
    expect(state.status).toBe("authenticated");
    expect(state.user).toEqual(mockUser);
  });

  it("clears the user on logout even though the token itself is an HttpOnly cookie", async () => {
    loginMock.mockResolvedValueOnce({ user: mockUser });
    await useAuthStore.getState().login({ email: mockUser.email, password: "demo1234" });

    logoutMock.mockResolvedValueOnce(undefined);
    await useAuthStore.getState().logout();

    expect(logoutMock).toHaveBeenCalledTimes(1);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.status).toBe("idle");
  });

  it("clears the error via clearError", async () => {
    loginMock.mockRejectedValueOnce(new Error("boom"));
    await expect(useAuthStore.getState().login({ email: "", password: "" })).rejects.toThrow();
    expect(useAuthStore.getState().error).toBeTruthy();

    useAuthStore.getState().clearError();
    expect(useAuthStore.getState().error).toBeNull();
  });
});
