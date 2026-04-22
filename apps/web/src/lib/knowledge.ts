import { useEffect, useState } from "react";
import { apiRequest } from "./api";
import type { KnowledgeIndexItem } from "../types";

type KnowledgeState = {
  lookup: Record<string, KnowledgeIndexItem>;
  isLoading: boolean;
};

const listeners = new Set<() => void>();

let lookupCache: Record<string, KnowledgeIndexItem> = {};
let isLoadingCache = false;
let hasLoaded = false;
let inflightRequest: Promise<Record<string, KnowledgeIndexItem>> | null = null;

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function createLookup(items: KnowledgeIndexItem[]) {
  const nextLookup: Record<string, KnowledgeIndexItem> = {};

  items.forEach((item) => {
    nextLookup[item.title] = item;
  });

  return nextLookup;
}

async function requestKnowledgeIndex(force = false) {
  if (hasLoaded && !force) {
    return lookupCache;
  }

  if (inflightRequest && !force) {
    return inflightRequest;
  }

  isLoadingCache = true;
  notifyListeners();

  inflightRequest = apiRequest<{
    concepts: KnowledgeIndexItem[];
    counterexamples: KnowledgeIndexItem[];
  }>("/meta/knowledge-index")
    .then((data) => {
      lookupCache = createLookup([...data.concepts, ...data.counterexamples]);
      hasLoaded = true;
      return lookupCache;
    })
    .catch(() => {
      lookupCache = {};
      return lookupCache;
    })
    .finally(() => {
      isLoadingCache = false;
      inflightRequest = null;
      notifyListeners();
    });

  return inflightRequest;
}

export function useKnowledge() {
  const [state, setState] = useState<KnowledgeState>({
    lookup: lookupCache,
    isLoading: isLoadingCache,
  });

  useEffect(() => {
    function sync() {
      setState({
        lookup: lookupCache,
        isLoading: isLoadingCache,
      });
    }

    listeners.add(sync);
    sync();

    if (!hasLoaded && !inflightRequest) {
      void requestKnowledgeIndex();
    }

    return () => {
      listeners.delete(sync);
    };
  }, []);

  return {
    lookup: state.lookup,
    isLoading: state.isLoading,
    reload: async () => {
      await requestKnowledgeIndex(true);
    },
  };
}
