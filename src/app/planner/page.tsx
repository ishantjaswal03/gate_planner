"use client";

import React, { useCallback, useEffect, useState } from "react";
import { ReactFlow, Background, Controls, Edge, Node, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { ArrowLeft, Plus, Save, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const initialNodes: Node[] = [
  { id: "0", position: { x: 450, y: 50 }, data: { label: "0. General Aptitude" }, className: "neo-node" },
  { id: "1a", position: { x: 150, y: 150 }, data: { label: "1. Programming & DS (Core)" }, className: "neo-node" },
  { id: "2a", position: { x: 450, y: 150 }, data: { label: "2. Math Foundations (Core)" }, className: "neo-node" },
  { id: "4", position: { x: 850, y: 150 }, data: { label: "4. Digital Logic" }, className: "neo-node" },
  { id: "1b", position: { x: 50, y: 250 }, data: { label: "1. Programming & DS (Adv)" }, className: "neo-node" },
  { id: "3a", position: { x: 250, y: 250 }, data: { label: "3. Algorithmic Core" }, className: "neo-node" },
  { id: "6", position: { x: 450, y: 250 }, data: { label: "6. Theory of Computation" }, className: "neo-node" },
  { id: "9", position: { x: 650, y: 250 }, data: { label: "9. Database Management" }, className: "neo-node" },
  { id: "5", position: { x: 850, y: 250 }, data: { label: "5. Comp. Org. & Arch." }, className: "neo-node" },
  { id: "3b", position: { x: 250, y: 350 }, data: { label: "3. Algorithms (Adv)" }, className: "neo-node" },
  { id: "7", position: { x: 450, y: 350 }, data: { label: "7. Compiler Design" }, className: "neo-node" },
  { id: "8", position: { x: 850, y: 350 }, data: { label: "8. Operating Systems" }, className: "neo-node" },
  { id: "10", position: { x: 850, y: 450 }, data: { label: "10. Computer Networks" }, className: "neo-node" },
];

const initialEdges: Edge[] = [
  { id: "e1a-1b", source: "1a", target: "1b", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
  { id: "e1a-3a", source: "1a", target: "3a", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
  { id: "e3a-3b", source: "3a", target: "3b", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
  { id: "e2a-6", source: "2a", target: "6", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
  { id: "e6-7", source: "6", target: "7", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
  { id: "e4-5", source: "4", target: "5", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
  { id: "e5-8", source: "5", target: "8", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
  { id: "e1a-8", source: "1a", target: "8", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
  { id: "e8-10", source: "8", target: "10", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
  { id: "e2a-9", source: "2a", target: "9", type: "smoothstep", style: { strokeWidth: 3, stroke: "black" } },
];

export default function Planner() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  useEffect(() => {
    async function fetchMatrix() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [nodesRes, edgesRes] = await Promise.all([
        supabase.from('planner_nodes').select('*').eq('user_id', session.user.id),
        supabase.from('planner_edges').select('*').eq('user_id', session.user.id)
      ]);

      if (nodesRes.data && nodesRes.data.length > 0) {
        setNodes(nodesRes.data as Node[]);
        setEdges((edgesRes.data || []) as Edge[]);
      } else {
        setNodes(initialNodes);
        setEdges(initialEdges);
      }
      setIsLoaded(true);
    }
    fetchMatrix();
  }, []);

  const saveMatrix = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('planner_nodes').delete().eq('user_id', session.user.id);
    await supabase.from('planner_edges').delete().eq('user_id', session.user.id);

    if (nodes.length > 0) {
      const dbNodes = nodes.map(n => ({ id: String(n.id), data: n.data, position: n.position, className: n.className, user_id: session.user.id }));
      await supabase.from('planner_nodes').insert(dbNodes);
    }
    if (edges.length > 0) {
      const dbEdges = edges.map(e => ({ id: String(e.id), source: String(e.source), target: String(e.target), type: e.type, style: e.style, user_id: session.user.id }));
      await supabase.from('planner_edges').insert(dbEdges);
    }
    alert("Matrix Saved to Supabase!");
  };

  const addTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    
    const newNode: Node = {
      id: Date.now().toString(),
      position: { x: window.innerWidth / 2 - 100 + (Math.random() * 50), y: window.innerHeight / 2 - 100 + (Math.random() * 50) },
      data: { label: newTopicName },
      className: "neo-node"
    };
    setNodes(nds => [...nds, newNode]);
    setNewTopicName("");
  };

  const onNodesChange = useCallback(
    (changes: NodeChange<Node>[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, style: { strokeWidth: 3, stroke: "black" } }, eds)),
    []
  );

  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    const label = encodeURIComponent(node.data.label as string);
    router.push(`/workspace/${label}`);
  }, [router]);

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col h-screen bg-[var(--color-neo-bg)]">
      <header className="p-4 border-b-4 border-black flex flex-col sm:flex-row gap-4 items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="neo-button bg-white text-black">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-black uppercase hidden sm:block">Study Planner Matrix</h1>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold uppercase bg-gray-100 p-2 border-2 border-black">
          <Info className="w-4 h-4" /> Dbl-Click Node: Workspace | Select + Backspace: Delete
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={addTopic} className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="New Topic..."
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              className="border-2 border-black px-2 py-1 font-bold text-sm"
            />
            <button type="submit" className="neo-button bg-[var(--color-neo-green)] flex items-center gap-2 text-sm !px-2 !py-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
          <button onClick={saveMatrix} className="neo-button bg-[var(--color-neo-blue)] text-white flex items-center gap-2 text-sm !px-2 !py-1">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </header>
      
      <div className="flex-1 w-full h-full relative">
        <style>{`
          .neo-node {
            background-color: white !important;
            border: 4px solid black !important;
            border-radius: 0 !important;
            box-shadow: 4px 4px 0px rgba(0,0,0,1) !important;
            font-weight: 900 !important;
            padding: 15px !important;
            text-transform: uppercase !important;
            font-size: 12px !important;
            transition: box-shadow 0.1s !important;
            cursor: pointer !important;
          }
          .neo-node:hover {
            box-shadow: 8px 8px 0px rgba(0,0,0,1) !important;
          }
        `}</style>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          fitView
        >
          <Background color="#000" gap={20} size={2} />
          <Controls className="neo-border bg-white [&>button]:border-b-2 [&>button]:border-black" />
        </ReactFlow>
      </div>
    </div>
  );
}
