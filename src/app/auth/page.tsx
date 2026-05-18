"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    let error;
    if (isLogin) {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    } else {
      const res = await supabase.auth.signUp({ email, password });
      error = res.error;
      
      if (!error && !res.data.session) {
        alert("Registration Successful! Please check your email to verify your account. (Or disable 'Confirm Email' in your Supabase Auth settings to skip this step).");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    
    if (error) {
      alert(error.message);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neo-bg)] p-4">
      <div className="neo-card bg-white w-full max-w-md">
        <h1 className="text-3xl font-black uppercase mb-6 text-center">
          {isLogin ? "Enter the Matrix" : "Register Node"}
        </h1>
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
