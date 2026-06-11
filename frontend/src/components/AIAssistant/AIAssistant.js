import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useTenant } from "../../contexts/TenantContext";
import { usePublicDarkTheme } from "../../contexts/PublicDarkThemeContext";
import { publicApi } from "../../services/api";
import {
  saveListing,
  unsaveListing,
  checkIfSaved,
} from "../../services/savedListingsApi";
import { getMediaUrl } from "../../utils/media";
import ListingCard from "../Listings/ListingCard";
import ListingDetailModal from "../Listings/ListingDetailModal";
import Logo from "../Common/Logo";
import { toast } from "react-hot-toast";
import {
  FiMessageSquare,
  FiSend,
  FiX,
  FiRefreshCw,
  FiShare2,
  FiHeart,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
  FiCalendar,
  FiMapPin,
  FiGrid,
  FiPlus,
  FiArrowLeft,
  FiActivity,
  FiSearch,
  FiTrash2,
  FiEdit,
  FiEdit2,
  FiCheck,
  FiMoreHorizontal,
  FiUsers,
  FiZap,
  FiUser,
  FiGlobe,
} from "react-icons/fi";
import {
  BsChatSquareDots,
  BsHeartFill,
  BsHeart,
  BsPinAngle,
} from "react-icons/bs";
import { LuShare, LuPencil, LuPin } from "react-icons/lu";
import { PiChatCircle } from "react-icons/pi";
import { BiMessageSquareAdd } from "react-icons/bi";
import {
  jsxs as _jsxs,
  jsx as _jsx,
  Fragment as _Fragment,
} from "react/jsx-runtime";
export const ListingsCarousel = (_ref) => {
  let { listings, title, icon, savedStatus, setSavedStatus, theme } = _ref;
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);
  const handleScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setShowLeft(el.scrollLeft > 10);
      setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };
  const scroll = (direction) => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmount = 300; // width of card (280) + gap (16)
      el.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", handleScroll);
      handleScroll(); // Trigger check after content mounts
      const timer = setTimeout(handleScroll, 300);
      return () => {
        el.removeEventListener("scroll", handleScroll);
        clearTimeout(timer);
      };
    }
  }, [listings]);
  return /*#__PURE__*/ _jsxs("div", {
    className: "pl-12 space-y-3 relative group pr-2",
    children: [
      /*#__PURE__*/ _jsxs("div", {
        className: "flex items-center justify-between pr-4",
        children: [
          /*#__PURE__*/ _jsxs("span", {
            className:
              "text-[11px] uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5",
            children: [icon, " ", title],
          }),
          /*#__PURE__*/ _jsxs("div", {
            className: "flex items-center gap-1.5",
            children: [
              /*#__PURE__*/ _jsx("button", {
                onClick: () => scroll("left"),
                disabled: !showLeft,
                className:
                  "w-[34px] h-[34px] rounded-[12px] flex items-center justify-center active:scale-90 transition-all duration-200 border-0\n                            ".concat(
                    showLeft
                      ? "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/20"
                      : "bg-gray-100/50 dark:bg-white/5 text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50",
                  ),
                children: /*#__PURE__*/ _jsx(FiChevronLeft, {
                  className: "w-[18px] h-[18px]",
                }),
              }),
              /*#__PURE__*/ _jsx("button", {
                onClick: () => scroll("right"),
                disabled: !showRight,
                className:
                  "w-[34px] h-[34px] rounded-[12px] flex items-center justify-center active:scale-90 transition-all duration-200 border-0\n                            ".concat(
                    showRight
                      ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900 cursor-pointer hover:bg-gray-955 dark:hover:bg-gray-100"
                      : "bg-gray-100/50 dark:bg-white/5 text-gray-300 dark:text-gray-700 cursor-not-allowed opacity-50",
                  ),
                children: /*#__PURE__*/ _jsx(FiChevronRight, {
                  className: "w-[18px] h-[18px]",
                }),
              }),
            ],
          }),
        ],
      }),
      /*#__PURE__*/ _jsx("div", {
        ref: scrollRef,
        className:
          "flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x scroll-smooth",
        children: listings.map((l) =>
          /*#__PURE__*/ _jsx(
            "div",
            {
              className: "w-[280px] flex-shrink-0 snap-start bg-transparent",
              children: /*#__PURE__*/ _jsx(ListingCard, {
                listing: l,
                viewMode: "grid",
                showSave: true,
                initialSaved: savedStatus[l.id],
                to: "?detail=".concat(l.id),
                onSaveToggle: (isSaved) => {
                  setSavedStatus((prev) =>
                    _objectSpread(
                      _objectSpread({}, prev),
                      {},
                      { [l.id]: isSaved },
                    ),
                  );
                },
              }),
            },
            l.id,
          ),
        ),
      }),
    ],
  });
};
const SidebarIcon = (_ref2) => {
  let { className } = _ref2;
  return /*#__PURE__*/ _jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    children: [
      /*#__PURE__*/ _jsx("rect", {
        width: "18",
        height: "18",
        x: "3",
        y: "3",
        rx: "2",
      }),
      /*#__PURE__*/ _jsx("path", { d: "M9 3v18" }),
    ],
  });
};
const NewChatComposeIcon = (_ref3) => {
  let { className } = _ref3;
  return /*#__PURE__*/ _jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    children: [
      /*#__PURE__*/ _jsx("path", {
        d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
      }),
      /*#__PURE__*/ _jsx("path", {
        d: "M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z",
      }),
    ],
  });
};
const SearchMagnifierIcon = (_ref4) => {
  let { className } = _ref4;
  return /*#__PURE__*/ _jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: className,
    children: [
      /*#__PURE__*/ _jsx("circle", { cx: "11", cy: "11", r: "8" }),
      /*#__PURE__*/ _jsx("path", { d: "m21 21-4.3-4.3" }),
    ],
  });
};
const PinBadgeIcon = (_ref5) => {
  let { className } = _ref5;
  return /*#__PURE__*/ _jsx(LuPin, {
    className: "".concat(className, " rotate-45"),
  });
};
const ChatBubbleIcon = (_ref6) => {
  let { className } = _ref6;
  return /*#__PURE__*/ _jsx(PiChatCircle, { className: className });
};

const ChevronsUpDownIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m7 15 5 5 5-5" />
    <path d="m7 9 5-5 5 5" />
  </svg>
);

const FiSlidersIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="2" y1="14" x2="6" y2="14" />
    <line x1="10" y1="8" x2="14" y2="8" />
    <line x1="18" y1="16" x2="22" y2="16" />
  </svg>
);

const HomeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const ArrowUpRightIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const HelpCircleIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const DocsIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const SignOutIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const FiMailIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const FiDatabaseIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
  </svg>
);

const FiMonitorIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const FiCpuIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="16" height="16" x="4" y="4" rx="2" />
    <rect width="6" height="6" x="9" y="9" rx="1" />
    <path d="M9 1v3" />
    <path d="M15 1v3" />
    <path d="M9 20v3" />
    <path d="M15 20v3" />
    <path d="M20 9h3" />
    <path d="M20 15h3" />
    <path d="M1 9h3" />
    <path d="M1 15h3" />
  </svg>
);

const FiLinkIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const AIAssistant = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme } = useTheme();
  const { agent } = useTenant();
  const { isDarkMode, themeMode: settingsThemeMode, setThemeMode: setSettingsThemeMode } = usePublicDarkTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Profile menu & Settings states
  const [isProfilePopoverOpen, setIsProfilePopoverOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("General");
  const { t, i18n } = useTranslation();
  const getSettingsLanguageName = (code) => {
    if (code === "zh") return "Chinese";
    if (code === "mm") return "Burmese";
    return "English";
  };
  const [settingsLanguage, setSettingsLanguage] = useState(() => getSettingsLanguageName(i18n.language));

  useEffect(() => {
    setSettingsLanguage(getSettingsLanguageName(i18n.language));
  }, [i18n.language]);

  const navigate = useNavigate();
  const location = useLocation();

  const detectAndChangeLanguage = (text) => {
    // Disabled auto-detection to respect user's explicit settings language selection
    return;
  };
  const detectAndChangeSessionLanguage = (session) => {
    // Disabled auto-detection to respect user's explicit settings language selection
    return;
  };
  const slugify = (text) => {
    if (!text) return "chat";
    return text
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-\u00C0-\u017F\u0E00-\u0E7F\u1000-\u109F]+/g, "")
      .replace(/\-\-+/g, "-");
  }; // User key for localStorage segregation
  const userKey =
    (user === null || user === void 0 ? void 0 : user.id) || "guest";
  const storageKey = "bolt_haven_chat_sessions_".concat(userKey); // Default initial assistant greeting message
  const defaultWelcomeMessage = {
    role: "assistant",
    content:
      'Hello! I am your AI Real Estate Assistant. \uD83C\uDFE1\n\nI can help you search the property database using normal human language. You can say things like:\n\n* "Show me condos near BTS Bangna budget 8,500 to 12,000 baht."\n* "Show me a pet-friendly condo near BTS Asok."\n* "I need a room near BTS On Nut with a washing machine."\n\nTell me what you\'re looking for, and I\'ll find you the perfect home!',
  }; // Sessions and Active session management
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedStatus, setSavedStatus] = useState({});
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const isFirstScrollRef = useRef(true); // Collapsible sidebar & Search state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem("bolt_haven_sidebar_collapsed") === "true";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [isPinnedPopoverOpen, setIsPinnedPopoverOpen] = useState(false);
  const [isRecentsPopoverOpen, setIsRecentsPopoverOpen] = useState(false);

  useEffect(() => {
    if (!isSidebarCollapsed) {
      setIsPinnedPopoverOpen(false);
      setIsRecentsPopoverOpen(false);
    }
  }, [isSidebarCollapsed]);

  const modalSearchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => {
        var _modalSearchInputRef$;
        (_modalSearchInputRef$ = modalSearchInputRef.current) === null ||
        _modalSearchInputRef$ === void 0
          ? void 0
          : _modalSearchInputRef$.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setIsSearchLoading(false);
    }
  }, [isSearchModalOpen]);

  useEffect(() => {
    if (!isSearchModalOpen) return;
    if (searchQuery.trim() === "") {
      setIsSearchLoading(false);
      return;
    }
    setIsSearchLoading(true);
    const timer = setTimeout(() => {
      setIsSearchLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, isSearchModalOpen]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const nextVal = !prev;
      localStorage.setItem("bolt_haven_sidebar_collapsed", String(nextVal));
      return nextVal;
    });
  };
  const toggleSearch = () => {
    setIsSearchModalOpen(true);
  };
  const handleSearchClickCollapsed = () => {
    setIsSearchModalOpen(true);
  };
  const getSessionIcon = (title) => {
    const t = title.toLowerCase();
    if (
      t.includes("succeed") ||
      t.includes("people") ||
      t.includes("team") ||
      t.includes("user") ||
      t.includes("group") ||
      t.includes("client")
    ) {
      return FiUsers;
    }
    if (
      t.includes("idea") ||
      t.includes("generate") ||
      t.includes("tech") ||
      t.includes("community")
    ) {
      return FiZap;
    }
    if (
      t.includes("ai") ||
      t.includes("replace") ||
      t.includes("build") ||
      t.includes("what to")
    ) {
      return FiUser;
    }
    if (
      t.includes("globe") ||
      t.includes("world") ||
      t.includes("web") ||
      t.includes("can you")
    ) {
      return FiGlobe;
    }
    return FiMessageSquare;
  };
  const formatSessionDate = (updatedAt) => {
    if (!updatedAt) return "";
    const date = new Date(updatedAt);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  const getSessionSnippet = (s) => {
    if (!s.messages || s.messages.length === 0) return "";
    const nonWelcome = s.messages.filter(
      (m) => m.content !== defaultWelcomeMessage.content,
    );
    const targetMsg =
      nonWelcome.length > 0
        ? nonWelcome[nonWelcome.length - 1]
        : s.messages[s.messages.length - 1];
    if (!targetMsg || !targetMsg.content) return "";
    return targetMsg.content;
  };
  useEffect(() => {
    isFirstScrollRef.current = true;
  }, [currentSessionId, isOpen]);
  useEffect(() => {
    if (isRenameModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isRenameModalOpen]); // Track previous non-chat path
  const previousPathRef = useRef("/");
  useEffect(() => {
    if (!location.pathname.startsWith("/chat")) {
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]); // Listen to custom open-ai-assistant event
  useEffect(() => {
    const handleOpen = () => {
      navigate("/chat");
    };
    window.addEventListener("open-ai-assistant", handleOpen);
    return () => window.removeEventListener("open-ai-assistant", handleOpen);
  }, [navigate]);
  useEffect(() => {
    const handleReload = (e) => {
      const targetSessionId = e.detail;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          const sorted = parsed.sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return (b.updatedAt || 0) - (a.updatedAt || 0);
          });
          setSessions(sorted);
          setCurrentSessionId(targetSessionId);
        }
      } catch (err) {
        console.error(err);
      }
    };
    const handleSelect = (e) => {
      setCurrentSessionId(e.detail);
      const exists = sessions.find((s) => s.id === e.detail);
      const titleSlug = slugify(
        (exists === null || exists === void 0 ? void 0 : exists.title) ||
          "New Chat",
      );
      navigate("/chat/".concat(e.detail, "/").concat(titleSlug));
    };
    window.addEventListener("reload-ai-assistant", handleReload);
    window.addEventListener("select-ai-assistant-session", handleSelect);
    return () => {
      window.removeEventListener("reload-ai-assistant", handleReload);
      window.removeEventListener("select-ai-assistant-session", handleSelect);
    };
  }, [storageKey, sessions, navigate]); // Save sessions helper
  const saveSessionsToStorage = (updatedSessions) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedSessions));
    } catch (err) {
      console.error("Failed to save chat sessions to localStorage:", err);
    }
  }; // Load sessions from localStorage on mount and when userKey changes
  useEffect(() => {
    const loadSessions = () => {
      const pathParts = window.location.pathname.split("/");
      const routeSessionId =
        pathParts[1] === "chat" && pathParts[2] ? pathParts[2] : null;
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Sort: pinned first, then by updatedAt descending
            const sorted = parsed.sort((a, b) => {
              if (a.pinned && !b.pinned) return -1;
              if (!a.pinned && b.pinned) return 1;
              return (b.updatedAt || 0) - (a.updatedAt || 0);
            }); // Select route session if valid, else fallback to latest sorted session
            if (routeSessionId) {
              const exists = sorted.some((s) => s.id === routeSessionId);
              if (exists) {
                setSessions(sorted);
                setCurrentSessionId(routeSessionId);
              } else {
                const newSession = {
                  id: routeSessionId,
                  title: "New Chat",
                  messages: [defaultWelcomeMessage],
                  preferences: {},
                  updatedAt: Date.now(),
                };
                const updated = [newSession, ...sorted];
                setSessions(updated);
                setCurrentSessionId(routeSessionId);
                saveSessionsToStorage(updated);
              }
            } else {
              setSessions(sorted);
              setCurrentSessionId(sorted[0].id);
            }
            return;
          }
        }
      } catch (err) {
        console.error("Failed to parse chat sessions from localStorage:", err);
      } // Fallback: Create a default fresh session
      const fallbackId =
        routeSessionId ||
        "session_"
          .concat(Date.now(), "_")
          .concat(Math.random().toString(36).substr(2, 9));
      const newSession = {
        id: fallbackId,
        title: "New Chat",
        messages: [defaultWelcomeMessage],
        preferences: {},
        updatedAt: Date.now(),
      };
      setSessions([newSession]);
      setCurrentSessionId(fallbackId);
      saveSessionsToStorage([newSession]);
    };
    loadSessions();
  }, [storageKey]); // Sync route with assistant visibility and current session
  useEffect(() => {
    const pathParts = location.pathname.split("/"); // Path matches /chat or /chat/:id or /chat/:id/:name
    if (pathParts[1] === "chat") {
      setIsOpen(true);
      const routeId = pathParts[2];
      if (routeId) {
        // If the route ID is different from current session, switch to it
        if (routeId !== currentSessionId) {
          // Check if session exists in history
          const exists = sessions.some((s) => s.id === routeId);
          if (exists) {
            setCurrentSessionId(routeId);
          } else {
            // Check if we can load it from localStorage
            const stored = localStorage.getItem(storageKey);
            let sessionList = [];
            if (stored) {
              try {
                sessionList = JSON.parse(stored);
              } catch (e) {}
            }
            const sessionExists = sessionList.some((s) => s.id === routeId);
            if (sessionExists) {
              const sorted = sessionList.sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return (b.updatedAt || 0) - (a.updatedAt || 0);
              });
              setSessions(sorted);
              setCurrentSessionId(routeId);
            } else {
              // If it doesn't exist at all, we can create a session with this ID!
              const newSession = {
                id: routeId,
                title: "New Chat",
                messages: [defaultWelcomeMessage],
                preferences: {},
                updatedAt: Date.now(),
              };
              const updated = [newSession, ...sessionList];
              setSessions(updated);
              setCurrentSessionId(routeId);
              saveSessionsToStorage(updated);
            }
          }
        }
      } else {
        // Path is exactly /chat (no ID)
        // Open the assistant and navigate to the current or a new session
        if (currentSessionId) {
          const active = sessions.find((s) => s.id === currentSessionId);
          const titleSlug = slugify(
            (active === null || active === void 0 ? void 0 : active.title) ||
              "New Chat",
          );
          navigate("/chat/".concat(currentSessionId, "/").concat(titleSlug), {
            replace: true,
          });
        } else {
          const stored = localStorage.getItem(storageKey);
          let sessionList = [];
          if (stored) {
            try {
              sessionList = JSON.parse(stored);
            } catch (e) {}
          }
          if (sessionList.length > 0) {
            const first = sessionList[0];
            const titleSlug = slugify(first.title);
            navigate("/chat/".concat(first.id, "/").concat(titleSlug), {
              replace: true,
            });
          } else {
            // Create a new session
            const newId = "session_"
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substr(2, 9));
            const newSession = {
              id: newId,
              title: "New Chat",
              messages: [defaultWelcomeMessage],
              preferences: {},
              updatedAt: Date.now(),
            };
            setSessions([newSession]);
            setCurrentSessionId(newId);
            saveSessionsToStorage([newSession]);
            navigate("/chat/".concat(newId, "/new-chat"), { replace: true });
          }
        }
      }
    } else {
      // Path is not /chat, so close the assistant overlay
      setIsOpen(false);
    }
  }, [location.pathname, sessions, currentSessionId, navigate, storageKey]); // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        var _textareaRef$current;
        (_textareaRef$current = textareaRef.current) === null ||
        _textareaRef$current === void 0
          ? void 0
          : _textareaRef$current.focus();
      }, 150);
    }
  }, [isOpen]); // Derive active session values
  const activeSession = sessions.find((s) => s.id === currentSessionId) || null;
  const messages = activeSession ? activeSession.messages : [];
  const preferences = activeSession ? activeSession.preferences : {}; // Filter sessions based on search query
  const filteredSessions =
    searchQuery.trim() !== ""
      ? sessions.filter((s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : sessions;
  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.pinned); // Sync app language to active session query language
  useEffect(() => {
    if (activeSession) {
      detectAndChangeSessionLanguage(activeSession);
    }
  }, [activeSession]); // Helper: update active session state and store in localStorage
  const updateActiveSession = function (newMessages) {
    let newPreferences =
      arguments.length > 1 && arguments[1] !== undefined
        ? arguments[1]
        : preferences;
    let userQuery =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    setSessions((prev) => {
      let autoRenamedSession = null;
      const updated = prev.map((s) => {
        if (s.id === currentSessionId) {
          let newTitle = s.title; // Auto-rename if it was 'New Chat' and user sends first query
          if (s.title === "New Chat" && userQuery) {
            newTitle =
              userQuery.trim().length > 60
                ? userQuery.trim().slice(0, 60) + "..."
                : userQuery.trim();
            autoRenamedSession = _objectSpread(
              _objectSpread({}, s),
              {},
              { title: newTitle },
            );
          }
          return _objectSpread(
            _objectSpread({}, s),
            {},
            {
              messages: newMessages,
              preferences: newPreferences,
              title: newTitle,
              updatedAt: Date.now(),
            },
          );
        }
        return s;
      }); // Sort sessions: pinned first, then by updatedAt descending
      const sorted = [...updated].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
      saveSessionsToStorage(sorted); // If the active session was renamed, update the route
      if (autoRenamedSession) {
        const titleSlug = slugify(autoRenamedSession.title);
        navigate("/chat/".concat(currentSessionId, "/").concat(titleSlug), {
          replace: true,
        });
      }
      return sorted;
    });
  }; // Auto-resize textarea height as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Set height based on scrollHeight, capped by css limits
      textarea.style.height = "".concat(textarea.scrollHeight, "px");
    }
  }, [input]); // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    if (isFirstScrollRef.current) {
      var _chatEndRef$current;
      (_chatEndRef$current = chatEndRef.current) === null ||
      _chatEndRef$current === void 0
        ? void 0
        : _chatEndRef$current.scrollIntoView({ behavior: "auto" });
      isFirstScrollRef.current = false;
    } else {
      var _chatEndRef$current2;
      (_chatEndRef$current2 = chatEndRef.current) === null ||
      _chatEndRef$current2 === void 0
        ? void 0
        : _chatEndRef$current2.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]); // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        activeDropdownId &&
        !e.target.closest(".session-dropdown-container")
      ) {
        setActiveDropdownId(null);
      }
      if (
        isPinnedPopoverOpen &&
        !e.target.closest(".pinned-popover-container") &&
        !e.target.closest(".pinned-toggle-btn")
      ) {
        setIsPinnedPopoverOpen(false);
      }
      if (
        isRecentsPopoverOpen &&
        !e.target.closest(".recents-popover-container") &&
        !e.target.closest(".recents-toggle-btn")
      ) {
        setIsRecentsPopoverOpen(false);
      }
      if (
        isProfilePopoverOpen &&
        !e.target.closest(".profile-popover-container") &&
        !e.target.closest(".profile-toggle-btn")
      ) {
        setIsProfilePopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdownId, isPinnedPopoverOpen, isRecentsPopoverOpen, isProfilePopoverOpen]); // Close dropdown on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (activeDropdownId) {
        setActiveDropdownId(null);
      }
    };
    window.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    return () =>
      window.removeEventListener("scroll", handleScroll, { capture: true });
  }, [activeDropdownId]); // Preload bookmark status for retrieved listings
  const checkListingSavedStatuses = async (listings) => {
    if (!isAuthenticated) return;
    const statuses = _objectSpread({}, savedStatus);
    await Promise.all(
      listings.map(async (l) => {
        try {
          const res = await checkIfSaved(l.id);
          statuses[l.id] = res.saved || false;
        } catch (err) {
          // ignore
        }
      }),
    );
    setSavedStatus(statuses);
  };
  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return; // Detect and switch language based on the query text
    detectAndChangeLanguage(queryText); // Add user message to state/storage
    const userMessage = { role: "user", content: queryText };
    const newMessages = [...messages, userMessage]; // Optimistically update session messages/title
    updateActiveSession(newMessages, preferences, queryText);
    setInput("");
    setLoading(true);
    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const response = await publicApi.aiChat({
        message: queryText,
        history: historyPayload,
        preferences: _objectSpread(
          _objectSpread({}, preferences),
          {},
          { language: i18n.language },
        ),
      });
      const data = response.data; // Check bookmarks
      const allRetrieved = [
        ...(data.listings || []),
        ...(data.alternatives || []),
        ...(data.compare_listings || []),
      ];
      if (allRetrieved.length > 0) {
        checkListingSavedStatuses(allRetrieved);
      }
      const updatedPreferences = data.preferences || {}; // Add assistant response
      const assistantMessage = {
        role: "assistant",
        content: data.message,
        listings: data.listings,
        alternatives: data.alternatives,
        compare_listings: data.compare_listings,
        lead_status: data.lead_status,
        missing_fields: data.missing_fields,
      };
      updateActiveSession(
        [...newMessages, assistantMessage],
        updatedPreferences,
      ); // Handle lead creation success trigger
      if (data.lead_status === "collected" && data.created_booking) {
        toast.success(
          "Viewing requested successfully! Check your inbox or profile bookings.",
          { duration: 4000 },
        );
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage = {
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please try again in a few moments.",
      };
      updateActiveSession([...newMessages, errorMessage], preferences);
      toast.error("Could not connect to AI services.");
    } finally {
      setLoading(false);
    }
  };
  const handleNewChat = () => {
    // Find if there is any existing session that has no user messages yet
    const existingEmptySession = sessions.find(
      (s) => s.messages.filter((m) => m.role === "user").length === 0,
    );
    if (existingEmptySession) {
      setInput("");
      setCurrentSessionId(existingEmptySession.id);
      const titleSlug = slugify(existingEmptySession.title || "New Chat");
      navigate("/chat/".concat(existingEmptySession.id, "/").concat(titleSlug));
      setTimeout(() => {
        var _textareaRef$current2;
        (_textareaRef$current2 = textareaRef.current) === null ||
        _textareaRef$current2 === void 0
          ? void 0
          : _textareaRef$current2.focus();
      }, 50);
      return;
    }
    const newSession = {
      id: "session_"
        .concat(Date.now(), "_")
        .concat(Math.random().toString(36).substr(2, 9)),
      title: "New Chat",
      messages: [defaultWelcomeMessage],
      preferences: {},
      updatedAt: Date.now(),
    };
    const updatedSessions = [newSession, ...sessions];
    setSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    saveSessionsToStorage(updatedSessions);
    setInput("");
    navigate("/chat/".concat(newSession.id, "/new-chat")); // Focus the textarea
    setTimeout(() => {
      var _textareaRef$current3;
      (_textareaRef$current3 = textareaRef.current) === null ||
      _textareaRef$current3 === void 0
        ? void 0
        : _textareaRef$current3.focus();
    }, 50);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 1. Toggle Sidebar: Cmd+Shift+S (Mac) or Ctrl+Shift+S
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        toggleSidebar();
      }
      // 2. New Chat: Cmd+Shift+O (Mac) or Ctrl+Shift+O
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        handleNewChat();
      }
      // 3. Search: Cmd+K (Mac) or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar, handleNewChat]);
  const handleSelectSession = (sessionId) => {
    setEditingSessionId(null);
    setCurrentSessionId(sessionId);
    setInput("");
    const session = sessions.find((s) => s.id === sessionId);
    const titleSlug = slugify(
      (session === null || session === void 0 ? void 0 : session.title) ||
        "New Chat",
    );
    navigate("/chat/".concat(sessionId, "/").concat(titleSlug));
  };
  const handleTogglePinSession = (sessionId) => {
    var _updated$find;
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        return _objectSpread(
          _objectSpread({}, s),
          {},
          { pinned: !s.pinned, updatedAt: Date.now() },
        );
      }
      return s;
    });
    const sorted = [...updated].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    setSessions(sorted);
    saveSessionsToStorage(sorted);
    const isPinnedNow =
      (_updated$find = updated.find((s) => s.id === sessionId)) === null ||
      _updated$find === void 0
        ? void 0
        : _updated$find.pinned;
    toast.success(isPinnedNow ? "Chat pinned." : "Chat unpinned.");
  };
  const handleShareSession = async (session) => {
    try {
      const payload = {
        id: session.id,
        title: session.title,
        messages: JSON.stringify(session.messages),
      };
      await publicApi.saveSharedChat(payload);
      const shareUrl = ""
        .concat(window.location.origin, "/shared-chat/")
        .concat(session.id);
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      console.error("Failed to share chat:", err);
      toast.error("Failed to generate share link.");
    }
  };
  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    const remainingSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(remainingSessions);
    saveSessionsToStorage(remainingSessions);
    if (currentSessionId === sessionId) {
      if (remainingSessions.length > 0) {
        const nextSession = remainingSessions[0];
        const titleSlug = slugify(nextSession.title);
        setCurrentSessionId(nextSession.id);
        navigate("/chat/".concat(nextSession.id, "/").concat(titleSlug), {
          replace: true,
        });
      } else {
        const newId = "session_"
          .concat(Date.now(), "_")
          .concat(Math.random().toString(36).substr(2, 9));
        const newSession = {
          id: newId,
          title: "New Chat",
          messages: [defaultWelcomeMessage],
          preferences: {},
          updatedAt: Date.now(),
        };
        const updated = [newSession];
        setSessions(updated);
        setCurrentSessionId(newId);
        saveSessionsToStorage(updated);
        navigate("/chat/".concat(newId, "/new-chat"), { replace: true });
      }
    }
    toast.success("Chat deleted.");
  };
  const handleStartRename = (e, session) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
    setIsRenameModalOpen(true);
  };
  const handleSaveRename = (sessionId) => {
    if (!editingTitle.trim()) return;
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        return _objectSpread(
          _objectSpread({}, s),
          {},
          { title: editingTitle.trim(), updatedAt: Date.now() },
        );
      }
      return s;
    });
    const sorted = [...updated].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
    setSessions(sorted);
    saveSessionsToStorage(sorted);
    setEditingSessionId(null);
    setIsRenameModalOpen(false);
    toast.success("Chat renamed.");
    if (sessionId === currentSessionId) {
      const titleSlug = slugify(editingTitle.trim());
      navigate("/chat/".concat(sessionId, "/").concat(titleSlug), {
        replace: true,
      });
    }
  };
  const handleCancelRename = (e) => {
    if (e) e.stopPropagation();
    setEditingSessionId(null);
    setIsRenameModalOpen(false);
  };
  const handleSaveToggle = async (listingId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save properties.");
      return;
    }
    const isSaved = savedStatus[listingId];
    try {
      if (isSaved) {
        await unsaveListing(listingId);
        setSavedStatus((prev) =>
          _objectSpread(_objectSpread({}, prev), {}, { [listingId]: false }),
        );
        toast.success("Property removed from favorites.");
      } else {
        await saveListing(listingId);
        setSavedStatus((prev) =>
          _objectSpread(_objectSpread({}, prev), {}, { [listingId]: true }),
        );
        toast.success("Property saved to favorites!");
      }
    } catch (err) {
      toast.error("Failed to update bookmark.");
    }
  };
  const handleShare = (listingId) => {
    const url = ""
      .concat(window.location.origin, "/listings/")
      .concat(listingId);
    navigator.clipboard.writeText(url);
    toast.success("Listing link copied to clipboard!");
  };
  const handleBookIntent = (title, id) => {
    let bookingTemplate = 'I want to book a viewing for the property: "'
      .concat(title, '" (ID: ')
      .concat(id, "). My details:\n- Name: ")
      .concat(
        (user === null || user === void 0 ? void 0 : user.first_name) || "",
        " ",
      )
      .concat(
        (user === null || user === void 0 ? void 0 : user.last_name) || "",
        "\n- Email: ",
      )
      .concat(
        (user === null || user === void 0 ? void 0 : user.email) || "",
        "\n- Phone: ",
      )
      .concat(
        (user === null || user === void 0 ? void 0 : user.phone) || "",
        "\n- Viewing Date: YYYY-MM-DD\n- Viewing Time: HH:MM",
      );
    setInput(bookingTemplate);
  };
  const resetChat = () => {
    const freshMessage = {
      role: "assistant",
      content:
        "Let's start fresh! What kind of property are you searching for today? \uD83C\uDFE1",
    };
    updateActiveSession([freshMessage], {});
    setInput("");
  }; // Helper: format markdown text into html tags safely
  const formatMessageText = (text) => {
    if (!text) return null;
    let formatted = text.replace(/\*\*(.*?)\*\"/g, "<strong>$1</strong>");
    formatted = formatted.replace(/^\*\s(.*)$/gm, "<li>$1</li>");
    formatted = formatted.replace(/^-\s(.*)$/gm, "<li>$1</li>");
    return formatted.split("\n").map((line, idx) => {
      if (line.trim().startsWith("<li>") || line.trim().endsWith("</li>")) {
        return /*#__PURE__*/ _jsx(
          "ul",
          {
            className: "list-disc pl-5 my-1 dark:text-gray-200",
            children: /*#__PURE__*/ _jsx("span", {
              dangerouslySetInnerHTML: { __html: line },
            }),
          },
          idx,
        );
      }
      return /*#__PURE__*/ _jsx(
        "p",
        {
          className: "my-1.5 leading-relaxed dark:text-gray-200 text-[15px]",
          dangerouslySetInnerHTML: { __html: line },
        },
        idx,
      );
    });
  };
  const suggestedPrompts = [
    t("aiAssistant.suggestedPrompt1"),
    t("aiAssistant.suggestedPrompt2"),
    t("aiAssistant.suggestedPrompt3"),
    t("aiAssistant.suggestedPrompt4"),
  ];
  const getGreeting = () => {
    const hrs = new Date().getHours();
    const name =
      (user === null || user === void 0 ? void 0 : user.first_name) || "";
    const nameStr = name ? ", ".concat(name) : "";
    if (hrs < 12) return t("aiAssistant.promptGreetingMorning").concat(nameStr);
    if (hrs < 18) return t("aiAssistant.promptGreetingAfternoon").concat(nameStr);
    return t("aiAssistant.promptGreetingEvening").concat(nameStr);
  };
  const isInitialState = messages.filter((m) => m.role === "user").length === 0;
  const renderInputBox = () => {
    return /*#__PURE__*/ _jsxs("div", {
      className:
        "flex flex-col bg-white dark:bg-dashboard-input rounded-[26px] border border-gray-200 dark:border-white/10 shadow-sm px-4 pt-3 pb-3 transition-all duration-200",
      children: [
        /*#__PURE__*/ _jsx("textarea", {
          ref: textareaRef,
          value: input,
          onChange: (e) => setInput(e.target.value),
          onKeyDown: (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          },
          placeholder: t("aiAssistant.inputPlaceholder"),
          style: { height: "auto", minHeight: "44px", maxHeight: "180px" },
          className:
            "w-full bg-transparent text-[15px] text-gray-950 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none resize-none custom-scrollbar-thin leading-normal px-2",
        }),
        /*#__PURE__*/ _jsxs("div", {
          className: "flex items-center justify-between mt-2 pt-2 px-1",
          children: [
            /*#__PURE__*/ _jsx("button", {
              type: "button",
              onClick: () => {
                toast.success("Attachments and additional tools coming soon!");
              },
              className:
                "p-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-white/10 rounded-full transition-all active:scale-95",
              children: /*#__PURE__*/ _jsx(FiPlus, { className: "w-5 h-5" }),
            }),
            /*#__PURE__*/ _jsxs("div", {
              className: "flex items-center gap-3",
              children: [
                /*#__PURE__*/ _jsxs("div", {
                  className:
                    "flex items-center gap-1 text-[13px] text-gray-500 dark:text-gray-400 font-semibold px-2.5 py-1 rounded-full hover:bg-gray-200/50 dark:hover:bg-white/10 cursor-pointer transition-all",
                  children: [
                    /*#__PURE__*/ _jsx("span", { children: "Auto" }),
                    /*#__PURE__*/ _jsx("svg", {
                      className: "w-3.5 h-3.5 mt-0.5",
                      fill: "none",
                      stroke: "currentColor",
                      viewBox: "0 0 24 24",
                      children: /*#__PURE__*/ _jsx("path", {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: "2",
                        d: "M19 9l-7 7-7-7",
                      }),
                    }),
                  ],
                }),
                /*#__PURE__*/ _jsx("button", {
                  onClick: () => handleSend(),
                  disabled: !input.trim() || loading,
                  className:
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex-shrink-0 bg-gray-900 dark:bg-white text-white dark:text-gray-900",
                  children: /*#__PURE__*/ _jsx("svg", {
                    className: "w-4 h-4",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /*#__PURE__*/ _jsx("path", {
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      strokeWidth: "2.5",
                      d: "M5 10l7-7m0 0l7 7m-7-7v18",
                    }),
                  }),
                }),
              ],
            }),
          ],
        }),
      ],
    });
  };
  const renderSessionItem = (s) => {
    const isDefaultNewChat = s.title === "New Chat";
    return /*#__PURE__*/ _jsxs(
      "div",
      {
        onClick: () => handleSelectSession(s.id),
        className:
          "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-[8px] transition-all duration-300 text-[13.5px] text-left font-normal group/row cursor-pointer relative\n                    ".concat(
            currentSessionId === s.id
              ? "bg-gray-200 dark:bg-white/10 text-gray-955 dark:text-white"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5 hover:text-gray-955 dark:hover:text-white",
          ),
        children: [
          /*#__PURE__*/ _jsxs("div", {
            className: "truncate flex-1 min-w-0 flex items-center gap-3",
            children: [
              isDefaultNewChat &&
                /*#__PURE__*/ _jsx(PiChatCircle, {
                  className:
                    "w-[17px] h-[17px] text-gray-500 dark:text-gray-400 flex-shrink-0",
                }),
              /*#__PURE__*/ _jsx("span", {
                className: "truncate",
                children: isDefaultNewChat ? t("aiAssistant.newChat") : s.title,
              }),
            ],
          }),
          /*#__PURE__*/ _jsxs("div", {
            className: "flex items-center gap-1 flex-shrink-0",
            children: [
              /*#__PURE__*/ _jsx("button", {
                onClick: (e) => {
                  e.stopPropagation();
                  handleTogglePinSession(s.id);
                },
                className:
                  "p-0.5 transition-colors duration-150 active:scale-90 flex-shrink-0 border-0 bg-transparent cursor-pointer\n                            ".concat(
                    s.pinned
                      ? "flex text-gray-955 dark:text-white"
                      : "text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white ".concat(
                          currentSessionId === s.id || activeDropdownId === s.id
                            ? "flex"
                            : "hidden group-hover/row:flex",
                        ),
                  ),
                title: s.pinned ? "Unpin chat" : "Pin chat",
                children: /*#__PURE__*/ _jsx(LuPin, {
                  className: "w-[17px] h-[17px] rotate-45",
                }),
              }),
              /*#__PURE__*/ _jsx("div", {
                className: "relative session-dropdown-container flex-shrink-0",
                children: /*#__PURE__*/ _jsx("button", {
                  onClick: (e) => {
                    e.stopPropagation();
                    if (activeDropdownId === s.id) {
                      setActiveDropdownId(null);
                    } else {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDropdownCoords({
                        top: rect.bottom + 6,
                        left: rect.left - 12,
                      });
                      setActiveDropdownId(s.id);
                    }
                  },
                  className:
                    "p-0.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors duration-150 active:scale-90 flex-shrink-0 border-0 bg-transparent cursor-pointer\n                                ".concat(
                      currentSessionId === s.id || activeDropdownId === s.id
                        ? "flex"
                        : "hidden group-hover/row:flex",
                    ),
                  title: "Chat options",
                  children: /*#__PURE__*/ _jsx(FiMoreHorizontal, {
                    className: "w-[17px] h-[17px]",
                  }),
                }),
              }),
            ],
          }),
        ],
      },
      s.id,
    );
  };

  const renderProfilePopover = () => {
    if (!isProfilePopoverOpen) return null;

    const popupClasses = isSidebarCollapsed
      ? "fixed left-[68px] bottom-4 bg-white dark:bg-dashboard-dark text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-white/10 rounded-[24px] shadow-sm p-4 w-[280px] z-[300] profile-popover-container animate-fade-in"
      : "fixed left-[296px] bottom-4 bg-white dark:bg-dashboard-dark text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-white/10 rounded-[24px] shadow-sm p-4 w-[264px] z-[300] profile-popover-container animate-fade-in";

    return (
      <div className={popupClasses} onClick={(e) => e.stopPropagation()}>
        {/* Profile Header */}
        <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-orange-700/80 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 select-none">
              {user?.first_name ? user.first_name[0].toUpperCase() : "G"}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-[15px] font-bold text-gray-900 dark:text-white truncate">
                {user ? `${user.first_name} ${user.last_name || ""}`.trim() : t("aiAssistant.guestUser")}
              </span>
              <span className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                {user ? t("aiAssistant.personal") : t("aiAssistant.freeAccess")}
              </span>
            </div>
          </div>
          <ChevronsUpDownIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        </div>

        {/* Menu Items */}
        <div className="space-y-0.5">
          {/* Account */}
          <button
            onClick={() => {
              setActiveSettingsTab("Account");
              setIsSettingsModalOpen(true);
              setIsProfilePopoverOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[12px] text-[15px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 text-left border-0 bg-transparent cursor-pointer transition-colors"
          >
            <FiUser className="w-4 h-4 text-gray-550 dark:text-gray-400" />
            <span>{t("aiAssistant.account")}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              setActiveSettingsTab("General");
              setIsSettingsModalOpen(true);
              setIsProfilePopoverOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[12px] text-[15px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 text-left border-0 bg-transparent cursor-pointer transition-colors"
          >
            <FiSlidersIcon className="w-4 h-4 text-gray-550 dark:text-gray-400" />
            <span>{t("aiAssistant.settings")}</span>
          </button>

          <div className="my-1 border-t border-gray-100 dark:border-white/5" />

          {/* Homepage */}
          <a
            href="/"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-[12px] text-[15px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 text-left border-0 bg-transparent cursor-pointer transition-colors no-underline"
          >
            <div className="flex items-center gap-2.5">
              <HomeIcon className="w-4 h-4 text-gray-505 dark:text-gray-400" />
              <span>{t("aiAssistant.homepage")}</span>
            </div>
            <ArrowUpRightIcon className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <div className="my-1 border-t border-gray-100 dark:border-white/5" />

          {/* Sign out */}
          <button
            onClick={() => {
              if (logout) logout();
              setIsProfilePopoverOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[12px] text-[15px] text-red-500 dark:text-rose-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-left border-0 bg-transparent cursor-pointer transition-colors"
          >
            <SignOutIcon className="w-4 h-4 text-red-505 dark:text-rose-400" />
            <span>{t("aiAssistant.signOut")}</span>
          </button>
        </div>
      </div>
    );
  };

  const renderSettingsTabContent = () => {
    switch (activeSettingsTab) {
      case "General":
        return (
          <div className="space-y-8 text-left">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t("aiAssistant.general")}</h2>
            </div>

            {/* Appearance Section */}
            <div className="space-y-6">
              <div className="text-[12px] font-bold tracking-wider text-gray-400 dark:text-gray-500">
                {t("aiAssistant.appearance")}
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-[15px] font-medium text-gray-750 dark:text-gray-300">
                  {t("aiAssistant.languageLabel")}
                </label>
                <div className="relative w-full max-w-[200px]">
                  <select
                    value={settingsLanguage}
                    onChange={(e) => {
                      setSettingsLanguage(e.target.value);
                      if (e.target.value === "English") i18n.changeLanguage("en");
                      if (e.target.value === "Chinese") i18n.changeLanguage("zh");
                      if (e.target.value === "Burmese") i18n.changeLanguage("mm");
                    }}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-[12px] px-3 py-2 text-[15px] outline-none text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    <option value="English">English</option>
                    <option value="Chinese">中文 (Chinese)</option>
                    <option value="Burmese">မြန်မာဘာသာ (Burmese)</option>
                  </select>
                </div>
              </div>

              {/* Theme Choices */}
              <div className="space-y-3">
                <label className="text-[15px] font-medium text-gray-750 dark:text-gray-300">
                  {t("aiAssistant.themeLabel")}
                </label>
                <div className="flex gap-2 p-1 bg-gray-100/85 dark:bg-dashboard-input border border-gray-200/80 dark:border-white/10 rounded-[16px] w-fit">
                  {/* Light Theme Button */}
                  <button
                    onClick={() => setSettingsThemeMode("light")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-[15px] font-normal transition-colors border-0 cursor-pointer ${
                      settingsThemeMode === "light"
                        ? "bg-white dark:bg-dashboard-card text-gray-955 dark:text-white shadow-sm"
                        : "bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                    <span>{t("aiAssistant.lightTheme")}</span>
                  </button>

                  {/* Dark Theme Button */}
                  <button
                    onClick={() => setSettingsThemeMode("dark")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-[15px] font-normal transition-colors border-0 cursor-pointer ${
                      settingsThemeMode === "dark"
                        ? "bg-white dark:bg-dashboard-card text-gray-955 dark:text-white shadow-sm"
                        : "bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                    <span>{t("aiAssistant.darkTheme")}</span>
                  </button>

                  {/* Auto Theme Button */}
                  <button
                    onClick={() => setSettingsThemeMode("auto")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-[12px] text-[15px] font-normal transition-colors border-0 cursor-pointer ${
                      settingsThemeMode === "auto"
                        ? "bg-white dark:bg-dashboard-card text-gray-955 dark:text-white shadow-sm"
                        : "bg-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      <path d="M2 12h20" />
                    </svg>
                    <span>{t("aiAssistant.autoTheme")}</span>
                  </button>
                </div>
              </div>
            </div>


          </div>
        );

      case "Account":
        return (
          <div className="space-y-6 text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("aiAssistant.accountSettings")}</h2>
            <div className="bg-gray-50 dark:bg-white/5 rounded-[16px] p-6 border border-gray-100 dark:border-white/5 max-w-[560px] space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-700/80 text-white flex items-center justify-center font-bold text-2xl">
                  {user?.first_name ? user.first_name[0].toUpperCase() : "G"}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {user ? `${user.first_name} ${user.last_name || ""}`.trim() : t("aiAssistant.guestUser")}
                  </span>
                  <span className="text-[13px] text-gray-500 dark:text-gray-400">
                    {user ? t("aiAssistant.personalAccount") : t("aiAssistant.freeAccess")}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-white/5 pt-4 space-y-4">
                <div>
                  <span className="text-[12px] font-bold tracking-wider text-gray-400 dark:text-gray-505">{t("aiAssistant.emailLabel")}</span>
                  <p className="text-[15px] text-gray-800 dark:text-gray-200 font-medium mt-1">
                    {user?.email || "guest@example.com"}
                  </p>
                </div>
                <div>
                  <span className="text-[12px] font-bold tracking-wider text-gray-400 dark:text-gray-505">{t("aiAssistant.roleLabel")}</span>
                  <p className="text-[15px] text-gray-800 dark:text-gray-200 font-medium mt-1">
                    {user ? t("aiAssistant.personalAccountHolder") : t("aiAssistant.guestAccess")}
                  </p>
                </div>
              </div>
            </div>
            </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full py-12 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950/30 text-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{activeSettingsTab} Tab</h3>
            <p className="text-sm text-gray-505 dark:text-gray-400 max-w-sm">
              This settings panel is coming soon or represents an integration screen!
            </p>
          </div>
        );
    }
  };

  const renderSettingsModal = () => {
    if (!isSettingsModalOpen) return null;

    const tabs = {
      Account: {
        icon: <FiUser className="w-[15px] h-[15px]" />,
        group: "Account"
      },
      General: {
        icon: <FiSlidersIcon className="w-[15px] h-[15px]" />,
        group: "Account"
      }
    };

    return (
      <div 
        className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 backdrop-blur-[4px] animate-fade-in"
        onClick={() => setIsSettingsModalOpen(false)}
      >
        <div 
          className="w-full max-w-[900px] h-[600px] bg-white dark:bg-dashboard-card text-gray-800 dark:text-gray-100 rounded-[24px] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex border border-gray-200/80 dark:border-white/10 animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Sidebar */}
          <div className="w-[230px] bg-gray-50/50 dark:bg-black/15 border-r border-gray-200/60 dark:border-white/5 flex flex-col justify-between p-4 flex-shrink-0 select-none">
            <div className="space-y-4">
              {/* Profile Card Header in Modal */}
              <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-700/80 text-white flex items-center justify-center font-bold text-sm select-none">
                  {user?.first_name ? user.first_name[0].toUpperCase() : "G"}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-[15px] font-bold text-gray-900 dark:text-white truncate">
                    {user ? `${user.first_name} ${user.last_name || ""}`.trim() : t("aiAssistant.guestUser")}
                  </span>
                  <span className="text-[13px] text-gray-500 dark:text-gray-400 truncate">
                    {user ? t("aiAssistant.personal") : t("aiAssistant.freeAccess")}
                  </span>
                </div>
                <ChevronsUpDownIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-555 ml-auto" />
              </div>

              {/* Group Account */}
              <div>
                <span className="text-[12px] font-bold text-gray-400 dark:text-gray-505 px-2 tracking-wider block mb-1.5 text-left">
                  {t("aiAssistant.account")}
                </span>
                <div className="space-y-0.5">
                  {Object.entries(tabs)
                    .filter(([_, tab]) => tab.group === "Account")
                    .map(([name, tab]) => (
                      <button
                        key={name}
                        onClick={() => setActiveSettingsTab(name)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[12px] text-[15px] font-medium transition-colors border-0 cursor-pointer text-left ${
                          activeSettingsTab === name
                            ? "bg-gray-200/60 dark:bg-white/10 text-gray-955 dark:text-white"
                            : "bg-transparent text-gray-650 dark:text-gray-300 hover:bg-gray-200/30 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {tab.icon}
                        <span>{name === "Account" ? t("aiAssistant.account") : t("aiAssistant.general")}</span>
                      </button>
                    ))}
                </div>
              </div>


            </div>

            {/* Sidebar Footer */}
            <button
              onClick={() => setActiveSettingsTab("Get help")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-[12px] text-[15px] font-medium bg-transparent text-gray-650 dark:text-gray-300 hover:bg-gray-200/30 dark:hover:bg-white/5 border-0 cursor-pointer transition-colors"
            >
              <span>{t("aiAssistant.getHelp")}</span>
              <ArrowUpRightIcon className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-dashboard-card relative">
            {/* Close Button */}
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-[12px] hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-650 dark:hover:text-white border-0 bg-transparent cursor-pointer transition-colors z-50 flex items-center justify-center"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Dynamic Content */}
            <div className="flex-1 overflow-y-auto p-8 pr-12">
              {renderSettingsTabContent()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return /*#__PURE__*/ _jsxs(_Fragment, {
    children: [
      !isOpen &&
        /*#__PURE__*/ _jsxs("button", {
          onClick: () => {
            if (currentSessionId) {
              const active = sessions.find((s) => s.id === currentSessionId);
              const titleSlug = slugify(
                (active === null || active === void 0
                  ? void 0
                  : active.title) || "New Chat",
              );
              navigate(
                "/chat/".concat(currentSessionId, "/").concat(titleSlug),
              );
            } else {
              navigate("/chat");
            }
          },
          className:
            "fixed bottom-6 right-6 z-[250] flex items-center justify-center w-14 h-14 rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 animate-bounce-subtle border border-white/10",
          style: {
            backgroundColor: theme.primaryColor || "#1a73e8",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          },
          children: [
            /*#__PURE__*/ _jsx(BsChatSquareDots, {
              className: "w-6 h-6 animate-pulse",
            }),
            /*#__PURE__*/ _jsx("div", {
              className:
                "absolute inset-0 rounded-full animate-ripple border-2",
              style: { borderColor: theme.primaryColor || "#1a73e8" },
            }),
          ],
        }),
      /*#__PURE__*/ _jsxs("div", {
        className:
          "fixed inset-0 z-[260] transition-all duration-300 flex bg-gray-50 dark:bg-dashboard-card\n                    ".concat(
            isOpen
              ? "translate-y-0 opacity-100"
              : "translate-y-8 opacity-0 pointer-events-none",
          ),
        style: { fontFamily: "'Helvetica', 'Arial', sans-serif" },
        children: [
          /*#__PURE__*/ _jsxs("div", {
            className:
              "hidden md:flex flex-col h-full bg-white text-gray-800 dark:bg-dashboard-dark dark:text-gray-100 border-r border-gray-200/80 dark:border-white/5 flex-shrink-0 transition-all duration-300 ease-in-out relative z-30 ".concat(
                isSidebarCollapsed ? "overflow-visible" : "overflow-hidden",
              ),
            style: { width: isSidebarCollapsed ? "60px" : "288px" },
            children: [
              /*#__PURE__*/ _jsxs("div", {
                className:
                  "absolute inset-0 flex flex-col justify-between items-center py-4 select-none transition-all duration-300 ease-in-out ".concat(
                    isSidebarCollapsed
                      ? "opacity-100 pointer-events-auto scale-100"
                      : "opacity-0 pointer-events-none scale-95",
                  ),
                style: { width: "60px" },
                children: [
                  /*#__PURE__*/ _jsxs("div", {
                    className: "flex flex-col items-center gap-4 w-full",
                    children: [
                      /*#__PURE__*/ _jsxs("div", {
                        className: "relative group",
                        children: [
                          /*#__PURE__*/ _jsx("button", {
                            onClick: toggleSidebar,
                            className:
                              "w-11 h-11 text-gray-500 hover:text-gray-955 dark:text-gray-400 dark:hover:text-white rounded-[12px] hover:bg-gray-200/80 dark:hover:bg-white/10 transition-all duration-200 border-0 bg-transparent cursor-pointer flex items-center justify-center",
                            children: /*#__PURE__*/ _jsx(SidebarIcon, {
                              className: "w-5 h-5",
                            }),
                          }),
                          /*#__PURE__*/ _jsx("div", {
                            className:
                              "absolute left-[50px] top-1/2 -translate-y-1/2 bg-white dark:bg-dashboard-card border border-gray-200/80 dark:border-white/10 text-gray-800 dark:text-gray-200 text-[13px] font-medium px-3.5 py-1.5 rounded-[8px] shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]",
                            children: t("aiAssistant.openSidebar"),
                          }),
                        ],
                      }),
                      /*#__PURE__*/ _jsxs("div", {
                        className: "relative group",
                        children: [
                          /*#__PURE__*/ _jsx("button", {
                            onClick: handleNewChat,
                            className:
                              "w-11 h-11 text-gray-500 hover:text-gray-955 dark:text-gray-400 dark:hover:text-white rounded-[12px] hover:bg-gray-200/80 dark:hover:bg-white/10 transition-all duration-200 border-0 bg-transparent cursor-pointer flex items-center justify-center",
                            children: /*#__PURE__*/ _jsx(BiMessageSquareAdd, {
                              className: "w-5 h-5",
                            }),
                          }),
                          /*#__PURE__*/ _jsx("div", {
                            className:
                              "absolute left-[50px] top-1/2 -translate-y-1/2 bg-white dark:bg-dashboard-card border border-gray-200/80 dark:border-white/10 text-gray-800 dark:text-gray-200 text-[13px] font-medium px-3.5 py-1.5 rounded-[8px] shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]",
                            children: "New chat",
                          }),
                        ],
                      }),
                      /*#__PURE__*/ _jsxs("div", {
                        className: "relative group",
                        children: [
                          /*#__PURE__*/ _jsx("button", {
                            onClick: handleSearchClickCollapsed,
                            className:
                              "w-11 h-11 text-gray-500 hover:text-gray-955 dark:text-gray-400 dark:hover:text-white rounded-[12px] hover:bg-gray-200/80 dark:hover:bg-white/10 transition-all duration-200 border-0 bg-transparent cursor-pointer flex items-center justify-center",
                            children: /*#__PURE__*/ _jsx(SearchMagnifierIcon, {
                              className: "w-5 h-5",
                            }),
                          }),
                          /*#__PURE__*/ _jsx("div", {
                            className:
                              "absolute left-[50px] top-1/2 -translate-y-1/2 bg-white dark:bg-dashboard-card border border-gray-200/80 dark:border-white/10 text-gray-800 dark:text-gray-200 text-[13px] font-medium px-3.5 py-1.5 rounded-[8px] shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]",
                            children: t("aiAssistant.searchTooltip"),
                          }),
                        ],
                      }),
                      /*#__PURE__*/ _jsxs("div", {
                        className: "relative group",
                        children: [
                          /*#__PURE__*/ _jsx("button", {
                            onClick: () => {
                              setIsPinnedPopoverOpen(!isPinnedPopoverOpen);
                              setIsRecentsPopoverOpen(false);
                            },
                            className:
                              "pinned-toggle-btn w-11 h-11 rounded-[12px] transition-all duration-200 border-0 cursor-pointer flex items-center justify-center\n                              ".concat(
                                isPinnedPopoverOpen
                                  ? "bg-gray-200 text-gray-955 dark:bg-white/10 dark:text-white"
                                  : "bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-955 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-white/10",
                              ),
                            children: /*#__PURE__*/ _jsx(PinBadgeIcon, {
                              className: "w-5 h-5",
                            }),
                          }),
                          /*#__PURE__*/ _jsx("div", {
                            className:
                              "absolute left-[50px] top-1/2 -translate-y-1/2 bg-white dark:bg-dashboard-card border border-gray-200/80 dark:border-white/10 text-gray-800 dark:text-gray-200 text-[13px] font-medium px-3.5 py-1.5 rounded-[8px] shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]",
                            children: t("aiAssistant.pinned"),
                          }),
                          isPinnedPopoverOpen &&
                            /*#__PURE__*/ _jsxs("div", {
                              className:
                                "pinned-popover-container absolute left-[60px] top-0 bg-white dark:bg-dashboard-dark text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-white/10 rounded-[24px] shadow-sm p-4 w-[280px] z-[200] animate-fade-in",
                              children: [
                                /*#__PURE__*/ _jsx("div", {
                                  className:
                                    "text-[15px] font-semibold text-gray-900 dark:text-white mb-3 px-1 text-left",
                                  children: t("aiAssistant.pinned"),
                                }),
                                /*#__PURE__*/ _jsx("div", {
                                  className:
                                    "space-y-1 max-h-[300px] overflow-y-auto pr-1 modal-scrollable",
                                  children:
                                    pinnedSessions.length === 0
                                      ? /*#__PURE__*/ _jsx("div", {
                                          className:
                                            "text-[13px] text-gray-400 dark:text-gray-500 px-1 py-1 text-left",
                                          children: t("aiAssistant.noPinned"),
                                        })
                                       : pinnedSessions.map((s) =>
                                          /*#__PURE__*/ _jsxs(
                                            "div",
                                            {
                                              onClick: () => {
                                                handleSelectSession(s.id);
                                                setIsPinnedPopoverOpen(false);
                                              },
                                              className:
                                                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-[8px] transition-all duration-200 cursor-pointer text-left group/row text-[13.5px] font-normal\n                                              ".concat(
                                                  currentSessionId === s.id
                                                    ? "bg-gray-200 dark:bg-white/10 text-gray-955 dark:text-white"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5 hover:text-gray-955 dark:hover:text-white",
                                                ),
                                              children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                  className: "truncate flex-1 min-w-0 flex items-center gap-3",
                                                  children: [
                                                    s.title === "New Chat" &&
                                                      /*#__PURE__*/ _jsx(PiChatCircle, {
                                                        className: "w-[15px] h-[15px] flex-shrink-0 text-gray-500 dark:text-gray-400",
                                                      }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                      className: "text-[13.5px] truncate flex-1",
                                                      children: s.title,
                                                    }),
                                                  ],
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                  className: "flex items-center gap-1 flex-shrink-0",
                                                  children: [
                                                    /*#__PURE__*/ _jsx("button", {
                                                      onClick: (e) => {
                                                        e.stopPropagation();
                                                        handleTogglePinSession(s.id);
                                                      },
                                                      className:
                                                         "p-0.5 transition-colors duration-150 active:scale-90 flex-shrink-0 border-0 bg-transparent cursor-pointer ".concat(
                                                           s.pinned
                                                             ? "flex text-gray-955 dark:text-white"
                                                             : "text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white ".concat(
                                                                 currentSessionId === s.id || activeDropdownId === s.id
                                                                   ? "flex"
                                                                   : "hidden group-hover/row:flex",
                                                               ),
                                                         ),
                                                      title: s.pinned ? t("aiAssistant.unpinChat") : t("aiAssistant.pinChat"),
                                                      children: /*#__PURE__*/ _jsx(LuPin, {
                                                        className: "w-[15px] h-[15px] rotate-45",
                                                      }),
                                                    }),
                                                    /*#__PURE__*/ _jsx("div", {
                                                      className: "relative session-dropdown-container flex-shrink-0",
                                                      children: /*#__PURE__*/ _jsx("button", {
                                                        onClick: (e) => {
                                                          e.stopPropagation();
                                                          if (activeDropdownId === s.id) {
                                                            setActiveDropdownId(null);
                                                          } else {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setDropdownCoords({
                                                              top: rect.bottom + 6,
                                                              left: rect.left - 12,
                                                            });
                                                            setActiveDropdownId(s.id);
                                                          }
                                                        },
                                                        className:
                                                          "p-0.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors duration-150 active:scale-90 flex-shrink-0 border-0 bg-transparent cursor-pointer ".concat(
                                                            currentSessionId === s.id || activeDropdownId === s.id
                                                              ? "flex"
                                                              : "hidden group-hover/row:flex",
                                                          ),
                                                        title: "Chat options",
                                                        children: /*#__PURE__*/ _jsx(FiMoreHorizontal, {
                                                          className: "w-[15px] h-[15px]",
                                                        }),
                                                      }),
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            },
                                            s.id,
                                          ),
                                        ),
                                }),
                              ],
                            }),
                        ],
                      }),
                      /*#__PURE__*/ _jsxs("div", {
                        className: "relative group",
                        children: [
                          /*#__PURE__*/ _jsx("button", {
                            onClick: () => {
                              setIsRecentsPopoverOpen(!isRecentsPopoverOpen);
                              setIsPinnedPopoverOpen(false);
                            },
                            className:
                              "recents-toggle-btn w-11 h-11 rounded-[12px] transition-all duration-200 border-0 cursor-pointer flex items-center justify-center\n                              ".concat(
                                isRecentsPopoverOpen
                                  ? "bg-gray-200 text-gray-955 dark:bg-white/10 dark:text-white"
                                  : "bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-955 dark:hover:text-white hover:bg-gray-200/80 dark:hover:bg-white/10",
                              ),
                            children: /*#__PURE__*/ _jsx(ChatBubbleIcon, {
                              className: "w-5 h-5",
                            }),
                          }),
                          /*#__PURE__*/ _jsx("div", {
                            className:
                              "absolute left-[50px] top-1/2 -translate-y-1/2 bg-white dark:bg-dashboard-card border border-gray-200/80 dark:border-white/10 text-gray-800 dark:text-gray-200 text-[13px] font-medium px-3.5 py-1.5 rounded-[8px] shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]",
                            children: t("aiAssistant.chats"),
                          }),
                          isRecentsPopoverOpen &&
                            /*#__PURE__*/ _jsxs("div", {
                              className:
                                "recents-popover-container absolute left-[60px] top-0 bg-white dark:bg-dashboard-dark text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-white/10 rounded-[24px] shadow-sm p-4 w-[280px] z-[200] animate-fade-in",
                              children: [
                                /*#__PURE__*/ _jsx("div", {
                                  className:
                                    "text-[15px] font-semibold text-gray-900 dark:text-white mb-3 px-1 text-left",
                                  children: t("aiAssistant.chats"),
                                }),
                                /*#__PURE__*/ _jsx("div", {
                                  className:
                                    "space-y-1 max-h-[300px] overflow-y-auto pr-1 modal-scrollable",
                                  children:
                                    sessions.filter(s => !s.pinned).length === 0
                                      ? /*#__PURE__*/ _jsx("div", {
                                          className:
                                            "text-[13px] text-gray-400 dark:text-gray-500 px-1 py-1 text-left",
                                          children: t("aiAssistant.noChats"),
                                        })
                                       : sessions.filter(s => !s.pinned).map((s) =>
                                          /*#__PURE__*/ _jsxs(
                                            "div",
                                            {
                                              onClick: () => {
                                                handleSelectSession(s.id);
                                                setIsRecentsPopoverOpen(false);
                                              },
                                              className:
                                                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-[8px] transition-all duration-200 cursor-pointer text-left group/row text-[13.5px] font-normal\n                                              ".concat(
                                                  currentSessionId === s.id
                                                    ? "bg-gray-200 dark:bg-white/10 text-gray-955 dark:text-white"
                                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5 hover:text-gray-955 dark:hover:text-white",
                                                ),
                                              children: [
                                                /*#__PURE__*/ _jsxs("div", {
                                                  className: "truncate flex-1 min-w-0 flex items-center gap-3",
                                                  children: [
                                                    s.title === "New Chat" &&
                                                      /*#__PURE__*/ _jsx(PiChatCircle, {
                                                        className: "w-[15px] h-[15px] flex-shrink-0 text-gray-500 dark:text-gray-400",
                                                      }),
                                                    /*#__PURE__*/ _jsx("span", {
                                                      className: "text-[13.5px] truncate flex-1",
                                                      children: s.title,
                                                    }),
                                                  ],
                                                }),
                                                /*#__PURE__*/ _jsxs("div", {
                                                  className: "flex items-center gap-1 flex-shrink-0",
                                                  children: [
                                                    /*#__PURE__*/ _jsx("button", {
                                                      onClick: (e) => {
                                                        e.stopPropagation();
                                                        handleTogglePinSession(s.id);
                                                      },
                                                      className:
                                                         "p-0.5 transition-colors duration-150 active:scale-90 flex-shrink-0 border-0 bg-transparent cursor-pointer text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white ".concat(
                                                           currentSessionId === s.id || activeDropdownId === s.id
                                                             ? "flex"
                                                             : "hidden group-hover/row:flex",
                                                         ),
                                                      title: s.pinned ? t("aiAssistant.unpinChat") : t("aiAssistant.pinChat"),
                                                      children: /*#__PURE__*/ _jsx(LuPin, {
                                                        className: "w-[15px] h-[15px] rotate-45",
                                                      }),
                                                    }),
                                                    /*#__PURE__*/ _jsx("div", {
                                                      className: "relative session-dropdown-container flex-shrink-0",
                                                      children: /*#__PURE__*/ _jsx("button", {
                                                        onClick: (e) => {
                                                          e.stopPropagation();
                                                          if (activeDropdownId === s.id) {
                                                            setActiveDropdownId(null);
                                                          } else {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setDropdownCoords({
                                                              top: rect.bottom + 6,
                                                              left: rect.left - 12,
                                                            });
                                                            setActiveDropdownId(s.id);
                                                          }
                                                        },
                                                        className:
                                                          "p-0.5 text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors duration-150 active:scale-90 flex-shrink-0 border-0 bg-transparent cursor-pointer ".concat(
                                                            currentSessionId === s.id || activeDropdownId === s.id
                                                              ? "flex"
                                                              : "hidden group-hover/row:flex",
                                                          ),
                                                        title: "Chat options",
                                                        children: /*#__PURE__*/ _jsx(FiMoreHorizontal, {
                                                          className: "w-[15px] h-[15px]",
                                                        }),
                                                      }),
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            },
                                            s.id,
                                          ),
                                        ),
                                }),
                              ],
                            }),
                        ],
                      }),
                    ],
                  }),
                  /*#__PURE__*/ _jsxs("div", {
                    className: "relative group profile-toggle-btn",
                    children: [
                      /*#__PURE__*/ _jsx("div", {
                        onClick: (e) => {
                          e.stopPropagation();
                          setIsProfilePopoverOpen((prev) => !prev);
                        },
                        className:
                          "w-9 h-9 rounded-full bg-orange-700/80 text-white flex items-center justify-center font-bold text-sm cursor-pointer select-none",
                        children:
                          user !== null && user !== void 0 && user.first_name
                            ? user.first_name[0].toUpperCase()
                            : "G",
                      }),
                      /*#__PURE__*/ _jsx("div", {
                        className:
                          "absolute left-[50px] top-1/2 -translate-y-1/2 bg-white dark:bg-dashboard-card border border-gray-200/80 dark:border-white/10 text-gray-800 dark:text-gray-200 text-[13px] font-medium px-3.5 py-1.5 rounded-[8px] shadow-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]",
                        children: user
                          ? ""
                              .concat(user.first_name || "", " ")
                              .concat(user.last_name || "")
                          : "Guest User",
                      }),
                    ],
                  }),
                ],
              }),
              /*#__PURE__*/ _jsx("div", {
                className:
                  "absolute inset-y-0 left-0 flex flex-col justify-between transition-all duration-300 ease-in-out ".concat(
                    isSidebarCollapsed
                      ? "opacity-0 pointer-events-none translate-x-[-20px] scale-95"
                      : "opacity-100 pointer-events-auto translate-x-0 scale-100",
                  ),
                style: { width: "288px" },
                children: /*#__PURE__*/ _jsxs("div", {
                  className: "flex flex-col h-full justify-between",
                  children: [
                    /*#__PURE__*/ _jsxs("div", {
                      className: "flex-1 flex flex-col min-h-0",
                      children: [
                        /*#__PURE__*/ _jsxs("div", {
                          className:
                            "py-1.5 px-4 bg-gray-100/30 dark:bg-black/10 flex items-center justify-between h-13 flex-shrink-0",
                          children: [
                            /*#__PURE__*/ _jsx("span", {
                              className:
                                "text-xl font-bold tracking-wider text-gray-955 dark:text-white select-none",
                              children: "BoltHaven",
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                              className: "flex items-center gap-1",
                              children: [
                                /*#__PURE__*/ _jsx("button", {
                                  onClick: () => setIsSearchModalOpen(true),
                                  className:
                                    "w-11 h-11 text-gray-500 hover:text-gray-955 dark:text-gray-400 dark:hover:text-white rounded-[12px] hover:bg-gray-200/80 dark:hover:bg-white/10 border-0 bg-transparent cursor-pointer transition-all duration-200 flex items-center justify-center",
                                  title: t("aiAssistant.searchChats"),
                                  children: /*#__PURE__*/ _jsx(
                                    SearchMagnifierIcon,
                                    { className: "w-5 h-5" },
                                  ),
                                }),
                                /*#__PURE__*/ _jsx("button", {
                                  onClick: toggleSidebar,
                                  className:
                                    "w-11 h-11 text-gray-500 hover:text-gray-955 dark:text-gray-400 dark:hover:text-white rounded-[12px] hover:bg-gray-200/80 dark:hover:bg-white/10 border-0 bg-transparent cursor-pointer transition-all duration-200 flex items-center justify-center",
                                  title: t("aiAssistant.closeSidebar"),
                                  children: /*#__PURE__*/ _jsx(SidebarIcon, {
                                    className: "w-5 h-5",
                                  }),
                                }),
                              ],
                            }),
                          ],
                        }),
                        /*#__PURE__*/ _jsx("div", {
                          className: "px-3 pt-3.5 pb-2 flex-shrink-0",
                          children: /*#__PURE__*/ _jsxs("button", {
                            onClick: handleNewChat,
                            className:
                              "w-full flex items-center justify-start gap-3 py-2.5 px-3.5 rounded-[8px] bg-gray-200/50 dark:bg-white/5 hover:bg-gray-200/80 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 border-0 active:scale-[0.98] transition-all text-[13.5px] font-normal cursor-pointer",
                            children: [
                              /*#__PURE__*/ _jsx(BiMessageSquareAdd, {
                                className:
                                  "w-[17px] h-[17px] text-gray-500 dark:text-gray-400 flex-shrink-0",
                              }),
                              /*#__PURE__*/ _jsx("span", {
                                children: t("aiAssistant.newChat"),
                              }),
                            ],
                          }),
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                          className:
                            "px-3 pb-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar-thin",
                          children: [
                            pinnedSessions.length === 0 &&
                              unpinnedSessions.length === 0 &&
                              searchQuery &&
                              /*#__PURE__*/ _jsx("div", {
                                className:
                                  "text-center text-xs text-gray-400 dark:text-gray-500 py-6 select-none animate-fade-in",
                                children: t("aiAssistant.noMatches"),
                              }),
                            pinnedSessions.length > 0 &&
                              /*#__PURE__*/ _jsxs(_Fragment, {
                                children: [
                                  /*#__PURE__*/ _jsx("span", {
                                    className:
                                      "text-[14px] font-bold text-gray-955 dark:text-white px-3.5 block mb-2 mt-4 select-none",
                                    children: t("aiAssistant.pinned"),
                                  }),
                                  /*#__PURE__*/ _jsx("div", {
                                    className: "space-y-1",
                                    children:
                                      pinnedSessions.map(renderSessionItem),
                                  }),
                                ],
                              }),
                            unpinnedSessions.length > 0 &&
                              /*#__PURE__*/ _jsxs(_Fragment, {
                                children: [
                                  /*#__PURE__*/ _jsx("span", {
                                    className:
                                      "text-[14px] font-bold text-gray-955 dark:text-white px-3.5 block mb-2 select-none ".concat(
                                        pinnedSessions.length > 0
                                          ? "mt-6"
                                          : "mt-4",
                                      ),
                                    children: t("aiAssistant.chats"),
                                  }),
                                  /*#__PURE__*/ _jsx("div", {
                                    className: "space-y-1",
                                    children:
                                      unpinnedSessions.map(renderSessionItem),
                                  }),
                                ],
                              }),
                          ],
                        }),
                      ],
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                      className:
                        "p-3 border-t border-gray-200/60 dark:border-white/5 bg-gray-100/10 dark:bg-black/5 flex-shrink-0 flex items-center justify-between",
                      children: [
                        /*#__PURE__*/ _jsxs("div", {
                          onClick: (e) => {
                            e.stopPropagation();
                            setIsProfilePopoverOpen((prev) => !prev);
                          },
                          className:
                            "profile-toggle-btn flex items-center gap-2.5 overflow-hidden cursor-pointer select-none hover:bg-gray-200/50 dark:hover:bg-white/5 p-1.5 rounded-[12px] transition-colors flex-1 min-w-0 pr-6 relative",
                          children: [
                            /*#__PURE__*/ _jsx("div", {
                              className:
                                "w-9 h-9 rounded-full bg-orange-700/80 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 select-none",
                              children:
                                user !== null &&
                                user !== void 0 &&
                                user.first_name
                                  ? user.first_name[0].toUpperCase()
                                  : "G",
                            }),
                            /*#__PURE__*/ _jsxs("div", {
                              className: "flex flex-col truncate",
                              children: [
                                /*#__PURE__*/ _jsx("span", {
                                  className:
                                    "text-[13.5px] font-bold text-gray-900 dark:text-white truncate",
                                  children: user
                                    ? ""
                                        .concat(user.first_name, " ")
                                        .concat(user.last_name || "")
                                        .trim()
                                    : t("aiAssistant.guestUser"),
                                }),
                                /*#__PURE__*/ _jsx("span", {
                                  className:
                                    "text-[11px] text-gray-555 dark:text-gray-400 truncate",
                                  children: user
                                    ? t("aiAssistant.personalAccount")
                                    : t("aiAssistant.freeAccess"),
                                }),
                              ],
                            }),
                            /*#__PURE__*/ _jsx(ChevronsUpDownIcon, {
                              className: "w-4 h-4 text-gray-450 dark:text-gray-500 absolute right-1.5 top-1/2 -translate-y-1/2"
                            }),
                          ],
                        }),
                        /*#__PURE__*/ _jsxs("div", {
                          className:
                            "flex items-center gap-2 flex-shrink-0 select-none",
                          children: [
                            !user &&
                              /*#__PURE__*/ _jsx("button", {
                                onClick: () => navigate("/login"),
                                className:
                                  "px-2.5 py-1 text-[11px] font-bold rounded-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-150 text-white dark:text-gray-900 border-0 cursor-pointer active:scale-95 transition-all",
                                children: "Login",
                              }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
            ],
          }),
          /*#__PURE__*/ _jsxs("div", {
            className:
              "flex-1 flex flex-col h-full bg-gray-50 dark:bg-dashboard-card relative overflow-hidden",
            children: [
              /*#__PURE__*/ _jsxs("div", {
                className:
                  "absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-6 bg-transparent z-20 pointer-events-none",
                children: [
                  /*#__PURE__*/ _jsx("div", {
                    className: "flex items-center gap-2 pointer-events-auto",
                  }),
                  /*#__PURE__*/ _jsxs("div", {
                    className: "flex items-center gap-2 pointer-events-auto",
                    children: [
                      /*#__PURE__*/ _jsx("button", {
                        onClick: resetChat,
                        title: "Reset Conversation",
                        className:
                          "p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all active:rotate-180 duration-500 bg-white/80 dark:bg-dashboard-card/80 shadow-sm backdrop-blur-md cursor-pointer flex items-center justify-center h-9 w-9 border-0",
                        children: /*#__PURE__*/ _jsx(FiRefreshCw, {
                          className: "w-4 h-4",
                        }),
                      }),
                      /*#__PURE__*/ _jsxs("button", {
                        onClick: () => navigate(previousPathRef.current),
                        className:
                          "flex items-center gap-2 px-5 py-2 text-white font-bold text-sm rounded-full shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] hover:brightness-105 border-0 cursor-pointer h-9",
                        style: {
                          backgroundColor: theme.primaryColor || "#1a73e8",
                        },
                        children: [
                          /*#__PURE__*/ _jsx(FiArrowLeft, {
                            className: "w-4 h-4 text-white",
                          }),
                          /*#__PURE__*/ _jsx("span", {
                            children: "Back to Site",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              isInitialState
                ? /*#__PURE__*/ /* CENTERED CHATGPT/CLAUDE LAYOUT FOR NEW CHATS */ _jsxs(
                    "div",
                    {
                      className:
                        "flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto px-4 md:px-6 space-y-8 animate-fade-in-up z-10",
                      children: [
                        /*#__PURE__*/ _jsxs("div", {
                          className: "text-center space-y-3",
                          children: [
                            /*#__PURE__*/ _jsx("h1", {
                              className:
                                "text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight leading-none",
                              children: getGreeting(),
                            }),
                            /*#__PURE__*/ _jsx("p", {
                              className:
                                "text-gray-500 dark:text-gray-400 text-[14.5px] font-semibold max-w-md mx-auto",
                              children:
                                t("aiAssistant.promptHelper"),
                            }),
                          ],
                        }),
                        /*#__PURE__*/ _jsx("div", {
                          className: "w-full",
                          children: renderInputBox(),
                        }),
                        /*#__PURE__*/ _jsx("div", {
                          className: "w-full",
                          children: /*#__PURE__*/ _jsx("div", {
                            className:
                              "flex flex-wrap items-center justify-center gap-2 select-none",
                            children: suggestedPrompts.map((p, i) =>
                              /*#__PURE__*/ _jsx(
                                "button",
                                {
                                  onClick: () => handleSend(p),
                                  className:
                                    "px-4 py-2 bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-full text-sm font-normal transition-all duration-200 border border-gray-200/50 dark:border-white/5 cursor-pointer active:scale-95",
                                  children: p,
                                },
                                i,
                              ),
                            ),
                          }),
                        }),
                      ],
                    },
                  )
                : /*#__PURE__*/ /* CONVERSATION HISTORY VIEWPORT */ _jsxs(
                    _Fragment,
                    {
                      children: [
                        /*#__PURE__*/ _jsx("div", {
                          className:
                            "absolute inset-0 overflow-y-auto pt-16 pb-48 custom-scrollbar-thin bg-gray-50 dark:bg-dashboard-card",
                          children: /*#__PURE__*/ _jsxs("div", {
                            className:
                              "max-w-4xl mx-auto px-4 md:px-6 space-y-8",
                            children: [
                              messages.map((m, idx) => {
                                var _user$first_name;
                                return /*#__PURE__*/ _jsxs(
                                  "div",
                                  {
                                    className: "space-y-6",
                                    children: [
                                      /*#__PURE__*/ _jsxs("div", {
                                        className:
                                          "flex gap-4 items-start animate-fade-in-up",
                                        children: [
                                          /*#__PURE__*/ _jsx("div", {
                                            className: "flex-shrink-0",
                                            children:
                                              m.role === "user"
                                                ? /*#__PURE__*/ _jsx("div", {
                                                    className:
                                                      "w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-xs",
                                                    children:
                                                      (user === null ||
                                                      user === void 0
                                                        ? void 0
                                                        : (_user$first_name =
                                                              user.first_name) ===
                                                              null ||
                                                            _user$first_name ===
                                                              void 0
                                                          ? void 0
                                                          : _user$first_name[0]) ||
                                                      "U",
                                                  })
                                                : /*#__PURE__*/ _jsx("div", {
                                                    className:
                                                      "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs",
                                                    style: {
                                                      backgroundColor:
                                                        theme.primaryColor ||
                                                        "#1a73e8",
                                                    },
                                                    children:
                                                      /*#__PURE__*/ _jsx(Logo, {
                                                        className:
                                                          "w-5 h-5 text-white",
                                                      }),
                                                  }),
                                          }),
                                          /*#__PURE__*/ _jsxs("div", {
                                            className: "flex-1 space-y-1",
                                            children: [
                                              /*#__PURE__*/ _jsx("span", {
                                                className:
                                                  "text-[11px] font-bold text-gray-400 block tracking-wider uppercase",
                                                children:
                                                  m.role === "user"
                                                    ? "You"
                                                    : "Assistant",
                                              }),
                                              /*#__PURE__*/ _jsx("div", {
                                                className:
                                                  "text-gray-800 dark:text-gray-200 leading-relaxed max-w-none",
                                                children: formatMessageText(
                                                  idx === 0 && m.role === "assistant"
                                                    ? t("aiAssistant.welcomeMessage")
                                                    : m.content,
                                                ),
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      m.listings &&
                                        m.listings.length > 0 &&
                                        /*#__PURE__*/ _jsx(ListingsCarousel, {
                                          listings: m.listings,
                                          title: "Matching Listings",
                                          icon: /*#__PURE__*/ _jsx(FiActivity, {
                                            className:
                                              "w-3.5 h-3.5 text-green-500 animate-pulse",
                                          }),
                                          savedStatus: savedStatus,
                                          setSavedStatus: setSavedStatus,
                                          theme: theme,
                                        }),
                                      m.alternatives &&
                                        m.alternatives.length > 0 &&
                                        /*#__PURE__*/ _jsx(ListingsCarousel, {
                                          listings: m.alternatives,
                                          title: "Recommended Alternatives",
                                          icon: /*#__PURE__*/ _jsx(FiInfo, {
                                            className:
                                              "w-3.5 h-3.5 text-yellow-500",
                                          }),
                                          savedStatus: savedStatus,
                                          setSavedStatus: setSavedStatus,
                                          theme: theme,
                                        }),
                                      m.compare_listings &&
                                        m.compare_listings.length > 0 &&
                                        /*#__PURE__*/ _jsxs("div", {
                                          className:
                                            "pl-12 space-y-3 overflow-x-auto",
                                          children: [
                                            /*#__PURE__*/ _jsxs("span", {
                                              className:
                                                "text-[11px] uppercase tracking-wider font-bold text-blue-500 flex items-center gap-1.5",
                                              children: [
                                                /*#__PURE__*/ _jsx(FiGrid, {
                                                  className: "w-3.5 h-3.5",
                                                }),
                                                " Side-by-Side Comparison",
                                              ],
                                            }),
                                            /*#__PURE__*/ _jsxs("table", {
                                              className:
                                                "min-w-full divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5 rounded-xl overflow-hidden bg-gray-50 dark:bg-dashboard-card text-xs",
                                              children: [
                                                /*#__PURE__*/ _jsx("thead", {
                                                  children: /*#__PURE__*/ _jsxs(
                                                    "tr",
                                                    {
                                                      className:
                                                        "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold",
                                                      children: [
                                                        /*#__PURE__*/ _jsx(
                                                          "th",
                                                          {
                                                            className:
                                                              "px-3 py-2 text-left",
                                                            children: "Feature",
                                                          },
                                                        ),
                                                        m.compare_listings.map(
                                                          (c) =>
                                                            /*#__PURE__*/ _jsx(
                                                              "th",
                                                              {
                                                                className:
                                                                  "px-3 py-2 text-left truncate max-w-[120px]",
                                                                children:
                                                                  c.title,
                                                              },
                                                              c.id,
                                                            ),
                                                        ),
                                                      ],
                                                    },
                                                  ),
                                                }),
                                                /*#__PURE__*/ _jsxs("tbody", {
                                                  className:
                                                    "divide-y divide-gray-100 dark:divide-white/5 font-semibold text-gray-800 dark:text-gray-200",
                                                  children: [
                                                    /*#__PURE__*/ _jsxs("tr", {
                                                      children: [
                                                        /*#__PURE__*/ _jsx(
                                                          "td",
                                                          {
                                                            className:
                                                              "px-3 py-2 text-gray-400",
                                                            children: "Price",
                                                          },
                                                        ),
                                                        m.compare_listings.map(
                                                          (c) =>
                                                            /*#__PURE__*/ _jsxs(
                                                              "td",
                                                              {
                                                                className:
                                                                  "px-3 py-2 text-primary-600 dark:text-primary-400 font-extrabold",
                                                                children: [
                                                                  "\u0E3F",
                                                                  c.price.toLocaleString(),
                                                                ],
                                                              },
                                                              c.id,
                                                            ),
                                                        ),
                                                      ],
                                                    }),
                                                    /*#__PURE__*/ _jsxs("tr", {
                                                      children: [
                                                        /*#__PURE__*/ _jsx(
                                                          "td",
                                                          {
                                                            className:
                                                              "px-3 py-2 text-gray-400",
                                                            children: "Size",
                                                          },
                                                        ),
                                                        m.compare_listings.map(
                                                          (c) =>
                                                            /*#__PURE__*/ _jsxs(
                                                              "td",
                                                              {
                                                                className:
                                                                  "px-3 py-2",
                                                                children: [
                                                                  c.area,
                                                                  " sqm",
                                                                ],
                                                              },
                                                              c.id,
                                                            ),
                                                        ),
                                                      ],
                                                    }),
                                                    /*#__PURE__*/ _jsxs("tr", {
                                                      children: [
                                                        /*#__PURE__*/ _jsx(
                                                          "td",
                                                          {
                                                            className:
                                                              "px-3 py-2 text-gray-400",
                                                            children:
                                                              "Bed/Bath",
                                                          },
                                                        ),
                                                        m.compare_listings.map(
                                                          (c) =>
                                                            /*#__PURE__*/ _jsxs(
                                                              "td",
                                                              {
                                                                className:
                                                                  "px-3 py-2",
                                                                children: [
                                                                  c.bedrooms,
                                                                  "B / ",
                                                                  c.bathrooms,
                                                                  "B",
                                                                ],
                                                              },
                                                              c.id,
                                                            ),
                                                        ),
                                                      ],
                                                    }),
                                                    /*#__PURE__*/ _jsxs("tr", {
                                                      children: [
                                                        /*#__PURE__*/ _jsx(
                                                          "td",
                                                          {
                                                            className:
                                                              "px-3 py-2 text-gray-400",
                                                            children: "Transit",
                                                          },
                                                        ),
                                                        m.compare_listings.map(
                                                          (c) =>
                                                            /*#__PURE__*/ _jsx(
                                                              "td",
                                                              {
                                                                className:
                                                                  "px-3 py-2",
                                                                children:
                                                                  c.station_name
                                                                    ? ""
                                                                        .concat(
                                                                          c.distance_to_station,
                                                                          "m to ",
                                                                        )
                                                                        .concat(
                                                                          c.station_name,
                                                                        )
                                                                    : "N/A",
                                                              },
                                                              c.id,
                                                            ),
                                                        ),
                                                      ],
                                                    }),
                                                  ],
                                                }),
                                              ],
                                            }),
                                          ],
                                        }),
                                    ],
                                  },
                                  idx,
                                );
                              }),
                              loading &&
                                /*#__PURE__*/ _jsxs("div", {
                                  className: "flex gap-4 items-start",
                                  children: [
                                    /*#__PURE__*/ _jsx("div", {
                                      className:
                                        "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs",
                                      style: {
                                        backgroundColor:
                                          theme.primaryColor || "#1a73e8",
                                      },
                                      children: /*#__PURE__*/ _jsx(Logo, {
                                        className: "w-5 h-5 text-white",
                                      }),
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                      className:
                                        "bg-gray-50 dark:bg-dashboard-card dark:text-gray-200 px-4 py-2.5 rounded-full rounded-tl-none border border-gray-100 dark:border-white/5 flex items-center gap-1",
                                      children: [
                                        /*#__PURE__*/ _jsx("span", {
                                          className:
                                            "w-2 h-2 rounded-full bg-gray-400 animate-bounce",
                                          style: { animationDelay: "0s" },
                                        }),
                                        /*#__PURE__*/ _jsx("span", {
                                          className:
                                            "w-2 h-2 rounded-full bg-gray-400 animate-bounce",
                                          style: { animationDelay: "0.2s" },
                                        }),
                                        /*#__PURE__*/ _jsx("span", {
                                          className:
                                            "w-2 h-2 rounded-full bg-gray-400 animate-bounce",
                                          style: { animationDelay: "0.4s" },
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              /*#__PURE__*/ _jsx("div", { ref: chatEndRef }),
                            ],
                          }),
                        }),
                        /*#__PURE__*/ _jsx("div", {
                          className:
                            "absolute bottom-0 left-0 right-0 px-4 md:px-6 pb-6 pt-2 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent dark:from-dashboard-card dark:via-dashboard-card to-transparent z-20 pointer-events-none",
                          children: /*#__PURE__*/ _jsx("div", {
                            className:
                              "max-w-4xl mx-auto w-full pointer-events-auto",
                            children: renderInputBox(),
                          }),
                        }),
                      ],
                    },
                  ),
            ],
          }),
          activeDropdownId &&
            (() => {
              const activeSessionObj = sessions.find(
                (s) => s.id === activeDropdownId,
              );
              if (!activeSessionObj) return null;
              return /*#__PURE__*/ _jsxs("div", {
                className:
                  "session-dropdown-container fixed w-52 bg-white dark:bg-dashboard-dark rounded-[16px] shadow-xl border border-gray-200/80 dark:border-white/10 p-1.5 z-[9999] text-gray-700 dark:text-gray-200 animate-fade-in",
                style: {
                  top: "".concat(dropdownCoords.top, "px"),
                  left: "".concat(dropdownCoords.left, "px"),
                },
                onClick: (e) => e.stopPropagation(),
                children: [
                  /*#__PURE__*/ _jsxs("button", {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleShareSession(activeSessionObj);
                      setActiveDropdownId(null);
                    },
                    className:
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left text-[15px] hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 text-gray-800 dark:text-gray-200 border-0 cursor-pointer rounded-[10px] font-normal",
                    children: [
                      /*#__PURE__*/ _jsx(LuShare, {
                        className:
                          "w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0",
                      }),
                      /*#__PURE__*/ _jsx("span", { children: t("aiAssistant.share") }),
                    ],
                  }),
                  /*#__PURE__*/ _jsxs("button", {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleStartRename(e, activeSessionObj);
                      setActiveDropdownId(null);
                    },
                    className:
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left text-[15px] hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 text-gray-800 dark:text-gray-200 border-0 cursor-pointer rounded-[10px] font-normal",
                    children: [
                      /*#__PURE__*/ _jsx(LuPencil, {
                        className:
                          "w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0",
                      }),
                      /*#__PURE__*/ _jsx("span", { children: t("aiAssistant.rename") }),
                    ],
                  }),
                  /*#__PURE__*/ _jsxs("button", {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleTogglePinSession(activeSessionObj.id);
                      setActiveDropdownId(null);
                    },
                    className:
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left text-[15px] hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-150 text-gray-800 dark:text-gray-200 border-0 cursor-pointer rounded-[10px] font-normal",
                    children: [
                      /*#__PURE__*/ _jsx(LuPin, {
                        className:
                          "w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 rotate-45",
                      }),
                      /*#__PURE__*/ _jsx("span", {
                        children: activeSessionObj.pinned
                          ? t("aiAssistant.unpinChat")
                          : t("aiAssistant.pinChat"),
                      }),
                    ],
                  }),
                  /*#__PURE__*/ _jsx("hr", {
                    className: "my-1 border-gray-150 dark:border-white/10",
                  }),
                  /*#__PURE__*/ _jsxs("button", {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleDeleteSession(e, activeSessionObj.id);
                      setActiveDropdownId(null);
                    },
                    className:
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left text-[15px] hover:bg-red-50 dark:hover:bg-red-950/35 text-red-600 dark:text-red-400 transition-all duration-150 font-medium border-0 cursor-pointer rounded-[10px]",
                    children: [
                      /*#__PURE__*/ _jsx(FiTrash2, {
                        className:
                          "w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0",
                      }),
                      /*#__PURE__*/ _jsx("span", { children: t("aiAssistant.deleteChat") }),
                    ],
                  }),
                ],
              });
            })(),
          isRenameModalOpen &&
            /*#__PURE__*/ _jsxs("div", {
              className:
                "fixed inset-0 z-[10000] flex items-center justify-center p-4",
              onClick: handleCancelRename,
              children: [
                /*#__PURE__*/ _jsx("div", {
                  className:
                    "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                }),
                /*#__PURE__*/ _jsxs("div", {
                  className:
                    "relative bg-white dark:bg-dashboard-card border border-gray-200/80 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-[24px] shadow-2xl p-6 w-full max-w-[400px] transform transition-all duration-300 z-10",
                  onClick: (e) => e.stopPropagation(),
                  children: [
                    /*#__PURE__*/ _jsx("button", {
                      onClick: handleCancelRename,
                      className:
                        "absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-[10px] bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-0",
                      children: /*#__PURE__*/ _jsx(FiX, {
                        className: "w-5 h-5",
                      }),
                    }),
                    /*#__PURE__*/ _jsx("h3", {
                      className: "text-[20px] font-bold mb-1.5 text-gray-900 dark:text-white",
                      children: "Edit title",
                    }),
                    /*#__PURE__*/ _jsx("p", {
                      className: "text-[14px] text-gray-500 dark:text-gray-400 mb-5",
                      children: "Please enter a new title",
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                      className: "relative mb-6",
                      children: [
                        /*#__PURE__*/ _jsx("input", {
                          type: "text",
                          value: editingTitle,
                          onChange: (e) => setEditingTitle(e.target.value),
                          onKeyDown: (e) => {
                            if (e.key === "Enter")
                              handleSaveRename(editingSessionId);
                            if (e.key === "Escape") handleCancelRename(e);
                          },
                          autoFocus: true,
                          className:
                            "w-full bg-white dark:bg-dashboard-input border border-gray-300 dark:border-white/10 rounded-[12px] pl-4 pr-10 py-2.5 text-[15px] text-gray-900 dark:text-white focus:outline-none focus:border-gray-400 focus:ring-0 transition-all peer",
                        }),
                        editingTitle &&
                          /*#__PURE__*/ _jsx("button", {
                            type: "button",
                            onMouseDown: (e) => {
                              e.preventDefault();
                              setEditingTitle("");
                            },
                            className:
                              "absolute right-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full flex items-center justify-center bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-400 hover:text-gray-600 dark:hover:text-white opacity-0 pointer-events-none peer-hover:opacity-100 peer-focus:opacity-100 hover:opacity-100 peer-hover:pointer-events-auto peer-focus:pointer-events-auto hover:pointer-events-auto transition-opacity duration-150 border-0 p-0 cursor-pointer",
                            children: /*#__PURE__*/ _jsx(FiX, {
                              className: "w-3 h-3",
                            }),
                          }),
                      ],
                    }),
                    /*#__PURE__*/ _jsxs("div", {
                      className: "flex justify-end gap-3",
                      children: [
                        /*#__PURE__*/ _jsx("button", {
                          type: "button",
                          onClick: handleCancelRename,
                          className:
                            "px-5 py-2.5 rounded-[12px] text-[14px] font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/10 bg-white dark:bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer",
                          children: "Cancel",
                        }),
                        /*#__PURE__*/ _jsx("button", {
                          type: "button",
                          onClick: () => handleSaveRename(editingSessionId),
                          className:
                            "px-5 py-2.5 rounded-[12px] text-[14px] font-semibold text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer border-0",
                          style: {
                            backgroundColor: theme.primaryColor || "#1a73e8",
                          },
                          children: "Confirm",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
                   isSearchModalOpen &&
            /*#__PURE__*/ _jsxs("div", {
              className:
                "fixed inset-0 z-[10000] flex items-start justify-center p-4 pt-[10vh]",
              onClick: () => setIsSearchModalOpen(false),
              children: [
                /*#__PURE__*/ _jsx("div", {
                  className:
                    "fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                }),
                /*#__PURE__*/ _jsxs("div", {
                  className:
                    "relative bg-white dark:bg-dashboard-card border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 rounded-[24px] shadow-2xl pt-5 pb-8 px-6 w-full max-w-[650px] h-[480px] flex flex-col transform transition-all duration-300 z-10",
                  onClick: (e) => e.stopPropagation(),
                  children: [
                    /*#__PURE__*/ _jsxs("div", {
                      className:
                        "relative flex items-center w-full mb-4 pb-2 border-b border-gray-100 dark:border-white/10",
                      children: [
                        /*#__PURE__*/ _jsx(FiSearch, {
                          className: "w-5 h-5 text-gray-400 mr-3 flex-shrink-0",
                        }),
                        /*#__PURE__*/ _jsx("input", {
                          ref: modalSearchInputRef,
                          type: "text",
                          value: searchQuery,
                          onChange: (e) => setSearchQuery(e.target.value),
                          placeholder: "Search chats...",
                          className:
                            "w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 text-lg focus:outline-none py-1.5 pr-10",
                        }),
                        /*#__PURE__*/ _jsx("button", {
                          onClick: () => setIsSearchModalOpen(false),
                          className:
                            "absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-[10px] bg-transparent hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-0",
                          children: /*#__PURE__*/ _jsx(FiX, {
                            className: "w-5 h-5",
                          }),
                        }),
                      ],
                    }),
                    /*#__PURE__*/ _jsxs("button", {
                      onClick: () => {
                        handleNewChat();
                        setIsSearchModalOpen(false);
                      },
                      className:
                        "w-full flex items-center justify-start py-2.5 px-3 rounded-[12px] bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-gray-200 border-0 transition-all font-medium text-base mb-4 cursor-pointer",
                      children: [
                        /*#__PURE__*/ _jsx("div", {
                          className:
                            "w-6 h-6 rounded-[6px] bg-gray-200 dark:bg-white/10 flex items-center justify-center mr-3 text-gray-600 dark:text-gray-400 flex-shrink-0",
                          children: /*#__PURE__*/ _jsx(FiPlus, {
                            className: "w-4 h-4",
                          }),
                        }),
                        /*#__PURE__*/ _jsx("span", { children: "New chat" }),
                      ],
                    }),
                    /*#__PURE__*/ _jsx("div", {
                      className:
                        "text-[12px] font-bold text-gray-400 tracking-wider mb-2.5 px-2 text-left uppercase select-none",
                      children:
                        searchQuery.trim() !== "" ? "Search results" : "Older",
                    }),
                    /*#__PURE__*/ _jsx("div", {
                      className:
                        "flex-1 overflow-y-auto min-h-0 pr-1 space-y-1 modal-scrollable",
                      children:
                        isSearchLoading
                          ? /*#__PURE__*/ _jsx("div", {
                              className: "space-y-2 py-1",
                              children: [0, 1, 2, 3].map((i) =>
                                /*#__PURE__*/ _jsxs(
                                  "div",
                                  {
                                    className:
                                      "w-full flex items-start gap-4 p-3 rounded-[16px]",
                                    children: [
                                      /*#__PURE__*/ _jsx("div", {
                                        className:
                                          "mt-0.5 w-[18px] h-[18px] rounded-[4px] bg-gray-200 dark:bg-white/10 animate-pulse flex-shrink-0",
                                      }),
                                      /*#__PURE__*/ _jsxs("div", {
                                        className: "flex-1 min-w-0 space-y-2",
                                        children: [
                                          /*#__PURE__*/ _jsxs("div", {
                                            className:
                                              "flex items-center justify-between gap-3",
                                            children: [
                                              /*#__PURE__*/ _jsx("div", {
                                                className:
                                                  "h-3.5 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse",
                                                style: {
                                                  width: `${55 + (i * 17) % 30}%`,
                                                  animationDelay: `${i * 80}ms`,
                                                },
                                              }),
                                              /*#__PURE__*/ _jsx("div", {
                                                className:
                                                  "h-3 w-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse flex-shrink-0",
                                                style: {
                                                  animationDelay: `${i * 80 + 40}ms`,
                                                },
                                              }),
                                            ],
                                          }),
                                          /*#__PURE__*/ _jsx("div", {
                                            className:
                                              "h-3 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse",
                                            style: {
                                              width: `${70 + (i * 11) % 25}%`,
                                              animationDelay: `${i * 80 + 80}ms`,
                                            },
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  i,
                                ),
                              ),
                            })
                          : filteredSessions.length > 0
                          ? filteredSessions.map((s) => {
                              const dateStr = formatSessionDate(s.updatedAt);
                              const snippet = getSessionSnippet(s);
                              return /*#__PURE__*/ _jsxs(
                                "div",
                                {
                                  onClick: () => {
                                    handleSelectSession(s.id);
                                    setIsSearchModalOpen(false);
                                  },
                                  className:
                                    "w-full flex items-start gap-4 p-3 rounded-[16px] hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-left cursor-pointer group",
                                  children: [
                                    /*#__PURE__*/ _jsx("div", {
                                      className:
                                        "mt-0.5 text-gray-400 flex-shrink-0",
                                      children: /*#__PURE__*/ _jsx(PiChatCircle, {
                                        className: "w-[18px] h-[18px]",
                                      }),
                                    }),
                                    /*#__PURE__*/ _jsxs("div", {
                                      className: "flex-1 min-w-0",
                                      children: [
                                        /*#__PURE__*/ _jsxs("div", {
                                          className:
                                            "flex items-center justify-between",
                                          children: [
                                            /*#__PURE__*/ _jsx("span", {
                                              className:
                                                "font-medium text-[15px] text-gray-900 dark:text-gray-100 truncate",
                                              children: s.title,
                                            }),
                                            /*#__PURE__*/ _jsx("span", {
                                              className:
                                                "text-[13px] text-gray-400 font-medium ml-2 flex-shrink-0",
                                              children: dateStr,
                                            }),
                                          ],
                                        }),
                                        snippet &&
                                          /*#__PURE__*/ _jsx("p", {
                                            className:
                                              "text-[13px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5",
                                            children: snippet,
                                          }),
                                      ],
                                    }),
                                  ],
                                },
                                s.id,
                              );
                            })
                          : /*#__PURE__*/ _jsx("div", {
                              className:
                                "text-center text-gray-400 py-8 text-sm",
                              children: "No results found",
                            }),
                    }),
                  ],
                }),
              ],
            }),
            renderProfilePopover(),
            renderSettingsModal(),
            /*#__PURE__*/ _jsx(ListingDetailModal, {
              overlayZIndex: 10100,
              isCentered: true,
              hideRelated: true,
            }),
        ],
      }),
    ],
  });
};
export default AIAssistant;
