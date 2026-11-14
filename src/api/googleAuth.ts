import type { User } from "firebase/auth";
import { saveAuthData } from "../lib/auth-storage";

export const backendGoogleAuth = async (firebaseUser: User): Promise<boolean> => {
    try {
        const idToken = await firebaseUser.getIdToken();

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}employee/google-auth`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            },
        );

        if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.message || "Google auth failed on server");
        }

        const resJson = await response.json(); 
        const data = resJson?.data;
        if (!data?.token) throw new Error("Invalid response from server");

        saveAuthData(data);
        localStorage.setItem("access_token", data.token);
        localStorage.setItem("refresh_token", data.refreshToken);
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);

        return true;
    } catch (error) {
        console.error("Google backend auth failed:", error);
        return false;
    }
};