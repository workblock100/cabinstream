import {
  siNetflix,
  siHbomax,
  siAppletv,
  siParamountplus,
  siCrunchyroll,
  siTiktok,
  siTubi,
  siPlex,
  siYoutube,
  siTwitch,
  siSpotify,
  siYoutubemusic,
  siApplemusic,
  siSoundcloud,
} from "simple-icons";

export interface BrandIcon {
  path: string;
}

/**
 * Official simple-icons glyphs, keyed by the service `slug`.
 * Brands NOT in this map (Disney+, Prime Video, Hulu, Peacock, Pluto TV, ESPN —
 * removed from simple-icons) fall back to a styled wordmark in <ServiceLogo>.
 */
export const SERVICE_ICONS: Record<string, BrandIcon> = {
  netflix: siNetflix,
  hbomax: siHbomax,
  appletv: siAppletv,
  paramountplus: siParamountplus,
  crunchyroll: siCrunchyroll,
  tiktok: siTiktok,
  tubi: siTubi,
  plex: siPlex,
  youtube: siYoutube,
  twitch: siTwitch,
  spotify: siSpotify,
  youtubemusic: siYoutubemusic,
  applemusic: siApplemusic,
  soundcloud: siSoundcloud,
};
