"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, BookOpen, Clock, Activity, ExternalLink, LogOut, User } from "lucide-react";
import Countdown from "@/components/Countdown";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";

const syllabusTopics = [
  { id: "aptitude", label: "General Aptitude", color: "var(--color-neo-green)" },
  { id: "math", label: "Math Foundations", color: "var(--color-neo-blue)" },
  { id: "digitalLogic", label: "Digital Logic", color: "var(--color-neo-red)" },
  { id: "coa", label: "Comp Org & Arch", color: "var(--color-neo-green)" },
  { id: "progDs", label: "Programming & DS", color: "var(--color-neo-blue)" },
  { id: "algo", label: "Algorithms", color: "var(--color-neo-red)" },
  { id: "toc", label: "Theory of Comp", color: "var(--color-neo-green)" },
  { id: "compiler", label: "Compiler Design", color: "var(--color-neo-blue)" },
  { id: "os", label: "Operating Systems", color: "var(--color-neo-red)" },
  { id: "dbms", label: "Database Mgmt", color: "var(--color-neo-green)" },
  { id: "networks", label: "Computer Networks", color: "var(--color-neo-blue)" },
];

export default function Home() {
  const { user, signOut } = useAuth();
  const [progress, setProgress] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    syllabusTopics.forEach(t => init[t.id] = 0);
    return init;
  });

  const [matrix, setMatrix] = useState<boolean[]>(Array(60).fill(false));
  const [isLoaded, setIsLoaded] = useState(false);
  const activeDays = matrix.filter(Boolean).length;

  useEffect(() => {
    async function fetchDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [progRes, matrixRes] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', session.user.id),
        supabase.from('consistency_matrix').select('*').eq('user_id', session.user.id)
      ]);
      
      if (progRes.data) {
        setProgress(prev => {
          const newProg = { ...prev };
          progRes.data.forEach((row: any) => newProg[row.id] = row.progress);
          return newProg;
        });
      }
      
      if (matrixRes.data && matrixRes.data.length > 0) {
        setMatrix(prev => {
          const newMatrix = [...prev];
          matrixRes.data.forEach((row: any) => newMatrix[row.day_index] = row.is_active);
          return newMatrix;
        });
      }
      setIsLoaded(true);
    }
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const updates = Object.entries(progress).map(([id, val]) => ({ id, progress: val, user_id: session.user.id }));
      await supabase.from('user_progress').upsert(updates);
    }, 1000);
    return () => clearTimeout(timer);
  }, [progress, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    const saveMatrix = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const updates = matrix.map((isActive, index) => ({ day_index: index, is_active: isActive, user_id: session.user.id }));
      await supabase.from('consistency_matrix').upsert(updates);
    };
    saveMatrix();
  }, [matrix, isLoaded]);

  const toggleMatrixDay = (index: number) => {
    setMatrix(prev => {
      const newMatrix = [...prev];
      newMatrix[index] = !newMatrix[index];
      return newMatrix;
    });
  };

  const handleProgressChange = (id: string, val: number) => {
    setProgress(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-8 bg-[var(--color-neo-bg)]">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-black pb-4 gap-4">
        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">
          GATE<span className="text-[var(--color-neo-blue)]">_</span>MATRIX
        </h1>
        <div className="flex items-center gap-3">
          {user && (
            <div className="neo-border bg-white px-3 py-2 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <User className="w-4 h-4" />
              <span className="font-bold text-sm uppercase truncate max-w-[180px]">{user.email}</span>
            </div>
          )}
          <div className="neo-border bg-[var(--color-neo-green)] px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Target: 2027
          </div>
          <button
            onClick={signOut}
            className="neo-button bg-[var(--color-neo-red)] text-white flex items-center gap-2 !px-3 !py-2"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-1">
        
        {/* Heatmap Card */}
        <section className="neo-card col-span-1 md:col-span-2 lg:col-span-2 bg-white flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold uppercase border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6" /> Consistency Matrix
            </h2>
            <div className="grid grid-cols-12 gap-1 sm:gap-2 opacity-90">
              {matrix.map((isActive, i) => (
                <button 
                  key={i} 
                  onClick={() => toggleMatrixDay(i)}
                  className={`aspect-square border-2 border-black transition-all ${
                    isActive 
                      ? 'bg-[var(--color-neo-green)] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-100 translate-x-[-1px] translate-y-[-1px]' 
                      : 'bg-gray-100 opacity-50 hover:bg-gray-200 hover:opacity-100 cursor-pointer'
                  }`}
                  aria-label={`Toggle day ${i + 1}`}
                ></button>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t-2 border-black text-sm font-bold uppercase text-gray-800">
            {activeDays} Days Logged — {activeDays > 0 ? "Keep pushing!" : "Start your journey!"}
          </div>
        </section>

        {/* Countdown Timer */}
        <section className="neo-card col-span-1 bg-[var(--color-neo-blue)] text-white border-black border-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-bold uppercase border-b-2 border-black pb-2 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6" /> Countdown
          </h2>
          <Countdown />
          <div className="mt-2 text-xl font-bold uppercase">
            To Feb 2027
          </div>
        </section>

        {/* Global Progress */}
        <section className="neo-card col-span-1 md:col-span-1 lg:col-span-1 bg-white flex flex-col max-h-[500px]">
          <h2 className="text-xl font-bold uppercase border-b-2 border-black pb-2 mb-2 flex items-center gap-2">
            <BookOpen className="w-6 h-6" /> Syllabus Tracker
          </h2>
          <p className="text-xs font-bold text-gray-500 mb-4 uppercase">
            Drag the sliders to log your progress.
          </p>
          
          <div className="space-y-6 overflow-y-auto pr-2 flex-1 pb-4" style={{ scrollbarWidth: 'thin' }}>
            {syllabusTopics.map((topic) => (
              <div key={topic.id} className="relative group">
                <div className="flex justify-between font-bold text-sm mb-1 uppercase">
                  <span>{topic.label}</span>
                  <span>{progress[topic.id]}%</span>
                </div>
                <div className="h-4 w-full border-2 border-black bg-gray-200 relative">
                  <div 
                    className="absolute top-0 left-0 h-full border-r-2 border-black pointer-events-none" 
                    style={{ width: `${progress[topic.id]}%`, backgroundColor: topic.color }}
                  ></div>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={progress[topic.id]} 
                    onChange={(e) => handleProgressChange(topic.id, Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Learning Map (Planner Link) */}
        <section className="neo-card col-span-1 md:col-span-3 lg:col-span-3 bg-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <h2 className="text-3xl font-black uppercase mb-4 relative z-10">
            Interactive Learning Map
          </h2>
          <p className="font-medium text-lg mb-6 relative z-10 max-w-xl">
            Access the DAG-based syllabus tree. Build your own flow notes, paste external resources, and visually map your understanding.
          </p>
          <Link href="/planner" className="inline-flex items-center gap-2 neo-button text-xl bg-[var(--color-neo-red)] text-white relative z-10 border-black">
            Enter Planner <ArrowRight className="w-6 h-6" />
          </Link>
        </section>

        {/* Useful Links */}
        <section className="neo-card col-span-1 bg-[#ffdf00] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold uppercase border-b-2 border-black pb-2 mb-4">
              Resource Vault
            </h2>
            <p className="font-bold text-sm mb-4">
              Manage your external links, NPTEL playlists, and cheat sheets in one dedicated space.
            </p>
          </div>
          <Link href="/resources" className="neo-button bg-white flex justify-center items-center gap-2">
            Open Vault <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

      </main>
    </div>
  );
}
