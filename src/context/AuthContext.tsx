import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import defaultRoles from '../data/roles.json';
import { setDoc } from 'firebase/firestore';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sync roles from JSON to Firestore on app load
        const syncRolesToFirestore = async () => {
             try {
                const roleRef = doc(db, "roles", "default_roles");
                await setDoc(roleRef, defaultRoles, { merge: true });
             } catch {
                 // Silently fail - roles sync is not critical for app function
             }
        };

        syncRolesToFirestore();

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
    };

    const login = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email: string, password: string, name: string) => {
        let user: User;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            user = userCredential.user;

            await updateProfile(user, {
                displayName: name,
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                // Try logging in instead
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                user = userCredential.user;
            } else {
                throw error;
            }
        }

        try {
             await initializeNewUser(user, name);
        } catch {
            // Firestore write failed - proceed anyway (might be network block/adblocker)
        }

        // Force reload to get the updated display name
        await user.reload();
        setUser(auth.currentUser);
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            // The signed-in user info.
            const user = result.user;
            await checkCreateUserDoc(user);
        } catch (error: any) {
            console.error("Google Sign-in failed", error);
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const checkCreateUserDoc = async (user: User) => {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            try {
                await initializeNewUser(user, user.displayName || 'User');
            } catch {
                // Firestore write failed - proceed anyway
            }
        }
    };

    const initializeNewUser = async (user: User, name: string) => {
        const batch = writeBatch(db);

        const userRef = doc(db, "users", user.uid);
        const roleRef = doc(db, "roles", "default_roles");

        const userData = {
            uid: user.uid,
            name: name,
            email: user.email,
            photoURL: user.photoURL || '',
            createdAt: new Date().toISOString(),
            roles: [''],
            assignedBoardIds: []
        };

        const rolesData = defaultRoles;
        
        batch.set(userRef, userData);
        batch.set(roleRef, rolesData, { merge: true }); 

        const batchCommitPromise = batch.commit();

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Firestore write timed out")), 5000);
        });

        await Promise.race([batchCommitPromise, timeoutPromise]);
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, signup, login, loginWithGoogle, resetPassword }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
