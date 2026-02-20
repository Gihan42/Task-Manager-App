export interface Task {
  id: string;
  content: string;
  owner: string;
  assignees?: string[];
  assignedAt?: string;
  assignedBy?: string;
  inProgressAt?: string;
  testingAt?: string;
  testingDoneAt?: string;
  doneAt?: string;
  createdAt?: string;
  lastMovedBy?: string;
  lastMovedAt?: string;
  externalLink?: string;
  files?: AttachedFile[];
}

export interface AttachedFile {
  name: string;
  url: string;
  type: string;
  createdAt: string;
  fullPath?: string; // Path in storage for deletion
}

export interface List {
  id: string;
  title: string;
  cards: Task[];
}

export interface Board {
  id: string;
  title: string;
  color: string;
  lists: List[];
  ownerId: string;
  members: string[];
  createdAt?: string;
}
