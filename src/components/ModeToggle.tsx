
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  
  const isDark = theme === "dark";

  return (
    <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className="theme-toggle"
        aria-label="Toggle Theme"
    >
      <div className={`icon-container ${isDark ? 'dark-active' : 'light-active'}`}>
        <Sun className="icon sun" size={20} />
        <Moon className="icon moon" size={20} />
      </div>
    </button>
  );
}
