import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GameEconomyProvider, useGameEconomy } from "@/contexts/GameEconomyContext";
import {
  BookOpen,
  User,
  LogOut,
  TrendingUp,
  Bot,
  Heart,
  Diamond,
  ShoppingBag,
  Trophy,
  Gamepad2,
  Target,
  ChevronDown,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TopBar = () => {
  const { hearts, gems } = useGameEconomy();
  const { user } = useAuth();

  const { data: streak } = useQuery({
    queryKey: ["user-streak", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_streaks").select("*").eq("user_id", user!.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border px-4 flex items-center justify-between md:justify-end md:left-[64px]">
      {/* Mobile logo */}
      <Link to="/learning-path" className="flex items-center gap-2 md:hidden">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-black font-display text-foreground">FinOva</span>
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-duo-orange/10">
          <Flame className="w-4 h-4 text-duo-orange" />
          <span className="text-sm font-extrabold text-duo-orange">{streak?.current_streak ?? 0}</span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-muted transition-colors">
          <Heart className="w-4 h-4 text-duo-red fill-duo-red" />
          <span className="text-sm font-extrabold text-duo-red">{hearts}</span>
        </div>
        <Link to="/shop" className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-muted transition-colors">
          <Diamond className="w-4 h-4 text-duo-blue fill-duo-blue" />
          <span className="text-sm font-extrabold text-duo-blue">{gems}</span>
        </Link>
      </div>
    </div>
  );
};

const bottomNavItems = [
  { to: "/learning-path", label: "Learn", icon: BookOpen },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/quests", label: "Quests", icon: Target },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/profile", label: "Profile", icon: User },
];

type NavItem = {
  to: string;
  label: string;
  icon: any;
  sub?: { to: string; label: string }[];
};

const sideNavItems: NavItem[] = [
  { to: "/learning-path", label: "Learn", icon: BookOpen, sub: [
    { to: "/courses", label: "Courses" },
    { to: "/mistakes", label: "Review" },
  ]},
  { to: "/games", label: "Games", icon: Gamepad2, sub: [
    { to: "/paper-trading", label: "Trade" },
  ]},
  { to: "/quests", label: "Quests", icon: Target },
  { to: "/money-coach", label: "Coach", icon: Bot },
  { to: "/shop", label: "Shop", icon: ShoppingBag },
  { to: "/profile", label: "Profile", icon: User, sub: [
    { to: "/awards", label: "Awards" },
    { to: "/rankings", label: "Rankings" },
  ]},
];

const AppLayoutInner = () => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <GameEconomyProvider>
      <div className="flex min-h-screen bg-background">
        {/* Persistent top bar — always visible */}
        <TopBar />

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[64px] hover:w-[200px] group/sidebar flex-col border-r border-border bg-background py-3 px-2 fixed left-0 top-0 bottom-0 z-40 transition-all duration-200 overflow-hidden">
          <Link to="/learning-path" className="flex items-center gap-2 px-1.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-black font-display text-foreground opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">FinOva</span>
          </Link>

          <nav className="flex-1 space-y-0.5 overflow-y-auto">
            {sideNavItems.map(({ to, label, icon: Icon, sub }) => {
              const active = location.pathname === to || (location.pathname.startsWith(to) && to !== "/profile");
              const subActive = sub?.some(s => location.pathname === s.to || location.pathname.startsWith(s.to));
              const expanded = active || subActive;
              return (
                <div key={to}>
                  <Link
                    to={to}
                    title={label}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm font-bold transition-all",
                      active || subActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap flex-1">{label}</span>
                    {sub && (
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 shrink-0 opacity-0 group-hover/sidebar:opacity-100 transition-all duration-200",
                        expanded ? "rotate-180 text-primary" : "text-muted-foreground"
                      )} />
                    )}
                  </Link>
                  {sub && expanded && (
                    <div className="space-y-0.5 mt-0.5">
                      {sub.map(s => (
                        <Link key={s.to} to={s.to}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                            location.pathname === s.to ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            location.pathname === s.to ? "bg-primary" : "bg-border"
                          )} />
                          <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200">{s.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <button
            onClick={signOut}
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">Sign Out</span>
          </button>
        </aside>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background px-2 py-1.5 flex justify-around safe-area-bottom">
          {bottomNavItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (location.pathname.startsWith(to) && to !== "/profile");
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-3 text-[10px] font-bold transition-colors rounded-xl",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", active && "scale-110")} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0 pt-14 md:ml-[64px]">
          <div className="max-w-2xl mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </GameEconomyProvider>
  );
};

const AppLayout = () => <AppLayoutInner />;

export default AppLayout;
