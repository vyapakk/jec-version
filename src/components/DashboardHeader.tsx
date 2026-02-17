import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, User, Check, X, BarChart3, Database, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import stratviewLogo from "@/assets/stratview-logo.png";
import { categories } from "@/data/datasets";
import { activeDashboardRoutes } from "@/data/dashboardRoutes";

interface SearchResult {
  type: "dataset" | "dashboard";
  name: string;
  category: string;
  datasetId: string;
  dashboardId?: string;
  purchased?: boolean;
  route?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "update" | "alert" | "info";
}

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "New Dataset Available",
    message: "Carbon Fiber Market Q4 2024 data has been updated.",
    time: "2 hours ago",
    read: false,
    type: "update",
  },
  {
    id: "2",
    title: "Subscription Expiring",
    message: "Your Aircraft Interiors subscription expires in 7 days.",
    time: "1 day ago",
    read: false,
    type: "alert",
  },
  {
    id: "3",
    title: "New Dashboard Added",
    message: "EV Battery Market dashboard now includes regional forecasts.",
    time: "3 days ago",
    read: true,
    type: "info",
  },
];

const DashboardHeader = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    const results: SearchResult[] = [];

    for (const cat of categories) {
      for (const ds of cat.datasets) {
        // Match dataset name
        if (ds.name.toLowerCase().includes(q)) {
          results.push({
            type: "dataset",
            name: ds.name,
            category: cat.title,
            datasetId: ds.id,
          });
        }
        // Match individual dashboards
        for (const db of ds.dashboards) {
          if (db.name.toLowerCase().includes(q)) {
            results.push({
              type: "dashboard",
              name: db.name,
              category: cat.title,
              datasetId: ds.id,
              dashboardId: db.id,
              purchased: db.purchased,
              route: activeDashboardRoutes[db.id],
            });
          }
        }
      }
    }
    return results.slice(0, 10); // cap at 10 results
  }, [searchQuery]);

  const handleResultClick = (result: SearchResult) => {
    setSearchQuery("");
    setSearchOpen(false);
    if (result.type === "dataset") {
      navigate(`/dataset/${result.datasetId}`);
    } else if (result.purchased && result.route) {
      navigate(result.route);
    } else {
      navigate(`/dataset/${result.datasetId}`);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "update":
        return "bg-primary/10 text-primary";
      case "alert":
        return "bg-destructive/10 text-destructive";
      case "info":
        return "bg-muted text-muted-foreground";
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={stratviewLogo}
            alt="Stratview Research"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </div>

        {/* Search */}
        <div className="hidden md:flex flex-1 mx-8" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search datasets, dashboards..."
              className="pl-10 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-card transition-all"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
            />
            {searchOpen && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                ) : (
                  <ScrollArea className="max-h-[320px]">
                    <div className="py-1">
                      {searchResults.map((result, i) => (
                        <button
                          key={`${result.type}-${result.dashboardId || result.datasetId}-${i}`}
                          onClick={() => handleResultClick(result)}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground">
                            {result.type === "dataset" ? (
                              <Database className="h-4 w-4" />
                            ) : (
                              <BarChart3 className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {result.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {result.category} · {result.type === "dataset" ? "Dataset" : "Dashboard"}
                            </p>
                          </div>
                          {result.type === "dashboard" && !result.purchased && (
                            <Lock className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h4 className="font-semibold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-foreground h-auto py-1 px-2"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`group relative px-4 py-3 hover:bg-muted/50 transition-colors ${
                          !notification.read ? "bg-primary/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full p-1.5 ${getTypeStyles(notification.type)}`}>
                            <Bell className="h-3 w-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground/70 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              onClick={() => dismissNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden md:inline text-sm font-medium">John Doe</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
