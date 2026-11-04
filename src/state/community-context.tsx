import { createContext, use, useReducer, type ReactNode } from 'react';

import { type StoryGroup, type StoryItem } from '@/data/community';
import { ME } from '@/data/players';

type State = { stories: StoryGroup[] };

type Action =
  | { type: 'addStory'; item: StoryItem }
  | { type: 'markSeen'; author: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addStory': {
      const mine = state.stories.find((group) => group.author === ME);
      const others = state.stories.filter((group) => group.author !== ME);
      const group: StoryGroup = {
        author: ME,
        seen: false,
        items: [...(mine?.items ?? []), action.item],
      };
      return { ...state, stories: [group, ...others] };
    }
    case 'markSeen':
      if (state.stories.every((group) => group.author !== action.author || group.seen)) return state;
      return {
        ...state,
        stories: state.stories.map((group) =>
          group.author === action.author ? { ...group, seen: true } : group
        ),
      };
  }
}

type CommunityContextValue = State & {
  addStory: (story: Omit<StoryItem, 'id' | 'createdAt'>) => void;
  markSeen: (author: string) => void;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

/** Stories da aba Comunidade, ainda sem tabela no banco; as publicações vêm de lib/comunidade. */
export function CommunityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { stories: [] });

  return (
    <CommunityContext
      value={{
        ...state,
        addStory: (story) =>
          dispatch({
            type: 'addStory',
            item: { ...story, id: `s${Date.now()}`, createdAt: new Date().toISOString() },
          }),
        markSeen: (author) => dispatch({ type: 'markSeen', author }),
      }}>
      {children}
    </CommunityContext>
  );
}

export function useCommunity() {
  const context = use(CommunityContext);
  if (!context) throw new Error('useCommunity precisa estar dentro de <CommunityProvider>.');
  return context;
}
