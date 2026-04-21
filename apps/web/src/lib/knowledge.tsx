import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { apiRequest } from "./api";
import type { KnowledgeIndexItem } from "../types";

type KnowledgeContextValue = {
  lookup: Record<string, KnowledgeIndexItem>;
  isLoading: boolean;
  reload: () => Promise<void>;
};

const KnowledgeContext = createContext<KnowledgeContextValue | undefined>(undefined);

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [lookup, setLookup] = useState<Record<string, KnowledgeIndexItem>>({});
  const [isLoading, setIsLoading] = useState(true);

  async function loadIndex() {
    try {
      setIsLoading(true);
      const data = await apiRequest<{
        concepts: KnowledgeIndexItem[];
        counterexamples: KnowledgeIndexItem[];
      }>("/meta/knowledge-index");

      const nextLookup: Record<string, KnowledgeIndexItem> = {};

      [...data.concepts, ...data.counterexamples].forEach((item) => {
        nextLookup[item.title] = item;
      });

      setLookup(nextLookup);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadIndex();
  }, []);

  return (
    <KnowledgeContext.Provider value={{ lookup, isLoading, reload: loadIndex }}>
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);

  if (!context) {
    throw new Error("useKnowledge must be used inside KnowledgeProvider.");
  }

  return context;
}
