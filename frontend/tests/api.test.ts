import { describe, it, expect, vi, beforeEach, afterAll, beforeAll } from "vitest";
import { api, API_URL } from "../src/api";

import makeFetchCookie from "fetch-cookie";

// Check if running in live mode
const IS_LIVE = process.env.TEST_LIVE === "true";

if (!IS_LIVE) {
    // Mock global fetch only if NOT in live mode
    globalThis.fetch = vi.fn();
} else {
    // Wrap fetch with cookie jar for live mode
    const fetchCookie = makeFetchCookie(globalThis.fetch);
    globalThis.fetch = fetchCookie as any;
}

describe("API Client", () => {
    // Unique user for live testing
    const uniqueId = Math.random().toString(36).substring(7);
    const testUser = `frontend_test_${uniqueId}@example.com`;
    const testPass = "password123";

    const waitForHealth = async (retries = 10, delay = 5000) => {
        for (let i = 0; i < retries; i++) {
            try {
                const res = await api.health();
                if (res.ok === true) return;
            } catch (e) {
                console.log(`Waiting for backend... (${i + 1}/${retries})`);
            }
            await new Promise((r) => setTimeout(r, delay));
        }
        throw new Error("Backend not ready after multiple retries");
    };

    beforeAll(async () => {
        if (IS_LIVE) {
            // Wait for backend to be ready (handle cold starts)
            await waitForHealth(12, 5000); // Wait up to 60s
        }
    }, 70000);

    beforeEach(() => {
        if (!IS_LIVE) {
            vi.resetAllMocks();
        }
    });

    afterAll(async () => {
        if (IS_LIVE) {
            // Cleanup: Delete the test user
            try {
                // Assuming api.deleteUser exists or will be implemented
                // This call might fail if the user wasn't successfully created or already deleted
                await api.deleteUser(testUser, testPass);
                console.log(`Cleaned up user: ${testUser}`);
            } catch (e) {
                console.error("Failed to cleanup user", e);
            }
        }
    });

    it("should call health endpoint", async () => {
        if (!IS_LIVE) {
            const mockResponse = { ok: true, db_status: "connected" };
            (globalThis.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockResponse,
            });
        }

        const res = await api.health();

        if (!IS_LIVE) {
            expect(globalThis.fetch).toHaveBeenCalledWith(`${API_URL}/health`);
            expect(res).toEqual({ ok: true, db_status: "connected" });
        } else {
            // Live assertion
            expect(res.ok).toBe(true);
            expect(res.db_status).toBeDefined();
        }
    });

    it("should register a user", async () => {
        if (!IS_LIVE) {
            const mockResponse = { ok: true, message: "Registered" };
            (globalThis.fetch as any).mockResolvedValue({
                json: async () => mockResponse,
            });
        }

        const res = await api.register(testUser, testPass);

        if (!IS_LIVE) {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                `${API_URL}/register`,
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ user: testUser, pass: testPass }),
                })
            );
            expect(res).toEqual({ ok: true, message: "Registered" });
        } else {
            expect(res.ok).toBe(true);
        }
    });

    it("should login a user", async () => {
        if (!IS_LIVE) {
            const mockResponse = { ok: true, message: "Logged in" };
            (globalThis.fetch as any).mockResolvedValue({
                json: async () => mockResponse,
            });
        }

        const res = await api.login(testUser, testPass);

        if (!IS_LIVE) {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                `${API_URL}/login`,
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ user: testUser, pass: testPass }),
                })
            );
            expect(res).toEqual({ ok: true, message: "Logged in" });
        } else {
            expect(res.ok).toBe(true);
        }
    });

    it("should sync game data", async () => {
        // For live test, we need to ensure data exists (register/login handled above)
        // But since tests run in parallel or sequence, we rely on previous steps or default state

        if (!IS_LIVE) {
            const mockData = {
                location: { room: "Start", x: 0, y: 0 },
                notebook: {},
                access: {},
                npc: [],
            };
            (globalThis.fetch as any).mockResolvedValue({
                ok: true,
                json: async () => mockData,
            });
        } else {
            // In live mode, we might need to create initial save first if it doesn't exist
            // The backend creates default save on update if missing, but sync might 404
            // Let's try to save first to be safe
            await api.saveGame({
                location: { room: "Start", x: 0, y: 0 },
                notebook: {},
                access: {},
                npc: []
            });
        }

        const res = await api.syncGame();

        if (!IS_LIVE) {
            expect(globalThis.fetch).toHaveBeenCalledWith(`${API_URL}/game/sync`);
            expect(res).toEqual({
                location: { room: "Start", x: 0, y: 0 },
                notebook: {},
                access: {},
                npc: [],
            });
        } else {
            expect(res.location).toBeDefined();
            expect(res.location.room).toBe("Start");
        }
    });

    it("should update game state", async () => {
        if (!IS_LIVE) {
            const mockResponse = { ok: true };
            (globalThis.fetch as any).mockResolvedValue({
                json: async () => mockResponse,
            });
        }

        const res = await api.updateGame("location", { x: 10, y: 10 });

        if (!IS_LIVE) {
            expect(globalThis.fetch).toHaveBeenCalledWith(
                `${API_URL}/game/update`,
                expect.objectContaining({
                    method: "PUT",
                    body: JSON.stringify({ type: "location", msg: { x: 10, y: 10 } }),
                })
            );
            expect(res).toEqual({ ok: true });
        } else {
            expect(res.ok).toBe(true);
        }
    });
});
