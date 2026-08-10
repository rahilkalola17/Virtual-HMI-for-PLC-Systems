// Utility helpers used across the app (non-UI).
// - `fetcher`: thin `up-fetch` wrapper for API calls
// - `cn`: small helper to merge Tailwind/conditional classnames
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { up } from "up-fetch";

// `fetcher` is an `up-fetch` instance preconfigured with the HMI API base URL
// (central place to change the API host). Only headers and baseUrl are set here.
export const fetcher = up(fetch, () => ({
  baseUrl: " http://192.168.75.129:5000",
  headers: {
    "Content-Type": "application/json",
  },
}));

// `cn` combines `clsx` (conditional classes) with `twMerge` (dedupe/merge Tailwind classes)
// Use this to create safe className strings across components.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// legacy local dev host notes:
// http://192.168.75.129:5000
// http://192.168.0.7:8080/