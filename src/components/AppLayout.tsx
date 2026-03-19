import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GameEconomyProvider, useGameEconomy } from "@/contexts/GameEconomyContext";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  LogOut,
  TrendingUp,
  Map,
  Library,
  Bot,
  Heart,
  Diamond,
  ShoppingBag,
  Target,
  Trophy,
  AlertTriangle,
  BarChart3,
  Gamepad2,
  Home,
  Search,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TopBar = () => {
  const { hearts, maxHearts, gems } = useGameEconomy();
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
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border px-4 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-black font-display text-foreground hidden sm:inline">FinOva</span>
      </Link>

      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-duo-orange/10">
        <span className="text-base">🔥</span>
        <span className="text-sm font-extrabold text-duo-orange">{streak?.current_streak ?? 0}</span>
      </div>

      <div className="flex items-center gap-3">
        <Link to="/shop" className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-muted transition-colors">
          <Diamond className="w-4 h-4 text-duo-blue fill-duo-blue" />
          <span className="text-sm font-extrabold text-duo-blue">{gems}</span>
        </Link>
        <Link to="/shop" className="flex items-center gap-1 px-2.5 py-1 rounded-xl hover:bg-muted transition-colors">
          <Heart className="w-4 h-4 text-duo-red fill-duo-red" />
          <span className="text-sm font-extrabold text-duo-red">{hearts}</span>
        </Link>
      </div>
    </div>
  );
};

const bottomNavItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/learning-path", label: "Learn", icon: BookOpen },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/rankings", label: "League", icon: Trophy },
  { to: "/profile", label: "Profile", icon: User },
];

type NavItem = {
  to: string;
  label: string;
  icon: any;
  sub?: { to: string; label: string }[];
};

const sideNavItems: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/learning-path", label: "Learn", icon: BookOpen, sub: [
    { to: "/courses", label: "Courses" },
    { to: "/quests", label: "Quests" },
    { to: "/mistakes", label: "Review" },
  ]},
  { to: "/money-coach", label: "Coach", icon: Bot },
  { to: "/games", label: "Games", icon: Gamepad2 },
  { to: "/rankings", label: "League", icon: Trophy, sub: [
    { to: "/awards", label: "Awards" },
  ]},
  { to: "/paper-trading", label: "Trade", icon: BarChart3, sub: [
    { to: "/shop", label: "Shop" },
  ]},
  { to: "/profile", label: "Profile", icon: User },
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
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-[64px] hover:w-[200px] group/sidebar flex-col border-r border-border bg-background py-3 px-2 fixed left-0 top-0 bottom-0 z-40 transition-all duration-200 overflow-hidden">
          <Link to="/dashboard" className="flex items-center gap-2 px-1.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-black font-display text-foreground opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">FinOva</span>
          </Link>

          <nav className="flex-1 space-y-0.5">
            {sideNavItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  title={label}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm font-bold transition-all",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-200 whitespace-nowrap">{label}</span>
                </Link>
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

        {/* Mobile Top Bar */}
        <div className="md:hidden">
          <TopBar />
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background px-2 py-1.5 flex justify-around safe-area-bottom">
          {bottomNavItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
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
        <main className="flex-1 overflow-auto pb-20 md:pb-0 pt-14 md:pt-0 md:ml-[64px]">
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
