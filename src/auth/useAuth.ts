// Re-export the useAuth hook so feature code has one canonical import path.
// Downstream: `import { useAuth } from '@/auth/useAuth'`.
export { useAuth } from './AuthProvider';
export type { AuthState, AuthUser } from './AuthProvider';
