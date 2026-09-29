/**
 * Helper utilities for public profile URL detection and manipulation.
 * Supports:
 * - Query params: ?player=nickname, ?u=nickname, ?user=nickname
 * - Pathnames: /u/:nickname, /profile/:nickname, /player/:nickname
 * - Hash routes: #/u/:nickname, #?player=nickname
 */

export function getProfileNicknameFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check query parameters (?player=xxx, ?u=xxx, ?user=xxx)
  const searchParams = new URLSearchParams(window.location.search);
  const queryParam = searchParams.get('player') || searchParams.get('u') || searchParams.get('user');
  if (queryParam && queryParam.trim()) {
    return queryParam.trim();
  }

  // 2. Check pathname (/u/xxx, /profile/xxx, /player/xxx)
  const pathname = window.location.pathname;
  const match = pathname.match(/^\/(?:u|profile|player)\/([^/?#]+)/i);
  if (match && match[1]) {
    try {
      const decoded = decodeURIComponent(match[1]).trim();
      if (decoded) return decoded;
    } catch {
      return match[1].trim();
    }
  }

  // 3. Check hash (#/u/xxx, #?player=xxx)
  const hash = window.location.hash;
  if (hash) {
    const hashPathMatch = hash.match(/#\/?(?:u|profile|player)\/([^/?#]+)/i);
    if (hashPathMatch && hashPathMatch[1]) {
      try {
        return decodeURIComponent(hashPathMatch[1]).trim();
      } catch {
        return hashPathMatch[1].trim();
      }
    }
    const hashQueryMatch = hash.match(/[?&](?:player|u|user)=([^&#]+)/i);
    if (hashQueryMatch && hashQueryMatch[1]) {
      try {
        return decodeURIComponent(hashQueryMatch[1]).trim();
      } catch {
        return hashQueryMatch[1].trim();
      }
    }
  }

  return null;
}

export function buildProfileUrl(nickname: string): string {
  if (typeof window === 'undefined') return `/u/${encodeURIComponent(nickname)}`;
  return `${window.location.origin}/u/${encodeURIComponent(nickname)}`;
}
