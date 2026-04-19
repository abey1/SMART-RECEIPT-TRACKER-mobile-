import type { AuthProvider, User } from '../types';

async function fetchGoogleProfile(accessToken: string): Promise<{
  email: string;
  name: string;
  id: string;
}> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error('Failed to load Google profile');
  }
  const data = (await res.json()) as {
    id: string;
    email: string;
    name: string;
  };
  return { email: data.email, name: data.name, id: data.id };
}

async function fetchFacebookProfile(accessToken: string): Promise<{
  email: string;
  name: string;
  id: string;
}> {
  const url = `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load Facebook profile');
  }
  const data = (await res.json()) as {
    id: string;
    name: string;
    email?: string;
  };
  return {
    id: data.id,
    name: data.name,
    email: data.email ?? `${data.id}@facebook.placeholder`,
  };
}

export async function buildUserFromOAuth(
  provider: AuthProvider,
  accessToken: string | undefined
): Promise<User> {
  if (!accessToken) {
    throw new Error('Missing access token');
  }
  if (provider === 'google') {
    const p = await fetchGoogleProfile(accessToken);
    return {
      id: `google:${p.id}`,
      email: p.email,
      name: p.name,
      provider: 'google',
    };
  }
  const p = await fetchFacebookProfile(accessToken);
  return {
    id: `facebook:${p.id}`,
    email: p.email,
    name: p.name,
    provider: 'facebook',
  };
}
