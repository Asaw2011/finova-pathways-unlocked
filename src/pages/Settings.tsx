import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Bell, BellOff, Volume2, VolumeX, Shield, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeMode = "light" | "dark" | "system";

const getStoredTheme = (): ThemeMode => (localStorage.getItem("monucate-theme") as ThemeMode) || "light";

const applyTheme = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

const Settings = () => {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);
  const [notifications, setNotifications] = useState(() => localStorage.getItem("monucate-notifications") !== "off");
  const [sounds, setSounds] = useState(() => localStorage.getItem("monucate-sounds") !== "off");

  useEffect(() => {
    localStorage.setItem("monucate-theme", theme);
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("monucate-notifications", notifications ? "on" : "off");
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("monucate-sounds", sounds ? "on" : "off");
  }, [sounds]);

  const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold font-display mb-1">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your Monucate experience.</p>
      </div>

      {/* Appearance */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-bold font-display text-sm flex items-center gap-2">
          <Sun className="w-4 h-4 text-primary" /> Appearance
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-bold",
                theme === value
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/50"
              )}
            >
              <Icon className="w-6 h-6" />
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-bold font-display text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" /> Notifications
        </h2>
        <ToggleRow
          icon={notifications ? Bell : BellOff}
          label="Push notifications"
          description="Daily reminders, streak alerts, and quest updates"
          checked={notifications}
          onChange={setNotifications}
        />
      </section>

      {/* Sound */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <h2 className="font-bold font-display text-sm flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-primary" /> Sound
        </h2>
        <ToggleRow
          icon={sounds ? Volume2 : VolumeX}
          label="Game sounds"
          description="Sound effects during games and interactions"
          checked={sounds}
          onChange={setSounds}
        />
      </section>

      {/* About */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-bold font-display text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-primary" /> About
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-semibold text-foreground">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Platform</span>
            <span className="font-semibold text-foreground">Monucate Web</span>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-bold font-display text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Privacy
        </h2>
        <p className="text-xs text-muted-foreground">
          Your data is stored securely. We never share your personal information with third parties.
          Read our full privacy policy on the Disclaimers page.
        </p>
      </section>
    </div>
  );
};

const ToggleRow = ({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: typeof Bell;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    onClick={() => onChange(!checked)}
    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
  >
    <Icon className={cn("w-5 h-5 shrink-0", checked ? "text-primary" : "text-muted-foreground")} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold">{label}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <div className={cn(
      "w-10 h-6 rounded-full flex items-center px-0.5 transition-colors shrink-0",
      checked ? "bg-primary" : "bg-muted"
    )}>
      <div className={cn(
        "w-5 h-5 rounded-full bg-white shadow transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </div>
  </button>
);

export default Settings;
