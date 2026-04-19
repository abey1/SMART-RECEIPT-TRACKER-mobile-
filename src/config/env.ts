/**
 * Set these in a root `.env` file (EXPO_PUBLIC_*) or replace defaults for production.
 * Google: https://docs.expo.dev/guides/google-authentication/
 * Facebook: create an app at developers.facebook.com and add the app ID here.
 */
export const env = {
  googleExpoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID ?? '',
  googleIosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  googleAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '',
  /** Placeholder backend URL for receipt uploads */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.example.com',
};

/** Google OAuth needs at least a Web client ID for Expo Auth Session (see Expo Google auth guide). */
export function isGoogleOAuthConfigured(): boolean {
  return Boolean(env.googleWebClientId);
}

export function isFacebookOAuthConfigured(): boolean {
  return Boolean(env.facebookAppId);
}
