import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { Home, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-violet-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape shape-1 opacity-20" />
        <div className="floating-shape shape-2 opacity-20" />
        <div className="floating-shape shape-3 opacity-20" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Compass Icon at Top */}
        <motion.div
           initial={{ opacity: 0, scale: 0.5 }}
           animate={{ opacity: 1, scale: 1, rotate: 360 }}
           transition={{ duration: 1, ease: "easeOut", rotate: { duration: 20, repeat: Infinity, ease: "linear" } }}
           className="mb-8 inline-block text-primary/80"
        >
           <Compass size={120} strokeWidth={1} />
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="mb-8"
        >
          <div className="relative inline-block">
             <h1 className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground/50 to-foreground/10 select-none">
               404
             </h1>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Lost in Space?
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
            The page you're looking for seems to have drifted away into the void.
          </p>

          <div className="pt-8">
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/')}
              startIcon={<Home size={20} />}
              sx={{
                borderRadius: '9999px',
                textTransform: 'none',
                fontSize: '1.1rem',
                padding: '12px 32px',
                color: 'hsl(var(--foreground))',
                borderColor: 'black',
                backdropFilter: 'blur(10px)',
                background: 'hsl(var(--background) / 0.5)',
                '&:hover': {
                  borderColor: 'hsl(var(--primary))',
                  background: 'hsl(var(--muted) / 0.5)',
                  boxShadow: '0 0 20px hsl(var(--primary) / 0.2)'
                },
                'html.dark &': {
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                }
              }}
            >
              Return to Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
