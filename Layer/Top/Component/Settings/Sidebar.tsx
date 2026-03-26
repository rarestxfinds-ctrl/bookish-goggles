import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/Top/Component/UI/scroll-area";
import { useApp } from "@/Middle/Context/App-Context";
import { useAuth } from "@/Middle/Context/Auth-Context";
import { useTranslation } from "@/Middle/Hook/Use-Translation";
import { useIsMobile } from "@/Middle/Hook/Use-Mobile";
import { toast } from "sonner";
import { cn } from "@/Middle/Library/utils";
import { User, Type, Globe, ChevronRight, ArrowLeft } from "lucide-react";
import { AccountSection } from "./Content/Account";
import { QuranSection } from "./Content/Quran";
import { LanguageSection } from "./Content/Language";
import { SETTINGS_CATEGORIES } from "./Constants";
import type { SettingsCategory, SettingsSidebarProps } from "./Types";

const CATEGORY_ICONS = { User, Type, Globe };

export function SettingsSidebar({ compact = false }: SettingsSidebarProps) {
  const { isSettingsSidebarOpen, setSettingsSidebarOpen } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("quran");
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  const handleClose = () => {
    setSettingsSidebarOpen(false);
    setActiveCategory("quran");
    setShowMobileMenu(true);
  };

  const renderContent = () => {
    switch (activeCategory) {
      case "account": {
        const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "User";
        const initials = displayName.slice(0, 2).toUpperCase();
        const handleSignOut = async () => {
          await signOut();
          toast.success("Signed out successfully");
          setSettingsSidebarOpen(false);
        };
        return (
          <AccountSection
            user={user}
            displayName={displayName}
            initials={initials}
            handleSignOut={handleSignOut}
            navigate={navigate}
            setSettingsSidebarOpen={setSettingsSidebarOpen}
          />
        );
      }
      case "quran":
        return <QuranSection />;
      case "language":
        return <LanguageSection onSelect={() => setActiveCategory("quran")} />;
      default:
        return null;
    }
  };

  if (!isSettingsSidebarOpen) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-40 bg-background pt-[60px]">
        <ScrollArea className="h-full">
          <div className="p-4">
            {showMobileMenu ? (
              <div className="space-y-1">
                {SETTINGS_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS];
                  return (
                    <button
                      key={cat.id}
                      onClick={() => { setActiveCategory(cat.id); setShowMobileMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-4 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground flex-1">{cat.label}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="flex items-center gap-2 mb-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Settings</span>
                </button>
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.label}
                </h2>
                {renderContent()}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 bg-background pt-[72px] pb-6">
      <div className="h-full flex">
        <div className="shrink-0 w-52 h-full flex flex-col pt-6 pl-6 pb-6">
          <div className="glass-sidebar flex-1 p-2 flex flex-col">
            <div className="space-y-1 flex-1 py-8">
              {SETTINGS_CATEGORIES.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.icon as keyof typeof CATEGORY_ICONS];
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 rounded-full px-3 py-2.5 text-left transition-all cursor-pointer",
                      activeCategory === cat.id
                        ? "bg-primary/15 text-primary"
                        : "hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", activeCategory === cat.id ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 h-full">
          <div className="p-6 max-w-2xl text-left">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              {SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h2>
            {renderContent()}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}