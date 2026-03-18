import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

// Simple Icon Components
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IconFileText = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>;
const IconUpload = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
const IconCheck = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconAlert = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconChevron = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IconDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

// --- View Components ---

const DashboardView = ({ clients, coordMap, setActiveTab }) => (
  <div className="space-y-8 animate-in">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="card p-6 border-l-4 border-l-orange-500">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Clients</p>
        <h3 className="text-3xl font-bold text-slate-800">{clients.length}</h3>
      </div>
      <div className="card p-6 border-l-4 border-l-emerald-500">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Modèle Actif</p>
        <h3 className="text-sm font-bold text-slate-800 truncate">{coordMap ? "Configuré (" + coordMap.count + " champs)" : "Aucun modèle"}</h3>
      </div>
      <div className="card p-6 border-l-4 border-l-blue-500">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
        <h3 className="text-3xl font-bold text-slate-800">
          {clients.reduce((sum, c) => sum + (parseFloat(c.fee) || 0), 0).toFixed(2)} €
        </h3>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="card p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Activité Récente</h2>
        <div className="space-y-4">
          {clients.slice(0, 3).map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold">
                  {c.client_name ? c.client_name.charAt(0) : "?"}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{c.client_name}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Ajouté récemment</p>
                </div>
              </div>
              <IconChevron />
            </div>
          ))}
          {clients.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Aucune activité.</p>}
        </div>
      </div>
      <div className="card p-6 bg-slate-900 text-white border-none">
        <h2 className="text-lg font-bold mb-4 text-orange-400">Prêt à générer ?</h2>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Ajoutez vos clients et configurez votre modèle PDF pour commencer à automatiser vos documents Qualiopi en un clic.
        </p>
        <button 
          onClick={() => setActiveTab("clients")}
          className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all"
        >
          Gérer mes clients
        </button>
      </div>
    </div>
  </div>
);

const ClientsView = ({ clients, form, updateField, addClient, generatePack, loading }) => (
  <div className="grid grid-cols-12 gap-8 animate-in">
    <div className="col-span-12 lg:col-span-8">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">Ajouter un nouveau client</h2>
          <div className="text-orange-500"><IconPlus /></div>
        </div>
        
        <form onSubmit={addClient} className="space-y-8">
          {/* Section 1: Informations Client */}
          <div>
            <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center">
              <span className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center mr-2 text-[10px]">1</span>
              Informations sur l'entreprise
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nom de l'entreprise</label>
                <input name="client_name" value={form.client_name} onChange={updateField} placeholder="Ex: Acme Corp" className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Siège social (Adresse complète)</label>
                <input name="client_address" value={form.client_address} onChange={updateField} placeholder="123 rue de la Paix, 75000 Paris" className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Siret</label>
                <input name="client_siret" value={form.client_siret} onChange={updateField} placeholder="123 456 789 00012" className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Représentée par</label>
                <input name="client_representative" value={form.client_representative} onChange={updateField} placeholder="Nom du gérant" className="input-field" />
              </div>
            </div>
          </div>

          {/* Section 2: Informations Formation */}
          <div>
            <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center">
              <span className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center mr-2 text-[10px]">2</span>
              Détails de la formation
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Intitulé de l'action</label>
                <input name="training_title" value={form.training_title} onChange={updateField} placeholder="Ex: Formation Marketing Digital" className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nom du stagiaire</label>
                <input name="trainee_name" value={form.trainee_name} onChange={updateField} placeholder="Jean Dupont" className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Durée (heures)</label>
                <input name="training_duration" value={form.training_duration} onChange={updateField} placeholder="Ex: 21 heures" className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Lieu de formation</label>
                <input name="training_location" value={form.training_location} onChange={updateField} placeholder="Adresse ou 'Distanciel'" className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dates et horaires</label>
                <input name="training_dates_hours" value={form.training_dates_hours} onChange={updateField} placeholder="Ex: Du 10 au 12 mars, de 9h à 17h" className="input-field" />
              </div>
            </div>
          </div>

          {/* Section 3: Financier & Signature */}
          <div>
            <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4 flex items-center">
              <span className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center mr-2 text-[10px]">3</span>
              Finances et Signature
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Frais de formation (€)</label>
                <input name="fee" value={form.fee} onChange={updateField} type="number" step="0.01" placeholder="0.00" className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Acompte versé (€)</label>
                <input name="deposit" value={form.deposit} onChange={updateField} type="number" step="0.01" placeholder="0.00" className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fait à (Ville)</label>
                <input name="signature_city" value={form.signature_city} onChange={updateField} placeholder="Aubagne" className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Le (Date de signature)</label>
                <input name="signature_date" value={form.signature_date} onChange={updateField} type="date" className="input-field" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" className="btn-primary w-full py-4 text-base">
              <IconPlus />
              <span>Enregistrer le client</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <div className="col-span-12 lg:col-span-4">
      <div className="card flex flex-col h-full bg-white max-h-[800px]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Mes Clients</h2>
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full uppercase">{clients.length}</span>
        </div>
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {clients.map(c => (
            <div key={c.id} className="group p-4 bg-white border border-slate-100 rounded-xl hover:border-orange-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate pr-2">{c.client_name}</h3>
                  <p className="text-xs text-slate-500 flex items-center mt-1 truncate">
                    <span className="opacity-70 mr-1"><IconUsers /></span>
                    {c.trainee_name}
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 flex-shrink-0">
                  {c.fee ? `${c.fee} €` : "—"}
                </span>
              </div>
              <button
                onClick={() => generatePack(c)}
                disabled={loading}
                className="w-full py-2 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 hover:bg-orange-500 hover:text-white transition-all border border-slate-200"
              >
                <IconDownload />
                <span>Générer Pack Qualiopi</span>
              </button>
            </div>
          ))}
          {clients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
              <IconUsers />
              <p className="text-sm mt-2">Aucun client enregistré.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const TemplatesView = ({ templateFile, setTemplateFile, uploadTemplate, extractHighlights, coordMap, loading }) => (
  <div className="max-w-3xl mx-auto animate-in">
    <div className="card p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestion des Modèles</h2>
          <p className="text-sm text-slate-500 mt-1">Configurez votre PDF maître avec des zones surlignées.</p>
        </div>
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500">
          <IconFileText />
        </div>
      </div>
      
      <div className="bg-slate-50 rounded-2xl p-12 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 border border-slate-100">
          <div className="text-slate-400 scale-150"><IconUpload /></div>
        </div>
        <p className="text-lg font-bold text-slate-800 mb-2">Télécharger votre PDF maître</p>
        <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto">
          Utilisez un PDF avec des surlignages (highlights) là où vous souhaitez insérer les données clients.
        </p>
        
        <input type="file" id="pdf-upload" accept="application/pdf" onChange={e => setTemplateFile(e.target.files?.[0] ?? null)} className="hidden" />
        
        <div className="flex items-center space-x-4">
          <label htmlFor="pdf-upload" className="cursor-pointer px-6 py-3 bg-white border border-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
            {templateFile ? templateFile.name : "Choisir un fichier"}
          </label>
          <button onClick={uploadTemplate} disabled={loading || !templateFile} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/20">
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </div>
      </div>

      {templateFile && (
        <div className="mt-8 p-6 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between animate-in">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
              <IconSearch />
            </div>
            <div>
              <p className="font-bold text-slate-800">Analyse Automatique</p>
              <p className="text-xs text-slate-500">Détecter les placeholders surlignés dans le document.</p>
            </div>
          </div>
          <button onClick={extractHighlights} className="px-6 py-3 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
            Extraire les champs
          </button>
        </div>
      )}

      {coordMap && (
        <div className="mt-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Champs détectés ({coordMap.count})</h3>
          <div className="grid grid-cols-2 gap-3">
            {coordMap.placeholders.map((ph, i) => (
              <div key={i} className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 truncate">{ph.placeholder_name}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">Page {ph.page + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm] = useState({
    client_name: "",
    client_address: "",
    client_siret: "",
    client_representative: "",
    training_title: "",
    trainee_name: "",
    training_duration: "",
    training_location: "",
    training_dates_hours: "",
    fee: "",
    deposit: "",
    signature_city: "",
    signature_date: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [templateFile, setTemplateFile] = useState(null);
  const [coordMap, setCoordMap] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("adg_clients");
    if (saved) setClients(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("adg_clients", JSON.stringify(clients));
  }, [clients]);

  const showMsg = (text, type = "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addClient = (e) => {
    e.preventDefault();
    if (!form.client_name) { showMsg("Nom de l'entreprise requis", "error"); return; }
    const id = Date.now();
    setClients(prev => [{ id, ...form }, ...prev]);
    // Reset form
    setForm({
      client_name: "", client_address: "", client_siret: "", client_representative: "",
      training_title: "", trainee_name: "", training_duration: "", training_location: "",
      training_dates_hours: "", fee: "", deposit: "", signature_city: "", signature_date: ""
    });
    showMsg("Client ajouté avec succès", "success");
  };

  async function uploadTemplate() {
    if (!templateFile) { showMsg("Choisissez un PDF à télécharger", "error"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", templateFile);
      const res = await fetch(`${API_BASE}/documents/upload-template`, {
        method: "POST",
        body: fd
      });
      if (!res.ok) throw new Error(await res.text());
      showMsg("Modèle téléchargé avec succès", "success");
    } catch (err) {
      showMsg(`Échec du téléchargement: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  async function extractHighlights() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/documents/extract-highlights`, {
        method: "POST"
      });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setCoordMap(json);
      showMsg(`${json.count} champs détectés dans le modèle`, "success");
    } catch (err) {
      showMsg(`Échec de l'extraction: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  async function generatePack(client) {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/documents/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_data: client, coordinate_map: coordMap })
      });
      
      if (!res.ok) throw new Error(await res.text());
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (client.client_name || "pack").replace(/\s+/g, "_");
      a.download = `${safeName}_pack_qualiopi.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showMsg("Pack Qualiopi généré et téléchargé", "success");
    } catch (err) {
      showMsg(`Erreur de génération: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-lg text-white">M</div>
          <span className="font-bold text-xl tracking-tight">MyQualio</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === "dashboard" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <IconDashboard />
            <span>Tableau de bord</span>
          </button>
          <button 
            onClick={() => setActiveTab("clients")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === "clients" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <IconUsers />
            <span>Mes Clients</span>
          </button>
          <button 
            onClick={() => setActiveTab("templates")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === "templates" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
          >
            <IconFileText />
            <span>Modèles PDF</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <IconUsers />
            <span>Paramètres</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all">
            <IconSearch />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden text-slate-900">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 flex-shrink-0">
          <div className="relative w-96">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <IconSearch />
            </div>
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-full focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right mr-2 hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Administrateur</p>
              <p className="text-[10px] text-orange-600 font-bold uppercase tracking-tighter">Compte Premium</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-orange-600 font-bold text-xs">
              AD
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Notifications */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 animate-in ${
              message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : 
              message.type === "error" ? "bg-rose-50 text-rose-700 border border-rose-100" : 
              "bg-blue-50 text-blue-700 border border-blue-100"
            }`}>
              {message.type === "success" ? <IconCheck /> : <IconAlert />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Conditional View Rendering */}
          {activeTab === "dashboard" && (
            <DashboardView 
              clients={clients} 
              coordMap={coordMap} 
              setActiveTab={setActiveTab} 
            />
          )}
          {activeTab === "clients" && (
            <ClientsView 
              clients={clients} 
              form={form} 
              updateField={updateField} 
              addClient={addClient} 
              generatePack={generatePack} 
              loading={loading} 
            />
          )}
          {activeTab === "templates" && (
            <TemplatesView 
              templateFile={templateFile} 
              setTemplateFile={setTemplateFile} 
              uploadTemplate={uploadTemplate} 
              extractHighlights={extractHighlights} 
              coordMap={coordMap} 
              loading={loading} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
