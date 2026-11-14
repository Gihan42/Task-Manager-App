import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { saveAuthData } from "../lib/auth-storage";
import { backendGoogleAuth } from "../api/googleAuth";
interface LoginForm {
  email: string;
  password: string;
}
export const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordWarning, setForgotPasswordWarning] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       if ((await loginForm({ email, password })) === true || (await loginForm({ email, password })) === false) {
//         await login(email, password);
//         toast.success("Welcome back!");
//         navigate("/");
//       } else {
//         toast.error("Failed to login user in the system");
//       }
//     } catch (err: any) {
//       const errorMessage =
//         err.code === "auth/invalid-credential"
//           ? "Invalid email or password"
//           : err.message || "Failed to login";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);
  try {
    const backendOk = await loginForm({ email, password });

    if (!backendOk) {
      toast.error("Invalid email or password");
      return;
    }else{
        toast.success("Welcome back!");
        navigate("/");
    }

  } catch (err: any) {
    const errorMessage = err.message || "Failed to login";
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

    // const handleSocialLogin = async (provider: string) => {
    //     if (provider === 'google') {
    //         try {
    //             const result = await loginWithGoogle();
    //             const ok = await backendGoogleAuth(result.user);
    //
    //
    //
    //             const email = result.user.email ?? ''
    //             const response = await fetch(
    //                 `${import.meta.env.VITE_API_URL}employee/${encodeURIComponent(email)}`
    //             );
    //
    //             if (response.ok) {
    //                 if (!ok) {
    //                     toast.error("Failed to sign in with the server");
    //                     return;
    //                 }
    //
    //                 const resJson = await response.json().catch(() => null);
    //                 if (resJson?.data && typeof resJson.data === 'object') {
    //                     saveAuthData(resJson.data);
    //                 }
    //                 const backendOk = await loginForm({ email, password });
    //
    //                 if (!backendOk) {
    //                     toast.error("Invalid email or password");
    //                     return;
    //                 }else{
    //                     toast.success("Welcome back!");
    //                     navigate("/");
    //                 }
    //
    //             }
    //
    //             const errData = await response.json().catch(() => null);
    //             setForgotPasswordWarning(errData?.message || "User not found in this email");
    //             return;
    //
    //         } catch (err: any) {
    //             const errorMessage = 'Failed to login with Google';
    //             setError(errorMessage);
    //             toast.error(errorMessage);
    //         }
    //     }
    // };
    const handleSocialLogin = async (provider: string) => {
        if (provider === "google") {
            try {
                const result = await loginWithGoogle(); // Firebase popup
                const email = result.user.email ?? "";


                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}employee/${encodeURIComponent(email)}`,
                );

                if (!response.ok) {
                    const errData = await response.json().catch(() => null);
                    setForgotPasswordWarning(errData?.message || "User not found in this email");
                    return;
                }

                const resJson = await response.json().catch(() => null);
                if (resJson?.data && typeof resJson.data === "object") {
                    saveAuthData(resJson.data);
                }


                const ok = await backendGoogleAuth(result.user);
                if (!ok) {
                    toast.error("Failed to sign in with the server");
                    return;
                }

                toast.success("Welcome back!");
                navigate("/");
            } catch (err: any) {
                const errorMessage = "Failed to login with Google";
                setError(errorMessage);
                toast.error(errorMessage);
            }
        }
    };

 const loginForm = async (formData: LoginForm): Promise<boolean> => {
  try {
    const payload = {
      email: formData.email,
      password: formData.password,
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}employee/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || "Failed to login user");
    }

    const resJson = await response.json(); 
    const data = resJson?.data;
    if (!data) {
      throw new Error("Invalid response from server");
    }

    saveAuthData(data);

    localStorage.setItem("access_token", data.token);
    localStorage.setItem("refresh_token", data.refreshToken);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);

    return true;
  } catch (error) {
    console.error("Error logging in:", error);
    return false;
  }
};

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setForgotPasswordWarning("Please enter your email above first");
      return;
    }
    try {
      setForgotPasswordWarning("");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}employee/${encodeURIComponent(trimmedEmail)}`
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        setForgotPasswordWarning(errData?.message || "User not found with this email");
        return;
      }

      const result = await response.json();
      const isGoogleAccount = result?.data === true;

      if (isGoogleAccount) {
        // response true -> Firebase Forgot Password page
        navigate("/forgot-password", { state: { email: trimmedEmail } });
      } else {
        // response false -> newly created Reset Password page
        navigate("/reset-password", { state: { email: trimmedEmail } });
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setForgotPasswordWarning("Failed to connect to server. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20 animate-fade-in p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl shadow-lg border border-[hsl(var(--border))]">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm">
            Enter your credentials to access your workspace
          </p>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (forgotPasswordWarning) setForgotPasswordWarning("");
              }}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full font-semibold shadow-md"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[hsl(var(--border))]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="ghost"
            className="btn-social w-full flex gap-2 items-center justify-center"
            onClick={() => handleSocialLogin("google")}
          >
            <svg
              className="h-5 w-5"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M17.788 5.108a9 9 0 1 0 3.212 6.892h-8" />
            </svg>
            Google
          </Button>
        </div>

        <div className="text-center text-sm space-y-2">
          <div>
            <button
              type="button"
              onClick={handleForgotPassword}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                outline: "none",
              }}
              className="text-muted-foreground hover:text-primary underline-offset-4 hover:underline cursor-pointer transition-colors text-sm"
            >
              Forgot your password?
            </button>
            {forgotPasswordWarning && (
              <p className="text-xs text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1.5 mt-1.5 animate-slide-down font-medium">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {forgotPasswordWarning}
              </p>
            )}
          </div>
          <div className="text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
