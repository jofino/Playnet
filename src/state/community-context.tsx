import { createContext, use, useReducer, type ReactNode } from 'react';

import type { Sport } from '@/constants/sports';
import { MOCK_POSTS, MOCK_STORIES, type Post, type StoryGroup, type StoryItem } from '@/data/community';
import { ME } from '@/data/players';

type State = { posts: Post[]; stories: StoryGroup[] };

type Action =
  | { type: 'addPost'; post: Post }
  | { type: 'toggleLike'; postId: string }
  | { type: 'addComment'; postId: string; text: string }
  | { type: 'addStory'; item: StoryItem }
  | { type: 'markSeen'; author: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'addPost':
      return { ...state, posts: [action.post, ...state.posts] };
    case 'toggleLike':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.postId
            ? { ...post, likedByMe: !post.likedByMe, likes: post.likes + (post.likedByMe ? -1 : 1) }
            : post
        ),
      };
    case 'addComment':
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.postId
            ? {
                ...post,
                comments: [
                  ...post.comments,
                  { id: `c${Date.now()}`, author: ME, text: action.text, createdAt: new Date().toISOString() },
                ],
              }
            : post
        ),
      };
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
  addPost: (post: { text: string; sport?: Sport; imageUri?: string }) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  addStory: (story: Omit<StoryItem, 'id' | 'createdAt'>) => void;
  markSeen: (author: string) => void;
};

const CommunityContext = createContext<CommunityContextValue | null>(null);

/** Posts e stories da aba Comunidade. */
export function CommunityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { posts: MOCK_POSTS, stories: MOCK_STORIES });

  return (
    <CommunityContext
      value={{
        ...state,
        addPost: (post) =>
          dispatch({
            type: 'addPost',
            post: {
              ...post,
              id: `post${Date.now()}`,
              author: ME,
              createdAt: new Date().toISOString(),
              likes: 0,
              likedByMe: false,
              comments: [],
            },
          }),
        toggleLike: (postId) => dispatch({ type: 'toggleLike', postId }),
        addComment: (postId, text) => dispatch({ type: 'addComment', postId, text }),
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
