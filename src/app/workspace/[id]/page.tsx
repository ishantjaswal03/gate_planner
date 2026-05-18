"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import { ReactFlow, Background, Controls, Edge, Node, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange, Connection, Handle, Position } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { ArrowLeft, Plus, Save } from "lucide-react";
import { use } from "react";
import { supabase } from "@/lib/supabase";

// Store text changes in a ref accessible to the node component
const textStore: Record<string, string> = {};

// Custom Block Node
const TextBlockNode = ({ id, data, isConnectable }: any) => {
  const handleChange = (value: string) => {
    textStore[id] = value;
  };

  return (
    <div className="neo-border bg-white p-2 min-w-[200px] shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] transition-shadow duration-100">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!bg-black !w-3 !h-3 !border-2 !border-white" />
      <textarea 
        className="w-full min-h-[100px] bg-transparent outline-none font-sans text-sm resize-y font-bold" 
        defaultValue={data.text || ""}
        placeholder="Type here..."
        onChange={(evt) => handleChange(evt.target.value)}
      />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!bg-[var(--color-neo-blue)] !w-3 !h-3 !border-2 !border-black" />
    </div>
  );
};

const nodeTypes = { textBlock: TextBlockNode };

export default function Workspace({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const topicId = resolvedParams.id;
  const decodeTopic = decodeURIComponent(topicId);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchWorkspace() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      
      const { data, error } = await supabase
        .from('workspace_notes')
        .select('*')
        .eq('topic_id', decodeTopic)
        .eq('user_id', session.user.id)
        .single();
        
      if (data && data.nodes) {
        const loadedNodes = data.nodes.map((n: any) => ({
          ...n,
          data: { text: n.data?.text || "" }
        }));
        setNodes(loadedNodes);
        setEdges(data.edges || []);
        // Pre-fill the text store
        loadedNodes.forEach((n: any) => {
          textStore[n.id] = n.data.text || "";
        });
      }
      setIsLoaded(true);
    }
    fetchWorkspace();
  }, [decodeTopic]);

  const saveWorkspace = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Merge latest text from the store into node data before saving
    const nodesToSave = nodes.map(n => ({
      id: n.id,
      type: n.type,
      position: n.position,
      data: { text: textStore[n.id] ?? n.data?.text ?? "" }
    }));

    const { error } = await supabase.from('workspace_notes').upsert({
      topic_id: decodeTopic,
      user_id: session.user.id,
      nodes: nodesToSave,
      edges
    }, { onConflict: 'topic_id,user_id' });

    if (error) {
      console.error(error);
      alert("Failed to save workspace!");
    } else {
      alert("Workspace Saved!");
    }
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

  const addTextBlock = () => {
    const id = `block-${Date.now()}`;
    textStore[id] = "";
    const newNode: Node = {
      id,
      type: 'textBlock',
      position: { x: window.innerWidth / 2 - 100 + (Math.random() * 50), y: window.innerHeight / 2 - 100 + (Math.random() * 50) },
      data: { text: "" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col h-screen bg-[var(--color-neo-bg)] overflow-hidden">
      <header className="p-4 border-b-4 border-black flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <Link href="/planner" className="neo-button bg-white text-black">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black uppercase">Workspace: {decodeTopic}</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={addTextBlock} className="neo-button bg-[var(--color-neo-green)] flex items-center gap-2">
            <Plus className="w-5 h-5" /> New Block
          </button>
          <button onClick={saveWorkspace} className="neo-button bg-[var(--color-neo-blue)] text-white flex items-center gap-2">
            <Save className="w-5 h-5" /> Save
          </button>
        </div>
      </header>
      
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background color="#000" gap={24} size={2} />
          <Controls className="neo-border bg-white [&>button]:border-b-2 [&>button]:border-black" />
        </ReactFlow>
      </div>
    </div>
  );
}
