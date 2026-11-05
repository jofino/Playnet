export const POST_MAX_LENGTH = 500;
export const COMMENT_MAX_LENGTH = 300;

export type Comment = { id: string; authorId: string; author: string; text: string; createdAt: string };

export type Post = {
  id: string;
  authorId: string;
  author: string;
  createdAt: string;
  text: string;
  likes: number;
  likedByMe: boolean;
  commentCount: number;
};

/** A publicação com a curtida do usuário invertida, para atualizar a tela antes da resposta do banco. */
export function withLikeToggled(post: Post): Post {
  return { ...post, likedByMe: !post.likedByMe, likes: post.likes + (post.likedByMe ? -1 : 1) };
}

/** Fundos dos stories de texto. */
export const STORY_BACKGROUNDS = ['#E05434', '#1B3A6B', '#16A3A3', '#7B2CBF', '#2B2D42', '#F59E0B'];

export type StoryItem = {
  id: string;
  createdAt: string;
  /** Story de texto (sobre `background`) ou de foto (`imageUri`). */
  text?: string;
  background?: string;
  imageUri?: string;
};

export type StoryGroup = { author: string; items: StoryItem[]; seen: boolean };
