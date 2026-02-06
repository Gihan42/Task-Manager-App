import { createContext } from 'react';



export type Role = string; // Using string to allow dynamic roles from JSON
// export type Role = typeof defaultRoles.availableRoles[number]; // This would be string[] in standard JSON import anyway

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
    removeMember: (id: string) => Promise<void>;
    updateMemberRoles: (id: string, roles: Role[]) => Promise<void>;
    assignMemberToBoard: (memberId: string, boardId: string, role: Role) => Promise<void>;
    removeMemberFromBoard: (memberId: string, boardId: string) => Promise<void>;
}

export const TeamContext = createContext<TeamContextType>({
    members: [],
    addMember: () => {},
    removeMember: async () => {},
    updateMemberRoles: async () => {},
    assignMemberToBoard: async () => {},
    removeMemberFromBoard: async () => {},
});
