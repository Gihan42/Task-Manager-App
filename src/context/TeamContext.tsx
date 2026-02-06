import { useState, useEffect, type ReactNode } from 'react';
import { TeamContext, type TeamMember, type Role } from './team-context';
import { collection, onSnapshot, query, addDoc, deleteDoc, where, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import defaultRoles from '../data/roles.json';

export const TeamProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!user) {
        setMembers([]);
        return;
    }

    let usersMap: Record<string, any> = {};
    let assignmentsMap: Record<string, string[]> = {};

    const mergeAndSetMembers = () => {
        const mergedMembers: TeamMember[] = Object.values(usersMap).map((userData: any) => ({
             id: userData.id,
             name: userData.name || 'Unknown User',
             email: userData.email || '',
             roles: userData.roles || [defaultRoles.availableRoles[0]],
             assignedBoardIds: assignmentsMap[userData.id] || [],
             joinedDate: userData.createdAt ? userData.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        }));
        setMembers(mergedMembers);
    };

    const usersQuery = query(collection(db, "users"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
        usersMap = {};
        snapshot.docs.forEach(doc => {
            usersMap[doc.id] = { id: doc.id, ...doc.data() };
        });
        mergeAndSetMembers();
    });

    const assignmentsQuery = query(collection(db, "user_projects"));
    const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
        assignmentsMap = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            if (!assignmentsMap[data.userId]) {
                assignmentsMap[data.userId] = [];
            }
            if (!assignmentsMap[data.userId].includes(data.projectId)) {
                 assignmentsMap[data.userId].push(data.projectId);
            }
        });
        mergeAndSetMembers();
    });

    return () => {
        unsubUsers();
        unsubAssignments();
    };
  }, [user]);

  const addMember = async (memberData: Omit<TeamMember, 'id' | 'joinedDate' | 'assignedBoardIds'>) => {
    try {
        const newMemberData = {
            name: memberData.name,
            email: memberData.email || "", // Handle optional email
            roles: memberData.roles,
            assignedBoardIds: [],
            createdAt: new Date().toISOString(),
            photoURL: ""
        };

        await addDoc(collection(db, "users"), newMemberData);
        
        // We don't need to manually update state as the onSnapshot listener will pick it up
        toast.success(`Member "${memberData.name}" added successfully`);
    } catch (error: any) {
        toast.error(`Failed to add member: ${error.message}`);
    }
  };

  const removeMember = async (id: string) => {
    try {
        const batch = writeBatch(db);

        const userRef = doc(db, "users", id);
        batch.delete(userRef);

        const assignmentsQuery = query(collection(db, "user_projects"), where("userId", "==", id));
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        assignmentsSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        toast.success("Member removed successfully");
    } catch (error: any) {
        toast.error(`Failed to remove member: ${error.message}`);
    }
  };

  const updateMemberRoles = async (id: string, roles: Role[]) => {
    try {
        await updateDoc(doc(db, "users", id), {
            roles: roles
        });
        toast.success("Role updated successfully");
    } catch (error: any) {
        toast.error(`Failed to update role: ${error.message}`);
    }
  };

  const assignMemberToBoard = async (memberId: string, boardId: string, role: Role) => {
    try {
        await addDoc(collection(db, "user_projects"), {
            userId: memberId,
            projectId: boardId,
            role: role,
            assignedAt: new Date().toISOString()
        });
        toast.success("Member assigned to board");
    } catch (error: any) {
        toast.error(`Failed to assign member: ${error.message}`);
    }
  };

  const removeMemberFromBoard = async (memberId: string, boardId: string) => {
    try {
        const q = query(
            collection(db, "user_projects"), 
            where("userId", "==", memberId),
            where("projectId", "==", boardId)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
        toast.success("Member removed from board");
    } catch (error: any) {
        toast.error(`Failed to remove member from board: ${error.message}`);
    }
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
