import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toast: ToastData;
    onDismiss: (id: string) => void;
}

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const styles = {
    success: {
        bg: 'hsl(145 70% 50% / 0.15)',
        border: 'hsl(145 70% 50% / 0.3)',
        icon: 'hsl(145 70% 45%)',
        text: 'hsl(145 70% 30%)',
    },
    error: {
        bg: 'hsl(0 84% 60% / 0.15)',
        border: 'hsl(0 84% 60% / 0.3)',
        icon: 'hsl(0 84% 50%)',
        text: 'hsl(0 84% 30%)',
    },
    warning: {
        bg: 'hsl(40 90% 50% / 0.15)',
        border: 'hsl(40 90% 50% / 0.3)',
        icon: 'hsl(40 90% 40%)',
        text: 'hsl(40 90% 25%)',
    },
    info: {
        bg: 'hsl(217 91% 60% / 0.15)',
        border: 'hsl(217 91% 60% / 0.3)',
        icon: 'hsl(217 91% 50%)',
        text: 'hsl(217 91% 30%)',
    },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    const Icon = icons[toast.type];
    const style = styles[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                minWidth: '300px',
                maxWidth: '450px',
            }}
        >
            <Icon 
                size={22} 
                style={{ color: style.icon, flexShrink: 0 }} 
            />
            <span 
                style={{ 
                    flex: 1, 
                    fontSize: '14px', 
                    fontWeight: 500,
                    color: style.text,
                }}
                className="toast-message"
            >
                {toast.message}
            </span>
            <button
                onClick={() => onDismiss(toast.id)}
                style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.6,
                    transition: 'opacity 0.2s',
                    color: style.text,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};

interface ToastContainerProps {
    toasts: ToastData[];
    onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
};
