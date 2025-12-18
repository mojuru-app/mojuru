// Utility functions for identifying and filtering plugin repositories.
// Includes helpers to check if a URL belongs to a specific repo or a blacklist.

type RepoTuple = [string, string];

/**
 * check if is from a specific hostname
 */
export const isFromHostname = (url: string, ...hostnames: string[]): boolean => {
  try {
    const parsed = new URL(url);
    return hostnames.includes(parsed.hostname);
  } catch {
    return false;
  }
};

/**
 * check if is from a specific repo
 */
export const isFromRepo = (url: string, expectedUser: string, expectedRepo: string): boolean => {
  try {
    const parsed = new URL(url);
    if (isFromHostname(url, 'raw.githubusercontent.com', 'git.luna-app.eu')) {
      const pathParts = parsed.pathname.split('/');
      const [, user, repo] = pathParts;
      return user === expectedUser && repo === expectedRepo;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * match partial anywhere in the repo
 */
export const isFromRepoPartial = (url: string, partial: string): boolean => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'raw.githubusercontent.com') {
      const pathParts = parsed.pathname.split('/');
      const [, user, repo] = pathParts;
      return user.includes(partial) || repo.includes(partial);
    }
    return false;
  } catch {
    return false;
  }
};

import { PLUGIN_REPO_BLACKLIST_URL } from '@/constants/Utils';
import axios from 'axios';

interface BlacklistEntry {
  host: string;
  path: string[];
  reason: string;
}

/**
 * fetch the remote blacklist
 * @throws error if fetch fails
 */
const fetchBlacklist = async (): Promise<BlacklistEntry[]> => {
  try {
    const response = await axios.get<BlacklistEntry[]>(PLUGIN_REPO_BLACKLIST_URL);
    return response.data;
  } catch (err) {
    throw new Error(
      `Couldn't validate plugin, please check your internet connection and try again.`
    );
  }
};

/**
 * check if a given URL is blacklisted
 * @throws error if blacklist cannot be fetched
 */
export const isBlacklistedRepo = async (url: string): Promise<boolean> => {
  let blacklist: BlacklistEntry[];
  try {
    blacklist = await fetchBlacklist();
  } catch {
    // https requests failed, can't validate whether the plugin is valid or not
    throw "Couldn't validate plugin, please check your internet connection and try again.";
  }

  const parsed = new URL(url);

  const matched = blacklist.some(entry => {
    if (parsed.hostname !== entry.host) return false;

    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length < entry.path.length) return false;

    for (let i = 0; i < entry.path.length; i++) {
      if (pathParts[i] !== entry.path[i]) return false;
    }

    return true;
  });

  if (matched) {
    // plugin repo is blacklisted
    throw 'The plugin you tried to load comes from a blacklisted source and has been blocked.';
  }

  return false;
};

