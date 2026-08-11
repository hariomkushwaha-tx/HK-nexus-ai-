import React, { useState } from "react";
import { ActiveTab, UserSettings } from "./types";
import { Navbar } from "./components/Navbar";
import { ChatWorkspace } from "./components/ChatWorkspace";
import { VisionWorkspace } from "./components/VisionWorkspace";
import { CreativeStudioWorkspace } from "./components/CreativeStudioWorkspace";
import { VideoStudioWorkspace } from "./components/VideoStudioWorkspace";
import { SearchWorkspace } from "./components/SearchWorkspace";
import { LearningWorkspace } from "./components/LearningWorkspace";
import { CreatorHubWorkspace } from "./components/CreatorHubWorkspace";
import { SettingsModal } from "./components/SettingsModal";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chat");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [settings, setSettings] = useState<UserSettings>({
    memoryEnabled: true,
    language: "auto",
    voiceGender: "female",
    selectedVoice: "Kore",
    voiceSpeed: 1,
    autoReadResponse: false,
    aiPersona: "nexus_prime",
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        setSettings={setSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === "chat" && (
          <ChatWorkspace settings={settings} setSettings={setSettings} />
        )}

        {activeTab === "vision" && <VisionWorkspace />}

        {activeTab === "studio" && <CreativeStudioWorkspace />}

        {activeTab === "video" && <VideoStudioWorkspace />}

        {activeTab === "search" && <SearchWorkspace />}

        {activeTab === "learning" && <LearningWorkspace />}

        {activeTab === "creator" && <CreatorHubWorkspace />}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}

