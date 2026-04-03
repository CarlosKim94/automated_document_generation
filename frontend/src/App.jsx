import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const INITIAL_FORM = {
  client_name: "",
  trainee_name: "",
  job_title: "",
  address: "",
  siret: "",
  start_date: "",
  end_date: "",
  fee: "",
  deposit: "0",
  training_title: "Instagram Impact : incarne ta marque",
  general_objective: "À l'issue de la formation, le stagiaire sera capable de concevoir, structurer et tourner du contenu vidéo engageant...",
  total_hours: "",
  location: "",
  schedule: "",
  objectives: [""]
};

export default function App() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Persistence logic
  useEffect(() => {
    const saved = localStorage.getItem("qualiopi_clients");
    if (saved) setClients(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("qualiopi_clients", JSON.stringify(clients));
  }, [clients]);

  // Form Handlers
  function updateField(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const addObjective = () => {
    if (form.objectives.length < 8) {
      setForm(prev => ({ ...prev, objectives: [...prev.objectives, ""] }));
    }
  };

  const updateObjective = (index, value) => {
    const newObjs = [...form.objectives];
    newObjs[index] = value;
    setForm(prev => ({ ...prev, objectives: newObjs }));
  };

  // Client Management
  function handleSaveClient(e) {
    e.preventDefault();
    if (!form.client_name) { setMessage("Company name required"); return; }

    if (editingId) {
      setClients(prev => prev.map(c => c.id === editingId ? { ...form, id: editingId } : c));
      setMessage("Client updated!");
      setEditingId(null);
    } else {
      const id = Date.now();
      setClients(prev => [{ id, ...form }, ...prev]);
      setMessage("Client added!");
    }

    setForm(INITIAL_FORM);
    setTimeout(() => setMessage(""), 2000);
  }

  function startEdit(client) {
    setForm(client);
    setEditingId(client.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteClient(id) {
    if (window.confirm("Are you sure you want to delete this client?")) {
      setClients(prev => prev.filter(c => c.id !== id));
      setMessage("Client removed");
      setTimeout(() => setMessage(""), 2000);
    }
  }

  /**
   * REPLACED OLD FUNCTIONS WITH THIS UNIFIED GENERATOR
   */
  async function generatePDF(client, templateFile, downloadPrefix) {
    setLoading(true);
    try {
      const fee = parseFloat(client.fee || 0);
      const deposit = parseFloat(client.deposit || 0);
      const activeObjectives = client.objectives
        .map(obj => obj.trim())
        .filter(obj => obj !== "");

      const client_data = {
        CLIENT_NAME: client.client_name,
        CLIENT_ADDRESS: client.address || "Adresse à compléter",
        CLIENT_SIRET: client.siret || "Non renseigné",
        CLIENT_TRAINEE_NAME: client.trainee_name,
        TRAINING_TITLE: client.training_title,
        GENERAL_OBJECTIVE: client.general_objective,
        TOTAL_HOURS: client.total_hours,
        LOCATION_OR_REMOTE: client.location,
        DATES_AND_SCHEDULE: client.schedule,
        JOB_TITLE: client.job_title,
        fee: fee, 
        deposit: deposit,
        UNIT_COST_HT: fee.toFixed(2),
        TOTAL_HT: fee.toFixed(2),
        TOTAL_TTC: fee.toFixed(2),
        DEPOSIT_AMOUNT: deposit.toFixed(2),
        BALANCE_DUE: (fee - deposit).toFixed(2),
        signature_date: client.start_date || new Date().toISOString().split('T')[0],
        OBJECTIVES: activeObjectives,
      };

      const res = await fetch(`${API_BASE}/documents/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          client_data: client_data,
          template_name: templateFile // Now passing the correct variable
        })
      });

      if (!res.ok) throw new Error("Generation failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${downloadPrefix}_${client.client_name.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setMessage(`${downloadPrefix} Generated!`);
    } catch (err) {
      console.error(err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      <header className="sticky top-0 z-50 bg-white/80 border-b border-slate-200 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">Q</div>
            <h1 className="text-lg font-bold tracking-tight">Qualiopi Generator</h1>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${loading ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
            {loading ? "Processing..." : "System Ready"}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: FORM */}
          <section className="col-span-12 lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold mb-6 text-slate-800">
                {editingId ? "📝 Edit Client" : "✨ New Client"}
              </h2>
              
              <form onSubmit={handleSaveClient} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  {/* SECTION 1: IDENTITY */}
                  <div className="col-span-2 space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company Name</label>
                      <input name="client_name" value={form.client_name} onChange={updateField} placeholder="e.g. DigitBSPartner" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Trainee Name</label>
                        <input name="trainee_name" value={form.trainee_name} onChange={updateField} placeholder="e.g. Jean Dupont" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fonction (Job Title)</label>
                        <input name="job_title" value={form.job_title} onChange={updateField} placeholder="e.g. Stagiaire / Manager" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: ADMIN & DATES */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Address</label>
                    <input name="address" value={form.address} onChange={updateField} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">SIRET</label>
                    <input name="siret" value={form.siret} onChange={updateField} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Start Date</label>
                    <input name="start_date" type="date" value={form.start_date} onChange={updateField} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">End Date</label>
                    <input name="end_date" type="date" value={form.end_date} onChange={updateField} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>

                  {/* SECTION 3: TRAINING CONTENT */}
                  <div className="col-span-2 border-t pt-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Training Title</label>
                    <input name="training_title" value={form.training_title} onChange={updateField} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4" />
                  
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">General Objective</label>
                    <textarea name="general_objective" value={form.general_objective} onChange={updateField} rows="2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pedagogical Objectives</label>
                    {form.objectives.map((obj, idx) => (
                      <input key={idx} value={obj} onChange={(e) => updateObjective(idx, e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm" />
                    ))}
                    {form.objectives.length < 8 && (
                      <button type="button" onClick={addObjective} className="text-xs text-indigo-600 font-bold">+ Add Row</button>
                    )}
                  </div>
                  {/* Duration */}
                  <div>
                    <label className="col-span-2 space-y-2">
                      Durée de l’action de formation
                    </label>
                    <input 
                      name="total_hours" 
                      value={form.total_hours} 
                      onChange={updateField} 
                      placeholder="e.g. 21 heures" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    />
                  </div>
                  {/* Location */}
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Lieu
                    </label>
                    <input 
                      name="location" 
                      value={form.location} 
                      onChange={updateField} 
                      placeholder="e.g. À distance / Lieu"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    />
                  </div>
                  {/* Schedule */}
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Dates et horaires
                    </label>
                    <input 
                      name="schedule" 
                      value={form.schedule} 
                      onChange={updateField} 
                      placeholder="e.g. 11 Mars 2026, 9h00 - 12h30 / 13h30 - 17h00" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    />
                  </div>

                  {/* SECTION 4: FINANCIALS (NOW GROUPED) */}
                  <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4 bg-indigo-50/30 p-4 rounded-2xl">
                    <div>
                      <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Total Fee (€ HT)</label>
                      <input name="fee" type="number" value={form.fee} onChange={updateField} className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">Deposit Paid (€ HT)</label>
                      <input name="deposit" type="number" value={form.deposit} onChange={updateField} className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-400 italic">
                        Balance to be generated: <b>{(parseFloat(form.fee || 0) - parseFloat(form.deposit || 0)).toFixed(2)} €</b>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex items-center justify-between border-t border-slate-100">
                  <p className="text-sm text-indigo-600 font-medium">{message}</p>
                  <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg">
                    {editingId ? "Update Client" : "Add Client"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* RIGHT: LIST */}
          <aside className="col-span-12 lg:col-span-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Client Database</h2>
            <div className="space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
              {clients.map((c) => (
                <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-all">
                  <div className="mb-4">
                    <h4 className="font-bold text-slate-800">{c.client_name}</h4>
                    <p className="text-xs text-slate-500">{c.training_title}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => generatePDF(c, "template.md", "Convention")} 
                      disabled={loading}
                      className="w-full bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                      {loading ? "..." : "1. Generate Convention"}
                    </button>
                    <button 
                      onClick={() => generatePDF(c, "roadmap.md", "Deroule")} 
                      disabled={loading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                      {loading ? "..." : "2. Generate Roadmap"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}