import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useBoard } from '../hooks/useBoard';
import { motion } from 'framer-motion';

export const Boards = () => {
    const { boards, createBoard } = useBoard();
    const [isCreating, setIsCreating] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');

    const handleCreateBoard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBoardTitle.trim()) return;
        
        const colors = [
            'hsl(215 80% 60%)', 'hsl(145 70% 50%)', 'hsl(280 70% 60%)', 
            'hsl(350 80% 60%)', 'hsl(40 90% 60%)'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        createBoard(newBoardTitle, randomColor);
        setNewBoardTitle('');
        setIsCreating(false);
    };

    return (
        <div className="space-y-12 p-6 pb-20">
            {/* Your Boards Section */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50 mb-2">
                            Your Boards
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Jump right back into your work
                        </p>
                    </div>
                    <Button onClick={() => setIsCreating(true)} className="shadow-lg hover:scale-105 transition-transform bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Create Board
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {boards.map((board, index) => (
                        <motion.div
                            key={board.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link 
                                to={`/board/${board.id}`}
                                className="group relative block h-48 rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 shadow-sm transition-all hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 overflow-hidden"
                                style={{ textDecoration: 'none' }}
                            >
                                <div 
                                    className="absolute top-0 left-0 w-full h-1 group-hover:h-2 transition-all duration-300" 
                                    style={{ backgroundColor: board.color }}
                                />
                                <h3 className="font-bold text-xl mb-2 mt-2" style={{ color: 'hsl(var(--foreground))' }}>
                                    {board.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {board.lists.length} Lists • {board.lists.reduce((acc, l) => acc + l.cards.length, 0)} Tasks
                                </p>
                                <div className="absolute bottom-6 left-6 flex gap-1">
                                    {/* Mini visualization of lists */}
                                    {board.lists.slice(0, 4).map(l => (
                                        <div key={l.id} className="w-2 h-8 rounded-full bg-muted-foreground/20 group-hover:bg-primary/20 transition-colors" />
                                    ))}
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                    
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: boards.length * 0.05 }}
                        onClick={() => setIsCreating(true)}
                        className="flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 transition-all hover:bg-muted/40 hover:border-primary/50 hover:scale-[1.02] group cursor-pointer"
                    >
                        <div className="p-4 rounded-full bg-background/50 group-hover:bg-primary/10 transition-colors mb-3 shadow-sm">
                            <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary" />
                        </div>
                        <span className="font-medium text-muted-foreground group-hover:text-primary">Create New Board</span>
                    </motion.button>
                </div>
            </motion.section>

            {isCreating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card p-8 rounded-2xl shadow-2xl w-full max-w-md border border-border"
                    >
                        <h3 className="text-2xl font-bold mb-2">Create New Board</h3>
                        <p className="text-muted-foreground mb-6">Give your new board a name to get started.</p>
                        <form onSubmit={handleCreateBoard}>
                            <input
                                type="text"
                                value={newBoardTitle}
                                onChange={(e) => setNewBoardTitle(e.target.value)}
                                placeholder="e.g., Product Roadmap, Q4 Goals..."
                                className="w-full p-3 rounded-lg border border-input bg-background mb-6 focus:ring-2 focus:ring-primary focus:outline-none transition-all text-lg"
                                autoFocus
                            />
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                                <Button type="submit" className="px-6">Create Board</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
