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
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/learning-path", label: "Learn", icon: Map },
  { to: "/quests", label: "Quests", icon: Target },
  { to: "/rankings", label: "Rank", icon: Trophy },
  { to: "/mistakes", label: "Review", icon: AlertTriangle },
  { to: "/awards", label: "Awards", icon: Award },
  { to: "/profile", label: "Profile", icon: User },
];

const HeartsGemsBar = () => {
  const { hearts, maxHearts, gems } = useGameEconomy();

  return (
    <Link to="/shop" className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-secondary transition-colors">
      <div className="flex items-center gap-1">
        <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        <span className="text-xs font-bold text-red-600">{hearts}</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-1">
        <Diamond className="w-4 h-4 text-cyan-500 fill-cyan-500" />
        <span className="text-xs font-bold text-cyan-600">{gems}</span>
      </div>
    </Link>
  );
};

const AppLayoutInner = () => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <GameEconomyProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="hidden md:flex w-[220px] flex-col border-r border-border bg-card p-4">
          <Link to="/" className="flex items-center gap-2.5 px-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-extrabold font-display text-foreground">Finova</span>
          </Link>

          {/* Hearts & Gems in sidebar */}
          <div className="px-3 mb-4">
            <HeartsGemsBar />
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              );
            })}
            <Link
              to="/shop"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                location.pathname === "/shop"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <ShoppingBag className="w-5 h-5" />
              Shop
            </Link>
          </nav>

          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </aside>

        {/* Mobile top bar for hearts/gems */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-card px-4 py-2 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-extrabold font-display text-foreground">Finova</span>
          </Link>
          <HeartsGemsBar />
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card px-2 py-1.5 flex justify-around safe-area-bottom">
          {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[5]].map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 px-3 text-[10px] font-semibold transition-colors rounded-xl",
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
        <main className="flex-1 overflow-auto pb-20 md:pb-0 pt-14 md:pt-0">
          <div className="max-w-4xl mx-auto p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </GameEconomyProvider>
  );
};

const AppLayout = () => <AppLayoutInner />;

export default AppLayout;
