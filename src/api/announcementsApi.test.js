import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announcementsApi } from "./announcementsApi";

const socketMocks = vi.hoisted(() => ({
  io: vi.fn(),
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

vi.mock("socket.io-client", () => ({ io: socketMocks.io }));

describe("announcement update subscriptions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    socketMocks.socket.on.mockReset();
    socketMocks.socket.off.mockReset();
    socketMocks.socket.connect.mockReset();
    socketMocks.socket.disconnect.mockReset();
    socketMocks.socket.on.mockReturnValue(socketMocks.socket);
    socketMocks.socket.off.mockReturnValue(socketMocks.socket);
    socketMocks.io.mockReturnValue(socketMocks.socket);
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("authenticates the socket, refreshes periodically, and disconnects cleanly", () => {
    const onChange = vi.fn();
    const onError = vi.fn();
    sessionStorage.setItem("edulentraToken", "signed-session-token");

    const unsubscribe = announcementsApi.subscribeToAnnouncementUpdates(
      onChange,
      onError
    );

    expect(socketMocks.io).toHaveBeenCalledWith(
      expect.any(String),
      {
        autoConnect: false,
        auth: { token: "signed-session-token" },
      }
    );
    expect(socketMocks.socket.on).toHaveBeenCalledWith(
      "announcements:changed",
      onChange
    );
    expect(socketMocks.socket.on).toHaveBeenCalledWith(
      "connect_error",
      onError
    );
    expect(socketMocks.socket.connect).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(60_000);
    expect(onChange).toHaveBeenCalledOnce();

    unsubscribe();
    expect(socketMocks.socket.off).toHaveBeenCalledWith(
      "announcements:changed",
      onChange
    );
    expect(socketMocks.socket.disconnect).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(60_000);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("reports missing authentication without opening a socket", () => {
    const onError = vi.fn();

    announcementsApi.subscribeToAnnouncementUpdates(vi.fn(), onError);

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Authentication is required for live announcement updates.",
      })
    );
    expect(socketMocks.io).not.toHaveBeenCalled();
  });
});
