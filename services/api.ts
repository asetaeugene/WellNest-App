// Vite env type fix for TypeScript
interface ImportMeta {
    env: {
        VITE_API_BASE?: string;
        [key: string]: any;
    };
}
import { JournalEntry, User, EmotionAnalysis } from '../types';
// Frontend API service for WellNest
// Improvements: HTTPS, error handling, input sanitization, comments

// Use HTTPS in production. Replace with your deployed backend URL.
// Automatically use the correct API base depending on environment
const API_BASE =
    import.meta.env.VITE_API_BASE
        ? import.meta.env.VITE_API_BASE
        : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:5000/api'
            : 'https://your-production-backend-url.com/api';

// --- Auth Endpoints ---
export const apiLogin = async (email: string, pass: string): Promise<{ token: string, user: User }> => {
    // Basic input sanitization
    const safeEmail = email.trim().toLowerCase();
    const safePass = pass.trim();
    const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: safeEmail, pass: safePass })
    });
    if (!res.ok) {
        let errorMsg = 'Login failed';
        try { errorMsg = (await res.json()).error || errorMsg; } catch {}
        throw new Error(errorMsg);
    }
    return res.json();
};

export const apiSignup = async (email: string, pass: string, name: string): Promise<{ token: string, user: User }> => {
    // Basic input sanitization
    const safeEmail = email.trim().toLowerCase();
    const safePass = pass.trim();
    const safeName = name.trim();
    const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: safeEmail, pass: safePass, name: safeName })
    });
    if (!res.ok) {
        let errorMsg = 'Signup failed';
        try { errorMsg = (await res.json()).error || errorMsg; } catch {}
        throw new Error(errorMsg);
    }
    return res.json();
};

export const apiGetUserFromToken = async (token: string): Promise<User | null> => {
    const res = await fetch(`${API_BASE}/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.status === 401) return null;
    if (!res.ok) {
        let errorMsg = 'Failed to get user';
        try { errorMsg = (await res.json()).error || errorMsg; } catch {}
        throw new Error(errorMsg);
    }
    return res.json();
};

export const apiUpdateUser = async (token: string, updatedUserData: Partial<User>): Promise<User> => {
    // Sanitize user data
    const safeData: Partial<User> = {};
    if (updatedUserData.name) safeData.name = updatedUserData.name.trim();
    if (updatedUserData.email) safeData.email = updatedUserData.email.trim().toLowerCase();
    if (updatedUserData.profilePicture) safeData.profilePicture = updatedUserData.profilePicture.trim();
    if (updatedUserData.isPremium !== undefined) safeData.isPremium = updatedUserData.isPremium;
    const res = await fetch(`${API_BASE}/user`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(safeData)
    });
    if (!res.ok) {
        let errorMsg = 'Failed to update user';
        try { errorMsg = (await res.json()).error || errorMsg; } catch {}
        throw new Error(errorMsg);
    }
    return res.json();
};

// --- Journal Endpoints ---
export const apiGetJournalEntries = async (token: string): Promise<JournalEntry[]> => {
    const res = await fetch(`${API_BASE}/journal`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        let errorMsg = 'Failed to get journal entries';
        try { errorMsg = (await res.json()).error || errorMsg; } catch {}
        throw new Error(errorMsg);
    }
    return res.json();
};

export const apiAddJournalEntry = async (token: string, content: string, analysis: EmotionAnalysis): Promise<JournalEntry> => {
    // Sanitize input
    const safeContent = content.trim();
    const res = await fetch(`${API_BASE}/journal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: safeContent, analysis })
    });
    if (!res.ok) {
        let errorMsg = 'Failed to add journal entry';
        try { errorMsg = (await res.json()).error || errorMsg; } catch {}
        throw new Error(errorMsg);
    }
    return res.json();
};

// --- AI Analysis Endpoint ---
export const apiAnalyzeEntry = async (text: string, token: string): Promise<EmotionAnalysis> => {
    // Sanitize input
    const safeText = text.trim();
    const res = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: safeText })
    });
    if (!res.ok) {
        let errorMsg = 'Failed to analyze entry';
        try { errorMsg = (await res.json()).error || errorMsg; } catch {}
        throw new Error(errorMsg);
    }
    const data = await res.json();
    // If your backend returns { gemini_response: ... }, adapt as needed
    return data.gemini_response || data;
};

// --- Payment Endpoint ---
export const apiInitiatePayment = async (token: string): Promise<{ checkout_url: string }> => {
    const res = await fetch(`${API_BASE}/payment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        let errorMsg = 'Failed to initiate payment';
        try { errorMsg = (await res.json()).error || errorMsg; } catch {}
        throw new Error(errorMsg);
    }
    return res.json();
};