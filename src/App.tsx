import React, { useState, useEffect } from "react";
import { ActiveTab, UserSettings } from "./types";
import { Navbar } from "./components/Navbar";
import { ChatWorkspace } from "./components/ChatWorkspace";
import { VisionWorkspace } from "./components/VisionWorkspace";
import { CreativeStudioWorkspace } from "./components/CreativeStudioWorkspace";
import { SearchWorkspace } from "./components/SearchWorkspace";
import { LearningWorkspace } from "./components/LearningWorkspace";
import { CreatorHubWorkspace } from "./components/CreatorHubWorkspace";
import { SettingsModal } from "./components/SettingsModal";
import { PolicyModal, PolicyTab } from "./components/PolicyModal";
import { Footer } from "./components/Footer";

const DEFAULT_SETTINGS: UserSettings = {
  memoryEnabled: true,
  language: "auto",
  voiceGender: "female",
  selectedVoice: "Kore",
  voiceSpeed: 1,
  autoReadResponse: false,
  aiPersona: "nexus_prime",
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [initialSearchQuery, setInitialSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>("privacy");
  const newChatRef = React.useRef<(() => void) | null>(null);

  const handleOpenPolicy = (tab: PolicyTab = "privacy") => {
    setPolicyTab(tab);
    setIsPolicyOpen(true);
  };

  // Check URL parameters on initial load (for Google Search / Deep Links / AdSense Reviewers)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as ActiveTab;
      const queryParam = params.get("q");
      const policyParam = (params.get("policy") || params.get("page") || params.get("p")) as PolicyTab;

      if (tabParam && ["chat", "vision", "studio", "search", "learning", "creator"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      if (queryParam) {
        setInitialSearchQuery(queryParam);
        if (!tabParam) setActiveTab("search");
      }
      if (policyParam && ["about", "privacy", "terms", "contact", "disclaimer", "faq", "guide"].includes(policyParam)) {
        setPolicyTab(policyParam);
        setIsPolicyOpen(true);
      }
    } catch (e) {
      console.warn("URL params parsing error:", e);
    }
  }, []);

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem("hk_nexus_user_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings whenever changed
  useEffect(() => {
    try {
      localStorage.setItem("hk_nexus_user_settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  }, [settings]);

  return (
    <div className="min-h-[100dvh] h-[100dvh] bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        setSettings={setSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={() => newChatRef.current?.()}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === "chat" && (
          <ChatWorkspace 
            settings={settings} 
            setSettings={setSettings} 
            onOpenSettings={() => setIsSettingsOpen(true)}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            onNewChatRef={newChatRef}
            onOpenPolicy={handleOpenPolicy}
          />
        )}

        {activeTab === "vision" && <VisionWorkspace />}

        {activeTab === "studio" && <CreativeStudioWorkspace />}

        {activeTab === "search" && (
          <SearchWorkspace
            initialQuery={initialSearchQuery}
            customGroqKey={settings.customGroqApiKey}
            customGeminiKey={settings.customGeminiApiKey}
          />
        )}

        {activeTab === "learning" && <LearningWorkspace />}

        {activeTab === "creator" && <CreatorHubWorkspace onOpenPolicy={handleOpenPolicy} />}
      </main>

      {/* Global AdSense and Policy Footer (Visible on all non-chat tabs) */}
      {activeTab !== "chat" && <Footer onOpenPolicy={handleOpenPolicy} />}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />

      {/* Official Legal & Policy Modal (Privacy Policy, Terms, About, FAQ, Contact) */}
      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        initialTab={policyTab}
      />
    </div>
  );
}

