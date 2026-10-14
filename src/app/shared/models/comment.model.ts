export interface Comment {
  id: number;
  ticketId: number;
  userId: number;
  body: string;
  createdAt: string;
}

export type CreateCommentRequest = Omit<Comment, 'id'>;
