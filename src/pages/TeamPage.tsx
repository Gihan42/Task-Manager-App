import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Trash2, X, Search, Check, Shield, Briefcase } from 'lucide-react';
import { TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, Checkbox, ListItemText, FormControl, InputLabel } from '@mui/material';
import { type TeamMember, type Role } from '../context/team-context';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../context/AuthContext';
import { useBoard } from '../hooks/useBoard';
import defaultRoles from '../data/roles.json';
import { Button } from '../components/ui/Button';

const AVAILABLE_ROLES: Role[] = defaultRoles.availableRoles;

export const Team = () => {
  const { members, addMember, removeMember, updateMemberRoles, assignMemberToBoard, removeMemberFromBoard } = useTeam();
  const { boards } = useBoard();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null); // Member ID for role editing
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null); // Member ID for board assignment
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for adding new member
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    roles: [defaultRoles.availableRoles[0]] as Role[],
  });

  // State for editing member roles
  const [editingRoles, setEditingRoles] = useState<Role[]>([]);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const { user } = useAuth();
  
  // Check if current user is a manager
  const currentUserMember = members.find(m => user && m.id === user.uid);
  const isManager = currentUserMember?.roles.includes('Manager');

  const handleAddMember = () => {
    if (newMember.name && newMember.roles.length > 0) {
      addMember(newMember);
      setNewMember({ name: '', email: '', roles: [defaultRoles.availableRoles[0]] });
      setShowAddModal(false);
    } else {
        // Optional: Add toast warning if name is missing
    }
  };

  const handleSaveRoles = (memberId: string) => {
    updateMemberRoles(memberId, editingRoles);
    setShowEditModal(null);
  };

  const openEditModal = (member: TeamMember) => {
    setEditingRoles([...member.roles]);
    setShowEditModal(member.id);
  };

  const toggleRole = (role: Role, isEditing: boolean) => {
    if (isEditing) {
      setEditingRoles(prev => 
        prev.includes(role) 
          ? prev.filter(r => r !== role)
          : [...prev, role]
      );
    } else {
      setNewMember(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }));
    }
  };


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'hsl(var(--background))' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
              Team Management
            </h1>
            <p className="text-muted-foreground">
              Manage your team members and assign projects
            </p>
          </div>
          <div className="flex gap-3">
            {isManager && (
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90"
                >
                    <UserPlus size={18} />
                    Add Member
                </Button>
            )}
          </div>
        </div>

        {/* Search Bar - Material UI */}
        <div className="max-w-md">
           <TextField
            fullWidth
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} className="text-muted-foreground" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'hsl(var(--card))',
                borderRadius: '0.5rem',
                '& fieldset': {
                  borderColor: 'hsl(var(--border))',
                },
                '&:hover fieldset': {
                  borderColor: 'hsl(var(--primary) / 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'hsl(var(--primary))',
                  borderWidth: '2px',
                },
                color: 'hsl(var(--foreground))',
              },
              '& .MuiInputBase-input::placeholder': {
                  color: 'hsl(var(--muted-foreground))',
                  opacity: 1,
              }
            }}
          />
        </div>
      </motion.div>

      {/* Content Area - TABLE VIEW ONLY */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
      >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-muted/50 border-b border-border">
                        <th className="p-4 font-semibold text-sm text-foreground">Member</th>
                        <th className="p-4 font-semibold text-sm text-foreground">Role</th>
                        <th className="p-4 font-semibold text-sm text-foreground">Projects</th>
                        <th className="p-4 font-semibold text-sm text-foreground text-right">{isManager ? 'Actions' : ''}</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedMembers.map(member => (
                        <tr key={member.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-foreground bg-muted border border-border/50"
                                    >
                                        {getInitials(member.name)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-foreground">{member.name}</div>
                                        <div className="text-xs text-muted-foreground">{member.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {member.roles.map(role => (
                                        <span 
                                            key={role}
                                            className="px-2 py-0.5 rounded text-[10px] uppercase font-bold text-muted-foreground bg-muted border border-border"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-wrap gap-1">
                                    {member.assignedBoardIds && member.assignedBoardIds.length > 0 ? (
                                        member.assignedBoardIds.map(boardId => {
                                            const board = boards.find(b => b.id === boardId);
                                            if (!board) return null;
                                            return (
                                                <span 
                                                    key={boardId}
                                                    className="text-xs px-2 py-1 rounded bg-muted text-foreground border border-border flex items-center gap-1"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: board.color }}/>
                                                    {board.title}
                                                </span>
                                            );
                                        })
                                    ) : (
                                        <span className="text-xs text-muted-foreground">-</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                {isManager && (
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={() => setShowAssignModal(member.id)}
                                            className="p-2 rounded hover:bg-muted dark:bg-muted dark:text-foreground text-muted-foreground hover:text-primary transition-colors"
                                            title="Assign Project"
                                        >
                                            <Briefcase size={16} />
                                        </button>
                                        <button 
                                            onClick={() => openEditModal(member)}
                                            className="p-2 rounded hover:bg-muted dark:bg-muted dark:text-foreground text-muted-foreground hover:text-primary transition-colors"
                                            title="Edit Roles"
                                        >
                                            <Shield size={16} />
                                        </button>
                                        <button 
                                            onClick={() => removeMember(member.id)}
                                            className="p-2 rounded hover:bg-red-500/10 dark:bg-muted dark:text-foreground text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {filteredMembers.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
                <div className="text-sm text-muted-foreground">
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredMembers.length)} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
          )}
      </motion.div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'No members found matching your search' : 'No team members yet'}
          </p>
        </motion.div>
      )}

      {/* Add Member Modal - Material UI */}
      <Dialog 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
            style: {
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
            }
        }}
      >
        <DialogTitle className="text-xl font-bold">Add Team Member</DialogTitle>
        <DialogContent className="space-y-4 pt-4">
            <TextField
                autoFocus
                margin="dense"
                label="Full Name"
                type="text"
                fullWidth
                variant="outlined"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                 sx={{
                    '& .MuiInputBase-root': { color: 'hsl(var(--foreground))' },
                    '& .MuiInputLabel-root': { color: 'hsl(var(--muted-foreground))' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--border))' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--primary))' },
                }}
            />
             <TextField
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                variant="outlined"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                 sx={{
                    '& .MuiInputBase-root': { color: 'hsl(var(--foreground))' },
                    '& .MuiInputLabel-root': { color: 'hsl(var(--muted-foreground))' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--border))' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--primary))' },
                }}
            />
            
            <FormControl fullWidth margin="dense">
                <InputLabel id="role-select-label" sx={{ color: 'hsl(var(--muted-foreground))' }}>Roles</InputLabel>
                <Select
                    labelId="role-select-label"
                    multiple
                    value={newMember.roles}
                    onChange={(e) => {
                         const value = e.target.value;
                         setNewMember({ ...newMember, roles: typeof value === 'string' ? value.split(',') as Role[] : value as Role[] })
                    }}
                    renderValue={(selected) => selected.join(', ')}
                    inputProps={{ 'aria-label': 'Roles' }}
                    label="Roles"
                    sx={{
                        color: 'hsl(var(--foreground))',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--border))' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'hsl(var(--primary))' },
                        '.MuiSvgIcon-root': { color: 'hsl(var(--foreground))' }
                    }}
                    MenuProps={{
                        PaperProps: {
                            style: {
                                backgroundColor: 'hsl(var(--card))',
                                color: 'hsl(var(--foreground))',
                            }
                        }
                    }}
                >
                    {AVAILABLE_ROLES.map((role) => (
                        <MenuItem key={role} value={role}>
                            <Checkbox checked={newMember.roles.indexOf(role) > -1} sx={{ color: 'hsl(var(--primary))', '&.Mui-checked': { color: 'hsl(var(--primary))' } }} />
                            <ListItemText primary={role} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </DialogContent>
        <DialogActions className="p-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
                Cancel
            </Button>
            <Button onClick={handleAddMember}>
                Add Member
            </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Roles Modal */}
      <AnimatePresence>
        {showEditModal && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      Edit Roles
                    </h2>
                    <button
                      onClick={() => setShowEditModal(null)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-4">
                            Select roles for this member.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {AVAILABLE_ROLES.map(role => (
                                <div 
                                    key={role}
                                    onClick={() => toggleRole(role, true)}
                                    className={`
                                        cursor-pointer px-3 py-2 rounded-lg border transition-all flex items-center justify-between
                                        ${editingRoles.includes(role) 
                                            ? 'border-primary bg-primary/10 text-primary' 
                                            : 'border-border hover:border-primary/50 text-muted-foreground'}
                                    `}
                                >
                                    <span className="text-sm font-medium">{role}</span>
                                    {editingRoles.includes(role) && <Check size={14} />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={() => handleSaveRoles(showEditModal)} className="flex-1">
                        Save Roles
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowEditModal(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Project Modal */}
      <AnimatePresence>
        {showAssignModal && (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAssignModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                      Assign Projects
                    </h2>
                    <button
                      onClick={() => setShowAssignModal(null)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Select projects to assign to this member.
                    </p>
                    <div className="grid gap-2 max-h-60 overflow-y-auto pr-2">
                        {boards.length > 0 ? boards.map(board => {
                            const member = members.find(m => m.id === showAssignModal);
                            const isAssigned = member?.assignedBoardIds.includes(board.id);
                            
                            return (
                                <div 
                                    key={board.id}
                                    onClick={() => {
                                        if (isAssigned) {
                                            removeMemberFromBoard(showAssignModal, board.id);
                                        } else {
                                            // Default to first role (e.g. 'Manager' or 'Developer') when assigning
                                            assignMemberToBoard(showAssignModal, board.id, defaultRoles.availableRoles[2] || 'Developer');
                                        }
                                    }}
                                    className={`
                                        cursor-pointer px-4 py-3 rounded-lg border transition-all flex items-center justify-between
                                        ${isAssigned
                                            ? 'border-primary bg-primary/10 text-primary' 
                                            : 'border-border hover:border-primary/50 text-foreground'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: board.color }} />
                                        <span className="font-medium">{board.title}</span>
                                    </div>
                                    {isAssigned && <Check size={16} />}
                                </div>
                            );
                        }) : (
                            <p className="text-center text-muted-foreground italic py-4">No available projects.</p>
                        )}
                    </div>
                    
                    <div className="pt-4">
                        <Button
                            onClick={() => setShowAssignModal(null)}
                            className="w-full"
                        >
                            Done
                        </Button>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
