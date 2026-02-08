
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  
  const isDark = theme === "dark";

  return (
    <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle Theme"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem',
          borderRadius: '50%',
          border: '1px solid hsl(var(--border))',
          backgroundColor: 'hsl(var(--card) / 0.6)',
          backdropFilter: 'blur(8px)',
          color: 'hsl(var(--foreground))',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--primary))';
          e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.1)';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'hsl(var(--border))';
          e.currentTarget.style.backgroundColor = 'hsl(var(--card) / 0.6)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        }}
    >
      {isDark ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
