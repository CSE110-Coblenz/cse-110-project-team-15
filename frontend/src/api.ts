// Runtime config from env-config.js (Docker) or build-time env (Local)
const runtimeUrl = (window as any).env?.VITE_API_URL;
export const API_URL = (runtimeUrl || import.meta.env.VITE_API_URL);
console.log("API_URL configured as:", API_URL);

export interface ApiResponse {
    ok: boolean;
    message?: string;
}

export interface SyncResponse {
    location: { room: string; x: number; y: number };
    notebook: Record<string, any>;
    access: Record<string, any>;
    npc: Array<{ id: string; state: Record<string, any> }>;
}

export const api = {
    async health(): Promise<{ ok: boolean; db_status: string }> {
        const res = await fetch(`${API_URL}/health`, { credentials: "include" });
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
    },

    async register(user: string, pass: string): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, pass }),
            credentials: "include",
        });
        return res.json();
    },

    async login(user: string, pass: string): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, pass }),
            credentials: "include",
        });
        return res.json();
    },

    async saveGame(data: any): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/game/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include",
        });
        return res.json();
    },

    async syncGame(): Promise<SyncResponse | null> {
        const res = await fetch(`${API_URL}/game/sync`, { credentials: "include" });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to sync game");
        return res.json();
    },

    async updateGame(type: string, msg: any, id?: string): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/game/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, msg, id }),
            credentials: "include",
        });
        return res.json();
    },

    async deleteUser(user: string, pass: string): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, pass }),
            credentials: "include",
        });
        return res.json();
    },

    async logout(): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/logout`, {
            method: "POST",
            credentials: "include",
        });
        return res.json();
    },
};
