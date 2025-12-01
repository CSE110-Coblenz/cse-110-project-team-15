export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
    async health(): Promise<{ status: string; db_status: string }> {
        const res = await fetch(`${API_URL}/health`);
        if (!res.ok) throw new Error("Health check failed");
        return res.json();
    },

    async register(user: string, pass: string): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, pass }),
        });
        return res.json();
    },

    async login(user: string, pass: string): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, pass }),
        });
        return res.json();
    },

    async saveGame(data: any): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/game/save`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async syncGame(): Promise<SyncResponse> {
        const res = await fetch(`${API_URL}/game/sync`);
        if (!res.ok) throw new Error("Failed to sync game");
        return res.json();
    },

    async updateGame(type: string, msg: any, id?: string): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/game/update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, msg, id }),
        });
        return res.json();
    },

    async deleteUser(user: string, pass: string): Promise<ApiResponse> {
        const res = await fetch(`${API_URL}/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user, pass }),
        });
        return res.json();
    },
};
