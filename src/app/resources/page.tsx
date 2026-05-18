"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, ExternalLink, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Resource = {
  id: string;
  title: string;
  url: string;
};

const initialResources: Resource[] = [
  { id: "1", title: "NPTEL OS Lectures", url: "https://nptel.ac.in/courses/106105214" },
  { id: "2", title: "Stanford Algo", url: "https://www.coursera.org/specializations/algorithms" },
  { id: "3", title: "GATE Overflow", url: "https://gateoverflow.in/" },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    async function fetchResources() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.from('resources').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true });
      if (data && !error) {
        setResources(data as Resource[]);
      } else if (error) {
        console.error("Error fetching resources:", error);
      }
      setIsLoaded(true);
    }
    fetchResources();
  }, []);

  const addResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newResource = {
      id: Date.now().toString(),
      title: newTitle,
      url: newUrl.startsWith('http') ? newUrl : `https://${newUrl}`,
      user_id: session.user.id
    };

    setResources([...resources, newResource]);
    setNewTitle("");
    setNewUrl("");

    const { error } = await supabase.from('resources').insert([newResource]);
    if (error) console.error("Error inserting resource:", error);
  };

  const removeResource = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setResources(resources.filter(r => r.id !== id));
    
    const { error } = await supabase.from('resources').delete().eq('id', id).eq('user_id', session.user.id);
    if (error) console.error("Error deleting resource:", error);
  };

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-8 bg-[var(--color-neo-bg)]">
      <header className="mb-8 flex items-center justify-between border-b-4 border-black pb-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="neo-button bg-white text-black">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
            Resource Vault
          </h1>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Add Resource Form */}
        <section className="col-span-1 h-min">
          <form onSubmit={addResource} className="neo-card bg-[var(--color-neo-blue)] flex flex-col gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xl font-bold uppercase border-b-2 border-black pb-2 text-white">
              Add New Resource
            </h2>
            
            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm uppercase text-white">Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. GeeksforGeeks DS"
                className="border-4 border-black p-2 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="font-bold text-sm uppercase text-white">URL Link</label>
              <input 
                type="text" 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
                className="border-4 border-black p-2 font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                required
              />
            </div>

            <button type="submit" className="neo-button bg-[var(--color-neo-green)] mt-2 flex justify-center items-center gap-2">
              <Plus className="w-5 h-5" /> Add to Vault
            </button>
          </form>
        </section>

        {/* Resources List */}
        <section className="col-span-1 md:col-span-2 flex flex-col gap-4">
          {resources.length === 0 ? (
            <div className="neo-card bg-white text-center py-12">
              <p className="font-bold text-xl uppercase opacity-50">Vault is Empty</p>
            </div>
          ) : (
            resources.map((resource) => (
              <div key={resource.id} className="neo-card bg-white flex justify-between items-center transition-all hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center gap-3 group"
                >
                  <ExternalLink className="w-6 h-6 group-hover:text-[var(--color-neo-blue)] transition-colors" />
                  <div>
                    <h3 className="font-bold text-lg uppercase group-hover:underline">{resource.title}</h3>
                    <p className="text-sm font-mono opacity-70 break-all pr-4">{resource.url}</p>
                  </div>
                </a>
                
                <button 
                  onClick={() => removeResource(resource.id)}
                  className="neo-button bg-[var(--color-neo-red)] text-white !px-3 !py-3 flex-shrink-0"
                  aria-label="Delete resource"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </section>

      </main>
    </div>
  );
}
