import { Link } from 'react-router-dom';
import { LayoutDashboard, CheckCircle2, ListTodo, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useBoard } from '../hooks/useBoard';
import { motion } from 'framer-motion';

export const Dashboard = () => {
    const { boards } = useBoard();

    // Calculate stats
    const totalBoards = boards.length;
    const totalTasks = boards.reduce((acc, b) => acc + b.lists.reduce((lAcc, l) => lAcc + l.cards.length, 0), 0);
    const completedTasks = boards.reduce((acc, b) => acc + b.lists.reduce((lAcc, l) => l.title === 'Done' ? lAcc + l.cards.length : lAcc, 0), 0);


    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="floating-shape shape-1" />
                <div className="floating-shape shape-2" />
                <div className="floating-shape shape-3" />
                <div className="floating-shape shape-4" />
                <div className="floating-shape shape-5" />
                <div className="floating-shape shape-6" />
            </div>

            {/* Hero Section */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 pt-20 pb-32 px-6 text-center"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 backdrop-blur-sm"
                >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Modern Task Management</span>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="hero-heading mb-6"
                >
                    TaskFlow
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
                >
                    Organize your work, collaborate with your team, and achieve your goals with our modern task management platform.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex items-center justify-center gap-4"
                >
                    <Link to="/boards">
                        <Button size="lg" className="px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all bg-primary hover:bg-primary/90 group">
                            View Your Projects
                            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </motion.div>
            </motion.section>

            {/* Stats Section */}
            <motion.section
                variants={container}
                initial="hidden"
                animate="show"
                className="relative z-10 max-w-7xl mx-auto px-6 pb-20"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <motion.div 
                        variants={item} 
                        className="glass-card group"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3 text-muted-foreground">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <LayoutDashboard size={20} className="text-primary" />
                                </div>
                                <span className="font-medium">Total Projects</span>
                            </div>
                            <div className="text-4xl font-bold gradient-text">{totalBoards}</div>
                            <div className="mt-2 text-sm text-muted-foreground">Active projects</div>
                        </div>
                        <div className="stat-glow" />
                    </motion.div>

                    <motion.div 
                        variants={item} 
                        className="glass-card group"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3 text-muted-foreground">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <ListTodo size={20} className="text-blue-500" />
                                </div>
                                <span className="font-medium">Total Tasks</span>
                            </div>
                            <div className="text-4xl font-bold gradient-text-blue">{totalTasks}</div>
                            <div className="mt-2 text-sm text-muted-foreground">Across all projects</div>
                        </div>
                        <div className="stat-glow-blue" />
                    </motion.div>

                    <motion.div 
                        variants={item} 
                        className="glass-card group"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3 text-muted-foreground">
                                <div className="p-2 rounded-lg bg-orange-500/10">
                                    <Clock size={20} className="text-orange-500" />
                                </div>
                                <span className="font-medium">In Progress</span>
                            </div>
                            <div className="text-4xl font-bold gradient-text-orange">{totalTasks - completedTasks}</div>
                            <div className="mt-2 text-sm text-muted-foreground">Active tasks</div>
                        </div>
                        <div className="stat-glow-orange" />
                    </motion.div>

                    <motion.div 
                        variants={item} 
                        className="glass-card group"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-3 text-muted-foreground">
                                <div className="p-2 rounded-lg bg-green-500/10">
                                    <CheckCircle2 size={20} className="text-green-500" />
                                </div>
                                <span className="font-medium">Completed</span>
                            </div>
                            <div className="text-4xl font-bold gradient-text-green">{completedTasks}</div>
                            <div className="mt-2 text-sm text-muted-foreground">Finished tasks</div>
                        </div>
                        <div className="stat-glow-green" />
                    </motion.div>
                </div>
            </motion.section>

            {/* Features Section */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative z-10 max-w-7xl mx-auto px-6 pb-32"
            >
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                        Everything you need to stay organized
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Powerful features to help you manage your projects effectively
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div
                        whileHover={{ y: -8 }}
                        className="glass-card text-center"
                    >
                        <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
                            <LayoutDashboard className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Custom Projects</h3>
                        <p className="text-muted-foreground">
                            Create unlimited projects to organize your work your way
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -8 }}
                        className="glass-card text-center"
                    >
                        <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 mb-4">
                            <ListTodo className="w-8 h-8 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Drag & Drop</h3>
                        <p className="text-muted-foreground">
                            Intuitive drag-and-drop interface for seamless task management
                        </p>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -8 }}
                        className="glass-card text-center"
                    >
                        <div className="inline-flex p-4 rounded-2xl bg-green-500/10 mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                        <p className="text-muted-foreground">
                            Monitor your team's progress with real-time updates
                        </p>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
};
