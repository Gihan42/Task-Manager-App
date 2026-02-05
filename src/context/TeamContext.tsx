import { useState, type ReactNode } from 'react';
import { TeamContext, type TeamMember, type Role } from './team-context';

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      roles: ['Developer', 'Manager'],
      assignedBoardIds: ['1'],
      joinedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      roles: ['Tester', 'Developer'],
      assignedBoardIds: [],
      joinedDate: '2024-02-20',
    },
    {
      id: '3',
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      roles: ['Designer'],
      assignedBoardIds: ['1'],
      joinedDate: '2024-03-10',
    },
  ]);

  const addMember = (memberData: Omit<TeamMember, 'id' | 'joinedDate' | 'assignedBoardIds'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: Date.now().toString(),
      assignedBoardIds: [],
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
  };

  const updateMemberRoles = (id: string, roles: Role[]) => {
    setMembers(members.map(member =>
      member.id === id ? { ...member, roles } : member
    ));
  };

  const assignMemberToBoard = (memberId: string, boardId: string) => {
    setMembers(members.map(member => {
      if (member.id !== memberId) return member;
      if (member.assignedBoardIds.includes(boardId)) return member;
      return { ...member, assignedBoardIds: [...member.assignedBoardIds, boardId] };
    }));
  };

  const removeMemberFromBoard = (memberId: string, boardId: string) => {
    setMembers(members.map(member => {
      if (member.id !== memberId) return member;
      return { ...member, assignedBoardIds: member.assignedBoardIds.filter(id => id !== boardId) };
    }));
  };

  return (
    <TeamContext.Provider value={{ 
      members, 
      addMember, 
      removeMember, 
      updateMemberRoles,
      assignMemberToBoard,
      removeMemberFromBoard 
    }}>
      {children}
    </TeamContext.Provider>
  );
};
