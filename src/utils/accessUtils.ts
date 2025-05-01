
// Constants related to access control
export const MAX_ATTEMPTS = 5;
export const BLOCK_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Checks if access is currently blocked
 */
export const checkIfBlocked = (): { blocked: boolean; blockTimeLeft: number | null } => {
  // Check if there's a block in localStorage
  const blockUntil = localStorage.getItem("blockUntil");
  
  if (!blockUntil) {
    return { blocked: false, blockTimeLeft: null };
  }
  
  const blockTime = parseInt(blockUntil, 10);
  const now = Date.now();
  
  if (blockTime > now) {
    // Still blocked
    return { blocked: true, blockTimeLeft: blockTime - now };
  } else {
    // Block has expired
    localStorage.removeItem("blockUntil");
    localStorage.removeItem("accessAttempts");
    return { blocked: false, blockTimeLeft: null };
  }
};

/**
 * Load saved access attempts from localStorage
 */
export const loadAttempts = (): number => {
  const saved = localStorage.getItem("accessAttempts");
  return saved ? parseInt(saved, 10) : 0;
};

/**
 * Save access attempts to localStorage
 */
export const saveAttempts = (attempts: number): void => {
  localStorage.setItem("accessAttempts", attempts.toString());
};

/**
 * Check if 2FA is enabled and verified
 */
export const get2FAStatus = (): { enabled: boolean; verified: boolean } => {
  return {
    enabled: localStorage.getItem("2fa_enabled") === "true",
    verified: localStorage.getItem("2fa_verified") === "true"
  };
};
