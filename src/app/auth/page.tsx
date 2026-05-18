"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  const envMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isLogin) {
        const res = await supabase.auth.signInWithPassword({ email, password });
        if (res.error) {
          setErrorMsg(res.error.message);
        } else {
          router.push("/");
        }
      } else {
        const res = await supabase.auth.signUp({ email, password });
        if (res.error) {
          setErrorMsg(res.error.message);
        } else if (!res.data.session) {
          setSuccessMsg("Registration Successful! Check your email to verify your account.");
        } else {
          router.push("/");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Auth error:", err);
      setErrorMsg(`Network error: ${message}. Check your internet connection and Supabase configuration.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neo-bg)] p-4">
      <div className="neo-card bg-white w-full max-w-md">
        <h1 className="text-3xl font-black uppercase mb-6 text-center">
          {isLogin ? "Enter the Matrix" : "Register Node"}
        </h1>

        {envMissing && (
          <div className="mb-4 p-3 bg-yellow-100 border-4 border-yellow-500 text-yellow-800 font-bold text-sm">
            ⚠️ Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your Vercel environment variables and redeploy.
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 border-4 border-red-500 text-red-800 font-bold text-sm">
            ❌ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 border-4 border-green-500 text-green-800 font-bold text-sm">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm uppercase">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border-4 border-black p-2 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm uppercase">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border-4 border-black p-2 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="neo-button bg-[var(--color-neo-blue)] text-white mt-4 disabled:opacity-50"
          >
            {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold uppercase text-sm hover:underline"
          >
            {isLogin ? "Need an account? Sign up" : "Already registered? Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
