import { createContext } from 'react';

export type Role = 'Developer' | 'Designer' | 'Tester' | 'Manager' | 'TechLead' ;

export interface TeamMember {
  id: string;
  name: string
  email: string;
  roles: Role[];
  assignedBoardIds: string[]; // List of board IDs this member is assigned to
  avatar?: string;
  joinedDate: string;
}

export interface TeamContextType {
  members: TeamMember[];
  addMember: (member: Omit<TeamMember, 'id' | 'joinedDate' | 'assignedBoardIds'>) => void;
  removeMember: (id: string) => void;
  updateMemberRoles: (id: string, roles: Role[]) => void;
  assignMemberToBoard: (memberId: string, boardId: string) => void;
  removeMemberFromBoard: (memberId: string, boardId: string) => void;
}

export const TeamContext = createContext<TeamContextType | undefined>(undefined);
