export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  role: Role;
  content: string;
  imageUrl?: string;
  prompt?: string;
}

export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
}