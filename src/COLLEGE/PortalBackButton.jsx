import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

const PortalNavigationContext = createContext(null);

const createEmptyHistory = () => ({
  public: [],
  student: [],
  faculty: [],
  hod: [],
  admin: [],
});

function getPortalForPath(pathname) {
  if (["/student", "/student-dashboard", "/student-signup"].includes(pathname)) {
    return "student";
  }

  if (pathname === "/faculty") {
    return "faculty";
  }

  if (pathname === "/hod" || pathname.startsWith("/hod/") || pathname === "/hod-profile") {
    return "hod";
  }

  if (pathname === "/admin") {
    return "admin";
  }

  return "public";
}

export function PortalNavigationProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [history, setHistory] = useState(createEmptyHistory);
  const previousLocation = useRef(null);
  const skipNextHistoryEntry = useRef(false);

  useEffect(() => {
    const currentLocation = {
      pathname: location.pathname,
      portal: getPortalForPath(location.pathname),
    };
    const previous = previousLocation.current;
    previousLocation.current = currentLocation;

    if (!previous || previous.pathname === currentLocation.pathname) {
      return;
    }

    if (skipNextHistoryEntry.current) {
      skipNextHistoryEntry.current = false;
      return;
    }

    setHistory((currentHistory) => {
      const nextHistory = { ...currentHistory };

      if (navigationType === "POP") {
        if (previous.portal === currentLocation.portal) {
          const stack = currentHistory[currentLocation.portal];
          if (stack[stack.length - 1] === currentLocation.pathname) {
            nextHistory[currentLocation.portal] = stack.slice(0, -1);
          }
        } else if (previous.portal !== "public") {
          nextHistory[previous.portal] = [];
        }
      } else if (previous.portal === currentLocation.portal) {
        nextHistory[previous.portal] = [...currentHistory[previous.portal], previous.pathname];
      } else if (currentLocation.portal !== "public" && previous.pathname === "/role") {
        nextHistory[currentLocation.portal] = [...currentHistory[currentLocation.portal], previous.pathname];
      } else {
        if (previous.portal !== "public") {
          nextHistory[previous.portal] = [];
        }

        if (currentLocation.portal !== "public") {
          nextHistory[currentLocation.portal] = [];
        }
      }

      return nextHistory;
    });
  }, [location.pathname, navigationType]);

  const goBack = useCallback((portal, fallbackTo) => {
    const portalHistory = history[portal] ?? [];
    const hasHistory = portalHistory.length > 0;
    const target = hasHistory ? portalHistory[portalHistory.length - 1] : fallbackTo;

    setHistory((currentHistory) => ({
      ...currentHistory,
      [portal]: currentHistory[portal].slice(0, -1),
    }));

    if (target !== location.pathname) {
      skipNextHistoryEntry.current = true;
      if (hasHistory) {
        navigate(-1);
      } else {
        navigate(target, { replace: true });
      }
    }
  }, [history, location.pathname, navigate]);

  return (
    <PortalNavigationContext.Provider value={{ goBack, history }}>
      {children}
    </PortalNavigationContext.Provider>
  );
}

function PortalBackButton({
  role,
  fallbackTo,
  onBack,
  show,
  className = "",
}) {
  const location = useLocation();
  const navigation = useContext(PortalNavigationContext);

  if (!onBack && !navigation) {
    throw new Error("PortalBackButton must be used inside PortalNavigationProvider.");
  }

  const hasRouteHistory = Boolean(role && navigation?.history[role]?.length);
  const isVisible = show ?? (
    hasRouteHistory || (fallbackTo && fallbackTo !== location.pathname)
  );

  if (!isVisible) {
    return null;
  }

  const handleBack = () => {
    if (onBack) {
      const handled = onBack();
      if (handled !== false) {
        return;
      }
    }

    navigation.goBack(role, fallbackTo);
  };

  return (
    <button
      className={`portal-back-button ${className}`.trim()}
      type="button"
      onClick={handleBack}
      aria-label="Go back"
    >
      <span aria-hidden="true">←</span>
      <span>Back</span>
    </button>
  );
}

export default PortalBackButton;
