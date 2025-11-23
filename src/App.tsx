import { useState, useEffect, Suspense, lazy } from "react";
import { AppProvider, useApp } from "./contexts/AppContext";
import { Navigation } from "./components/Navigation";
const HomePage = lazy(() => import("./components/HomePage").then(m => ({ default: m.HomePage })));
const ExplorePage = lazy(() => import("./components/ExplorePage").then(m => ({ default: m.ExplorePage })));
const CreatePromptPage = lazy(() => import("./components/CreatePromptPage").then(m => ({ default: m.CreatePromptPage })));
const PromptDetailPage = lazy(() => import("./components/PromptDetailPage").then(m => ({ default: m.PromptDetailPage })));
const UserProfilePage = lazy(() => import("./components/UserProfilePage").then(m => ({ default: m.UserProfilePage })));
const SettingsPage = lazy(() => import("./components/SettingsPage").then(m => ({ default: m.SettingsPage })));
const ReposPage = lazy(() => import("./components/ReposPage").then(m => ({ default: m.ReposPage })));
const RepoDetailPage = lazy(() => import("./components/RepoDetailPage").then(m => ({ default: m.RepoDetailPage })));
const AboutPage = lazy(() => import("./components/AboutPage").then(m => ({ default: m.default || m }))); // support both default & named
const PrivacyPage = lazy(() => import("./components/PrivacyPage").then(m => ({ default: m.default || m }))); // support both default & named
const TermsPage = lazy(() => import("./components/TermsPage").then(m => ({ default: m.default || m }))); // support both default & named
const AuthModal = lazy(() => import("./components/AuthModal").then(m => ({ default: m.AuthModal })));
import { Footer } from "./components/Footer";
import { Prompt } from "./lib/types";
const CreateRepoModal = lazy(() => import("./components/CreateRepoModal").then(m => ({ default: m.default || m })));
import { prompts as promptsApi } from "./lib/api";
import { updateUrl, getCurrentPageFromUrl, Page } from "./lib/routing";

function AppContent() {
  const { state, dispatch } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>({ type: "home" });
  const [isCreateRepoOpen, setIsCreateRepoOpen] = useState(false);
  const [repoRefreshTrigger, setRepoRefreshTrigger] = useState(0);

  // Initialize page from URL on mount
  useEffect(() => {
    const pageFromUrl = getCurrentPageFromUrl();
    setCurrentPage(pageFromUrl);
  }, []);

  // Update URL when page changes
  useEffect(() => {
    updateUrl(currentPage);
  }, [currentPage]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pageFromUrl = getCurrentPageFromUrl();
      setCurrentPage(pageFromUrl);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
 
    /** ---------- Color Contrast Debug ---------- */
  try {
    const getLuminance = (hex: string) => {
    if (!hex || !hex.startsWith("#") || hex.length !== 7) return 0;
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      const [rr, gg, bb] = [r, g, b].map((c) =>
        c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      );
      return 0.2126 * rr + 0.7152 * gg + 0.0722 * bb;
    };
    const getContrast = (c1: string, c2: string) => {
      const l1 = getLuminance(c1);
      const l2 = getLuminance(c2);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    
   if (typeof document !== "undefined") {
      const root = document.documentElement;
      const primary = getComputedStyle(root).getPropertyValue("--primary").trim();
      const background = getComputedStyle(root).getPropertyValue("--background").trim();

      if (primary.startsWith("#") && background.startsWith("#")) {
        const contrast = getContrast(primary, background);
         console.log("Primary contrast ratio:", contrast.toFixed(2));

        const accent = getComputedStyle(root).getPropertyValue("--accent").trim();
        if (accent.startsWith("#")) {
          const accentContrast = getContrast(accent, background);
          console.log("Accent on background contrast ratio:", accentContrast.toFixed(2));
        }
      }
    }
  } catch (err) {
    console.warn("Color contrast check failed:", err);
  }

console.log("AppContent rendering, state:", state);

  /** ---------- Navigation Handlers ---------- */
  const handleAuthClick = () => setIsAuthModalOpen(true);
 
  const handleGetStarted = () => {
    if (state.user) {
       setCurrentPage({ type: "create" });
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleExplore = (searchQuery?: string) => {
      setCurrentPage({ type: "explore", searchQuery });
  };

  const handleExplorePrompts = () => {
    setCurrentPage({ type: "repos" });
  };

  const handlePromptClick = (promptId: string) => {
    const from = currentPage.type as "home" | "explore" | "repos" | "my-repo" | "repo" | "profile";
    const repoId = currentPage.type === "repo" ? currentPage.repoId : undefined;
    setCurrentPage({ type: "prompt", promptId, from, repoId });
  };

  const handleEditPrompt = async (prompt: Prompt) => {
    try {
      const { data: fullPromptData, error } = await promptsApi.getById(prompt.id);
      if (error || !fullPromptData) {
        console.error("Error loading full prompt data:", error);
        setCurrentPage({ type: "create", editingPrompt: prompt });
        return;
      }

     const f: any = fullPromptData as any;
      const fullPrompt: Prompt = {
        repoId: f.repo_id || '',
        id: f.id,
        userId: f.user_id,
        title: fullPromptData.title,
        slug: fullPromptData.slug,
        description: f.description,
        content: f.content,
        type: f.type,
        modelCompatibility: f.model_compatibility,
        tags: f.tags,
        visibility: f.visibility,
        category: f.category,
        language: f.language,
        version: f.version,
        parentId: f.parent_id || undefined,
        viewCount: f.view_count,
        hearts: f.hearts,
        saveCount: f.save_count,
        forkCount: f.fork_count,
        commentCount: f.comment_count,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
        attachments: [],
        author: f.profiles
          ? {
              id: f.profiles.id,
              username: f.profiles.username,
              email: f.profiles.email || "",
              name: f.profiles.name,
              bio: f.profiles.bio || undefined,
              website: f.profiles.website || undefined,
              github: f.profiles.github || undefined,
              twitter: f.profiles.twitter || undefined,
              reputation: 0,
              createdAt: f.profiles.created_at || f.created_at,
              lastLogin: f.profiles.created_at || f.created_at,
              badges: [],
              skills: [],
              role: f.profiles.role || "general",
              subscriptionStatus: f.profiles.subscription_status || "active",
              saveCount: 0,
            }
          : {
              id: f.user_id,
              username: "user",
              name: "User",
              reputation: 0,
              createdAt: f.created_at,
              lastLogin: f.created_at,
              badges: [],
              skills: [],
              role: "general",
              subscriptionStatus: "active",
              saveCount: 0,
            },
        images:
          f.prompt_images?.map((img: any) => ({
            id: img.id,
            url: img.url,
            altText: img.alt_text,
            isPrimary: img.is_primary,
            size: img.size,
            mimeType: img.mime_type,
            width: img.width || undefined,
            height: img.height || undefined,
            caption: img.caption || undefined,
          })) || [],
          isHearted: false,
        isSaved: false,
        isForked: false,
        template: f.template || undefined,
      };

      setCurrentPage({ type: "create", editingPrompt: fullPrompt });
    } catch (err) {
    console.error("Error in handleEditPrompt:", err);
      setCurrentPage({ type: "create", editingPrompt: prompt });
    }
  };

  const handleDeletePrompt = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) return
    
    try {
      const { error } = await promptsApi.delete(promptId)
      if (error) {
        alert('Failed to delete prompt: ' + ((error as any)?.message || 'Unknown error'))
        return
      }
      
      // Remove the deleted prompt from local state
      dispatch({ type: 'DELETE_PROMPT', payload: promptId })
      
      // Trigger refresh of repo data if we're on a repo page
      if (currentPage.type === 'repo') {
        setRepoRefreshTrigger(prev => prev + 1)
      }
    } catch (err) {
      alert('Failed to delete prompt')
    }
  }

  const handleProfileClick = (userId: string, tab?: string) => {
    setCurrentPage({ type: "profile", userId, tab });
  };
  const handleMyPromptsClick = () => {
    if (state.user) {
      setCurrentPage({ type: "my-prompts", userId: state.user.id });
    }
  };

  const handleSettingsClick = () => {
    // Navigate to dedicated Settings page
    setCurrentPage({ type: "settings" })
  };

  const handleBack = () => setCurrentPage({ type: "home" });

  const handlePromptBack = () => {
    // First, check if the current prompt belongs to a repo
    if (currentPage.type === "prompt") {
      const currentPrompt = state.prompts.find(p => p.id === currentPage.promptId)
      if (currentPrompt?.repoId) {
        // If prompt belongs to a repo, go back to that repo
        setCurrentPage({ type: "repo", repoId: currentPrompt.repoId });
        return;
      }
    }

    // Fallback to original logic if no repoId or prompt not found
    if (currentPage.type === "prompt" && currentPage.from) {
      switch (currentPage.from) {
        case "repo":
          if (currentPage.repoId) {
            setCurrentPage({ type: "repo", repoId: currentPage.repoId });
          } else {
            setCurrentPage({ type: "explore" });
          }
          break;
        case "home":
          setCurrentPage({ type: "home" });
          break;
        case "explore":
          setCurrentPage({ type: "explore" });
          break;
        case "repos":
          setCurrentPage({ type: "repos", userId: state.user?.id });
          break;
        case "my-repo":
          setCurrentPage({ type: "my-repo", userId: state.user?.id });
          break;
        case "my-prompts":
          setCurrentPage({ type: "my-prompts", userId: state.user?.id });
          break;
        case "profile":
          setCurrentPage({ type: "profile", userId: state.user?.id || "" });
          break;
        case "create":
          setCurrentPage({ type: "home" }); // Go to home after creating a prompt
          break;
        default:
          setCurrentPage({ type: "home" });
      }
    } else {
      setCurrentPage({ type: "home" });
    }
  };

  const handleReposClick = () => {
    setCurrentPage({ type: "repos", userId: state.user?.id });
  };

  const handleMyRepoClick = () => {
    setCurrentPage({ type: "my-repo", userId: state.user?.id });
  };
 
   const handleRepoClick = (repoId: string, from?: "explore" | "repos" | "my-repo") => {
    setCurrentPage({ type: "repo", repoId, from });
  };

   const handleRepoBackClick = () => {
    // Go back to the appropriate page based on where we came from
    if (currentPage.type === "repo" && currentPage.from === "my-repo") {
      setCurrentPage({ type: "my-repo", userId: state.user?.id });
    } else {
      setCurrentPage({ type: "explore" });
    }
  };

  const handleCreateRepo = () => {
    if (!state.user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsCreateRepoOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation
        user={state.user}
        onAuthClick={handleAuthClick}


        
        onProfileClick={() =>
          state.user && handleProfileClick(state.user.id)
        }
        onCreateClick={handleCreateRepo}
        onExploreClick={handleExplore}
        onReposClick={handleReposClick}
        onMyRepoClick={handleMyRepoClick}
         onHomeClick={() => setCurrentPage({ type: "home" })}
        onMyPromptsClick={handleMyPromptsClick}
        onSettingsClick={handleSettingsClick}
      />
      
      <main>
        <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center">Loading...</div>}>
         {currentPage.type === "home" && (
          <HomePage
            user={state.user}
            onGetStarted={handleGetStarted}
            onCreateRepo={handleCreateRepo}
            onExplorePrompts={handleExplorePrompts}
            onPromptClick={handlePromptClick}
          />
        )}
        
        {currentPage.type === "explore" && (
          <ExplorePage
            onBack={handleBack}
             onRepoClick={(repoId: string) => handleRepoClick(repoId, "explore")}
            onPromptClick={handlePromptClick}
            initialSearchQuery={currentPage.searchQuery}
          />
        )}
        
         {currentPage.type === "repos" && (
          <ReposPage
            userId={currentPage.userId}
            onPromptClick={handlePromptClick}
            mode="prompts"
          />
        )}

        {currentPage.type === "my-repo" && (
          <ReposPage
            userId={currentPage.userId}
            onRepoClick={(repoId: string) => handleRepoClick(repoId, "my-repo")}
            onCreateRepo={handleCreateRepo}
            mode="repos"
          />
        )}

        {currentPage.type === "my-prompts" && (
          <ReposPage
            userId={currentPage.userId}
            onPromptClick={handlePromptClick}
            mode="my-prompts"
          />
        )}

        {currentPage.type === "repo" && (
          <RepoDetailPage
            repoId={currentPage.repoId}
            userId={state.user?.id}
            onBack={handleRepoBackClick}
            onPromptClick={handlePromptClick}
            onCreatePrompt={() => setCurrentPage({ type: "create", repoId: currentPage.repoId })}
            onEditPrompt={async (promptId: string) => {
              try {
                const { data, error } = await promptsApi.getById(promptId)
                if (error || !data) {
                  alert('Failed to load prompt for editing')
                  return
                }
                // Convert the API response to Prompt type
                const prompt: Prompt = {
                  id: data.id,
                  repoId: (data as any).repo_id || '',
                  userId: (data as any).user_id,
                  title: data.title,
                  slug: data.slug,
                  description: (data as any).description,
                  content: (data as any).content,
                  type: (data as any).type || 'text',
                  modelCompatibility: (data as any).model_compatibility || [],
                  tags: (data as any).tags || [],
                  visibility: (data as any).visibility || 'public',
                  category: (data as any).category || 'other',
                  language: (data as any).language,
                  version: (data as any).version || '1.0.0',
                  parentId: (data as any).parent_id,
                  viewCount: (data as any).view_count || 0,
                  hearts: (data as any).hearts || 0,
                  saveCount: (data as any).save_count || 0,
                  forkCount: (data as any).fork_count || 0,
                  commentCount: (data as any).comment_count || 0,
                  createdAt: (data as any).created_at,
                  updatedAt: (data as any).updated_at,
                  author: (data as any).profiles ? {
                    id: (data as any).profiles.id,
                    username: (data as any).profiles.username,
                    name: (data as any).profiles.full_name || (data as any).profiles.username,
                    email: (data as any).profiles.email,
                    role: (data as any).profiles.role as any,
                    reputation: 0,
                    createdAt: (data as any).profiles.created_at,
                    lastLogin: (data as any).profiles.created_at,
                    subscriptionStatus: 'active',
                    saveCount: 0,
                  } : {
                    id: (data as any).user_id,
                    username: 'user',
                    name: 'User',
                    role: 'general',
                    reputation: 0,
                    createdAt: (data as any).created_at,
                    lastLogin: (data as any).created_at,
                    subscriptionStatus: 'active',
                    saveCount: 0,
                  },
                  isHearted: false,
                  isSaved: false,
                  isForked: false,
                }
                await handleEditPrompt(prompt)
              } catch (err) {
                alert('Failed to load prompt for editing')
              }
            }}
            onDeletePrompt={(promptId: string) => handleDeletePrompt(promptId)}
            refreshTrigger={repoRefreshTrigger}
          />
        )}

        {currentPage.type === "create" && (
          <CreatePromptPage
            onBack={currentPage.editingPrompt ? () => setCurrentPage({ type: "prompt", promptId: currentPage.editingPrompt!.id, from: "create" }) : handleBack}
            editingPrompt={currentPage.editingPrompt}
            repoId={currentPage.repoId}
            onPublish={(isNewPrompt: boolean, promptId?: string) => {
              if (isNewPrompt && promptId) {
                 setCurrentPage({
                  type: "prompt",
                  promptId,
                  from: "create",
                });
              } else if (currentPage.editingPrompt) {
                // After editing, go back to the prompt detail page
                setCurrentPage({ type: "prompt", promptId: currentPage.editingPrompt.id, from: "create" });
              } else {
                handleBack();
              }
            }}
          />
        )}

        {currentPage.type === "prompt" && (
          <PromptDetailPage
            promptId={currentPage.promptId}
            onBack={handlePromptBack}
            onEdit={handleEditPrompt}
            // onFork={handleForkPrompt}
          />
        )}

        {currentPage.type === "profile" && (
          <UserProfilePage
            userId={currentPage.userId}
            initialTab={currentPage.tab}
            onBack={handleBack}
          />
          )}
           {currentPage.type === "settings" && (
          <SettingsPage onBack={handleBack} />
        
        )}

        {currentPage.type === "about" && <AboutPage onBack={handleBack} />}
        {currentPage.type === "privacy" && <PrivacyPage onBack={handleBack} />}
        {currentPage.type === "terms" && <TermsPage onBack={handleBack} />}
        </Suspense>
      </main>

      <Footer
        onGetStarted={handleGetStarted}
         onNavigateToAbout={() => setCurrentPage({ type: "about" })}
        onNavigateToTerms={() => setCurrentPage({ type: "terms" })}
        onNavigateToPrivacy={() => setCurrentPage({ type: "privacy" })}
      />

      <Suspense fallback={null}>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </Suspense>
   

  

     

      <Suspense fallback={null}>
        <CreateRepoModal
          isOpen={isCreateRepoOpen}
          onClose={() => setIsCreateRepoOpen(false)}
          userId={state.user?.id}
          onCreated={(repoId) => {
            setIsCreateRepoOpen(false);
            setCurrentPage({ type: "repo", repoId, from: "repos" });
          }}
        />
      </Suspense>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
