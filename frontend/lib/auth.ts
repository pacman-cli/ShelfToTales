import { User } from "./types";

const STORAGE_KEY = "shelf-to-tales-auth";

interface StoredAuth {
  user: User;
  token: string;
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeAuth(user: User, token: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function mockLogin(
  email: string,
  password: string
): { user: User; token: string } | null {
  if (password.length < 6) return null;
  const user: User = {
    id: btoa(email),
    email,
    name: email.split("@")[0],
  };
  const token = `mock-jwt-${Date.now()}`;
  return { user, token };
}

export function mockRegister(
  name: string,
  email: string,
  password: string
): { user: User; token: string } | null {
  if (password.length < 6) return null;
  const user: User = {
    id: btoa(email),
    email,
    name,
  };
  const token = `mock-jwt-${Date.now()}`;
  return { user, token };
}
