export interface Task {
  id: string;
  content: string;
  owner: string;
  assignee?: string;
  assignedAt?: string;
  assignedBy?: string;
  inProgressAt?: string;
  testingAt?: string;
  testingDoneAt?: string;
  doneAt?: string;
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
}
