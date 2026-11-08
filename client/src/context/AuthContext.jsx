
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentSession,
  onAuthStateChange,
  logoutUser,
  getUserRoles,
} from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUserRoles = async (userId) => {
    try {
      const userRoles = await getUserRoles(userId);
      setRoles(userRoles);
    } catch (error) {
      console.error("Role loading error:", error);
      setRoles([]);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentSession = await getCurrentSession();

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);

          if (currentSession?.user?.id) {
            await loadUserRoles(currentSession.user.id);
          }
        }
      } catch (error) {
        console.error(
          "Authentication initialization error:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const subscription = onAuthStateChange(
      async (_event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user?.id) {
          await loadUserRoles(currentSession.user.id);
        } else {
          setRoles([]);
        }

        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();

    setUser(null);
    setSession(null);
    setRoles([]);
  }, []);

  const hasRole = useCallback(
    (...allowedRoles) =>
      allowedRoles.some((role) => roles.includes(role)),
    [roles]
  );

  const value = {
    user,
    session,
    roles,
    loading,
    isAuthenticated: Boolean(user),
    hasRole,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};
