import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

const LOGO_SRC = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23E8C547'/%3E%3Ctext x='32' y='22' text-anchor='middle' font-family='serif' font-weight='900' font-size='11' fill='%23000'%3ETHE%3C/text%3E%3Ctext x='32' y='36' text-anchor='middle' font-family='serif' font-weight='900' font-size='13' fill='%23000'%3ECARD%3C/text%3E%3Ctext x='32' y='50' text-anchor='middle' font-family='serif' font-weight='900' font-size='11' fill='%23000'%3EDELI%3C/text%3E%3C/svg%3E";

// ── THEME CONTEXT ──────────────────────────────────────────────
export const ThemeCtx = createContext(null);

// Shared mutable theme — updated by CardDeli before rendering children
export const T = {
  BG:"#0A0A0A", SURFACE:"#111111", SURFACE2:"#1A1A1A", BORDER:"#2A2A2A",
  TEXT1:"#F0F0F0", TEXT2:"#888888", TEXT3:"#444444",
  ACCENT:"#E8C547", GREEN:"#4ADE80", RED:"#F87171", BLUE:"#60A5FA", dark:true
};
// Convenience aliases used throughout components
let BG=T.BG, SURFACE=T.SURFACE, SURFACE2=T.SURFACE2, BORDER=T.BORDER;
let TEXT1=T.TEXT1, TEXT2=T.TEXT2, TEXT3=T.TEXT3;
let ACCENT=T.ACCENT, GREEN=T.GREEN, RED=T.RED, BLUE=T.BLUE;

function applyTheme(dark) {
  Object.assign(T, dark ? {
    BG:"#0A0A0A", SURFACE:"#111111", SURFACE2:"#1A1A1A", BORDER:"#2A2A2A",
    TEXT1:"#F0F0F0", TEXT2:"#888888", TEXT3:"#444444",
    ACCENT:"#E8C547", GREEN:"#4ADE80", RED:"#F87171", BLUE:"#60A5FA", dark:true
  } : {
    BG:"#F5F5F0", SURFACE:"#FFFFFF", SURFACE2:"#EEEDE6", BORDER:"#DDDBD0",
    TEXT1:"#111111", TEXT2:"#555555", TEXT3:"#AAAAAA",
    ACCENT:"#B8820A", GREEN:"#16A34A", RED:"#DC2626", BLUE:"#2563EB", dark:false
  });
  BG=T.BG; SURFACE=T.SURFACE; SURFACE2=T.SURFACE2; BORDER=T.BORDER;
  TEXT1=T.TEXT1; TEXT2=T.TEXT2; TEXT3=T.TEXT3;
  ACCENT=T.ACCENT; GREEN=T.GREEN; RED=T.RED; BLUE=T.BLUE;
}

const TYPE_COLORS = {
  "pokémon":   { bg:"#2A2000", accent:"#E8C547" },
  baseball:    { bg:"#001A33", accent:"#60A5FA" },
  basketball:  { bg:"#1F0A00", accent:"#FB923C" },
  football:    { bg:"#001A00", accent:"#4ADE80" },
  magic:       { bg:"#1A0033", accent:"#C084FC" },
  soccer:      { bg:"#001A1A", accent:"#34D399" },
  other:       { bg:"#1A1A1A", accent:"#888888" },
};
const CHART_COLORS = ["#E8C547","#4ADE80","#F87171","#60A5FA","#C084FC","#FB923C"];
const CONDITIONS = ["Pristine","Mint","Near Mint","Excellent","Good","Fair","Poor"];
const GRADERS    = ["","PSA","BGS","CGC","SGC","HGA","CSG","ACE"];
const VENUES     = ["","eBay","TCGPlayer","PWCC","Heritage Auctions","Card Show","Local Shop","Whatnot","Goldin","Other"];

const MOCK_HISTORY = (base) => {
  const months = ["Sep","Oct","Nov","Dec","Jan","Feb","Now"];
  let v = base * 0.75;
  return months.map(m => { v = v*(0.92+Math.random()*0.16); return {month:m,value:m==="Now"?base:Math.round(v)}; });
};

const SAMPLE_CARDS = [
  {id:1,name:"Charizard",set:"Base Set",number:"4/102",type:"pokémon",condition:"Near Mint",thumbnail:null,value:420,rarity:"Holo Rare",year:"1999",notes:"First Edition shadowless",purchasePrice:280,purchaseDate:"2023-06-12",purchaseVenue:"eBay",gradingCost:25,gradingService:"PSA",gradingGrade:"9",otherCosts:0,sold:false,salePrice:null,saleDate:null,saleVenue:null,ebayUrl:"https://ebay.com/sch/i.html?_nkw=charizard+base+set+psa+9",change24h:2.4,changeWeek:8.1,lastUpdated:"2026-03-05",priceMostRecentSold:420,priceAvg10Sold:408,priceAvg10List:445,priceSource:"eBay Sold Listings",priceSourceUrl:"https://ebay.com/sch/i.html?_nkw=charizard+base+set+psa+9&LH_Sold=1",priceUpdatedAt:"2026-03-05"},
  {id:2,name:"Mike Trout RC",set:"Topps Update",number:"US175",type:"baseball",condition:"Excellent",thumbnail:null,value:185,rarity:"Rookie Card",year:"2011",notes:"BGS 8.5",purchasePrice:120,purchaseDate:"2022-04-18",purchaseVenue:"Card Show",gradingCost:18,gradingService:"BGS",gradingGrade:"8.5",otherCosts:0,sold:false,salePrice:null,saleDate:null,saleVenue:null,ebayUrl:"https://ebay.com/sch/i.html?_nkw=mike+trout+rc+bgs",change24h:-0.8,changeWeek:3.2,lastUpdated:"2026-03-01",priceMostRecentSold:185,priceAvg10Sold:179,priceAvg10List:198,priceSource:"eBay Sold Listings",priceSourceUrl:"https://ebay.com/sch/i.html?_nkw=mike+trout+topps+update+bgs&LH_Sold=1",priceUpdatedAt:"2026-03-01"},
  {id:3,name:"Black Lotus",set:"Alpha",number:"232",type:"magic",condition:"Good",thumbnail:null,value:5200,rarity:"Rare",year:"1993",notes:"Light play",purchasePrice:3800,purchaseDate:"2020-11-02",purchaseVenue:"TCGPlayer",gradingCost:0,gradingService:"",gradingGrade:"",otherCosts:0,sold:false,salePrice:null,saleDate:null,saleVenue:null,ebayUrl:"https://ebay.com/sch/i.html?_nkw=black+lotus+alpha",change24h:1.2,changeWeek:5.5,lastUpdated:"2026-03-06",priceMostRecentSold:5200,priceAvg10Sold:4950,priceAvg10List:5800,priceSource:"eBay Sold Listings",priceSourceUrl:"https://ebay.com/sch/i.html?_nkw=black+lotus+alpha&LH_Sold=1",priceUpdatedAt:"2026-03-06"},
  {id:4,name:"LeBron James RC",set:"Topps Chrome",number:"111",type:"basketball",condition:"Mint",thumbnail:null,value:890,rarity:"Rookie Refractor",year:"2003",notes:"BGS 9.5",purchasePrice:650,purchaseDate:"2021-08-30",purchaseVenue:"PWCC",gradingCost:22,gradingService:"BGS",gradingGrade:"9.5",otherCosts:15,sold:true,salePrice:950,saleDate:"2026-01-15",saleVenue:"eBay",ebayUrl:"https://ebay.com/sch/i.html?_nkw=lebron+topps+chrome+rc",change24h:-1.5,changeWeek:-2.1,lastUpdated:"2026-02-20",priceMostRecentSold:890,priceAvg10Sold:875,priceAvg10List:920,priceSource:"eBay Sold Listings",priceSourceUrl:"https://ebay.com/sch/i.html?_nkw=lebron+james+topps+chrome+rc+bgs&LH_Sold=1",priceUpdatedAt:"2026-02-20"},
  {id:5,name:"Pikachu Illustrator",set:"Promo",number:"Promo",type:"pokémon",condition:"Near Mint",thumbnail:null,value:8500,rarity:"Trophy Card",year:"1998",notes:"CoroCoro promo",purchasePrice:6000,purchaseDate:"2019-03-20",purchaseVenue:"Heritage Auctions",gradingCost:35,gradingService:"PSA",gradingGrade:"7",otherCosts:0,sold:false,salePrice:null,saleDate:null,saleVenue:null,ebayUrl:"https://ebay.com/sch/i.html?_nkw=pikachu+illustrator+psa",change24h:3.8,changeWeek:12.4,lastUpdated:"2026-03-04",priceMostRecentSold:8500,priceAvg10Sold:8120,priceAvg10List:9200,priceSource:"eBay Sold Listings",priceSourceUrl:"https://ebay.com/sch/i.html?_nkw=pikachu+illustrator+psa&LH_Sold=1",priceUpdatedAt:"2026-03-04"},
];
SAMPLE_CARDS.forEach(c => { c.priceHistory = MOCK_HISTORY(c.value); });

const fmt$  = n => n==null?"—":`$${Number(n).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmt$k = n => n==null?"—":Math.abs(n)>=1000?`$${(n/1000).toFixed(1)}k`:`$${Number(n).toFixed(0)}`;
const costBasis = c => (Number(c.purchasePrice)||0)+(Number(c.gradingCost)||0)+(Number(c.otherCosts)||0);
const gainLoss  = c => (c.sold?(Number(c.salePrice)||0):c.value)-costBasis(c);
const gainPct   = c => { const b=costBasis(c); return b?((gainLoss(c)/b)*100).toFixed(1):"—"; };

// ── GOOGLE DRIVE DB ────────────────────────────────────────────
const GDRIVE_FOLDER  = "_carddeli";
const GDRIVE_FILE    = "_carddeli_data.json";
const GDRIVE_APIKEY  = "_carddeli_apikey.json";
const GDRIVE_PICS    = "_carddeli_pics";
const LS_KEY         = "_carddeli_drive_ids";

const GDrive = {
  // Save IDs to localStorage so they survive page reloads
  saveIds(ids) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(ids)); } catch(e) {}
  },
  loadIds() {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch(e) { return null; }
  },
  clearIds() {
    try { localStorage.removeItem(LS_KEY); } catch(e) {}
  },

  // Find or create a folder by name under a parent (or root)
  async findOrCreateFolder(token, name, parentId = null) {
    const q = `mimeType='application/vnd.google-apps.folder' and name='${name}' and trashed=false${parentId ? ` and '${parentId}' in parents` : " and 'root' in parents"}`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Drive API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      console.log(`[GDrive] FOUND existing folder "${name}":`, data.files[0].id);
      return data.files[0].id;
    }
    console.log(`[GDrive] folder "${name}" not found — CREATING`);
    const body = { name, mimeType: "application/vnd.google-apps.folder", ...(parentId ? { parents: [parentId] } : {}) };
    const created = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!created.ok) throw new Error(`Drive folder create error ${created.status}: ${await created.text()}`);
    const f = await created.json();
    console.log(`[GDrive] CREATED folder "${name}":`, f.id);
    return f.id;
  },

  // Find a file by name in a folder
  async findFile(token, name, parentId) {
    const q = `name='${name}' and '${parentId}' in parents and trashed=false`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Drive API error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  },

  // Read JSON file contents
  async readFile(token, fileId) {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Drive read error ${res.status}`);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch(e) {
      console.warn("Drive file corrupt, returning empty data. Raw:", text.slice(0,200));
      return { cards: [], watchlist: [], apiKey: "" };
    }
  },

  // Write/overwrite JSON file (create or update)
  async writeFile(token, name, parentId, data, existingId = null) {
    const content = JSON.stringify(data);
    if (existingId) {
      const r = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=media`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: content
      });
      if (!r.ok) throw new Error(`Drive write error ${r.status}: ${await r.text()}`);
      return existingId;
    } else {
      const meta = JSON.stringify({ name, parents: [parentId] });
      const form = new FormData();
      form.append("metadata", new Blob([meta], { type: "application/json" }));
      form.append("file", new Blob([content], { type: "application/json" }));
      const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form
      });
      if (!res.ok) throw new Error(`Drive create error ${res.status}: ${await res.text()}`);
      const f = await res.json();
      return f.id;
    }
  },

  // Upload an image (base64 data URL) to card_pictures folder
  async uploadImage(token, cardId, dataUrl, picsFolderId, suffix = "") {
    // Step 1: resize to ~300px using canvas
    const resized = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 300;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
    // Step 2: upload resized image to _carddeli_pics/
    const [header, b64] = resized.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: mime });
    const meta = JSON.stringify({ name: `card_${cardId}${suffix}.jpg`, parents: [picsFolderId] });
    const form = new FormData();
    form.append("metadata", new Blob([meta], { type: "application/json" }));
    form.append("file", blob);
    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form
    });
    if (!res.ok) throw new Error(`Drive upload error ${res.status}`);
    const f = await res.json();
    // Step 3: make publicly readable
    await fetch(`https://www.googleapis.com/drive/v3/files/${f.id}/permissions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" })
    });
    // Step 4: return reliable lh3 URL (works on all devices, no login redirect)
    return `https://lh3.googleusercontent.com/d/${f.id}`;
  },

  // Full setup: find-or-create _carddeli/ folders + data file (NEVER overwrites existing data)
  async setup(token) {
    const folderId = await GDrive.findOrCreateFolder(token, GDRIVE_FOLDER);
    const picsFolderId = await GDrive.findOrCreateFolder(token, GDRIVE_PICS, folderId);
    // Check if data file already exists — if so, use it, never overwrite
    let fileId = await GDrive.findFile(token, GDRIVE_FILE, folderId);
    if (!fileId) {
      // Only create empty file if none exists
      const emptyData = { cards: [], watchlist: [], createdAt: new Date().toISOString() };
      fileId = await GDrive.writeFile(token, GDRIVE_FILE, folderId, emptyData);
    }
    const ids = { folderId, picsFolderId, fileId };
    GDrive.saveIds(ids);
    return ids;
  },

  // Load existing data from Drive — fully self-healing on any device
  async load(token) {
    try {
      const cached = GDrive.loadIds();
      let folderId, picsFolderId, fileId;
      console.log("[GDrive.load] cached IDs:", cached);

      // 1. Try cached IDs first (fast path, same device)
      if (cached?.folderId) {
        try {
          const check = await fetch(`https://www.googleapis.com/drive/v3/files/${cached.folderId}?fields=id,trashed`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const f = await check.json();
          if (f.id && !f.trashed) {
            folderId = cached.folderId;
            picsFolderId = cached.picsFolderId;
            fileId = cached.fileId;
            console.log("[GDrive.load] cache hit — folder:", folderId, "file:", fileId);
          } else {
            console.log("[GDrive.load] cached folder invalid, searching Drive...");
          }
        } catch(e) { console.log("[GDrive.load] cache check failed:", e.message); }
      }

      // 2. No valid cache — search Drive for the folder (works on any device)
      if (!folderId) {
        console.log("[GDrive.load] searching Drive for folder:", GDRIVE_FOLDER);
        folderId = await GDrive.findOrCreateFolder(token, GDRIVE_FOLDER);
        picsFolderId = await GDrive.findOrCreateFolder(token, GDRIVE_PICS, folderId);
        console.log("[GDrive.load] folder found/created:", folderId);
      }

      // 3. Always search for the data file if we don't have its ID yet
      if (!fileId) {
        console.log("[GDrive.load] searching for data file:", GDRIVE_FILE);
        fileId = await GDrive.findFile(token, GDRIVE_FILE, folderId);
        console.log("[GDrive.load] data file found:", fileId);
      }

      // 4. If data file doesn't exist yet, create empty one (first ever use)
      if (!fileId) {
        console.log("[GDrive.load] no data file found — creating empty one");
        const emptyData = { cards: [], watchlist: [], createdAt: new Date().toISOString() };
        fileId = await GDrive.writeFile(token, GDRIVE_FILE, folderId, emptyData);
        console.log("[GDrive.load] created new data file:", fileId);
      }

      // 5. Load API key from its separate file
      const apiKeyFileId = await GDrive.findFile(token, GDRIVE_APIKEY, folderId);
      let apiKey = "";
      if (apiKeyFileId) {
        try {
          const keyData = await GDrive.readFile(token, apiKeyFileId);
          apiKey = (keyData && typeof keyData.apiKey === "string") ? keyData.apiKey.trim() : "";
          console.log("[GDrive.load] API key loaded, length:", apiKey.length);
        } catch(e) { console.warn("[GDrive.load] key file unreadable:", e.message); }
      } else {
        console.log("[GDrive.load] no API key file found");
      }

      // 6. Cache IDs for next time on this device
      GDrive.saveIds({ folderId, picsFolderId, fileId });

      // 7. Read and return all data
      console.log("[GDrive.load] reading data file...");
      const data = await GDrive.readFile(token, fileId);
      console.log("[GDrive.load] done — cards:", data?.cards?.length ?? 0, "watchlist:", data?.watchlist?.length ?? 0);
      return { found: true, folderId, picsFolderId, fileId, data, apiKey };

    } catch(e) {
      console.error("[GDrive.load] error:", e);
      return { found: false, error: e.message };
    }
  },

  // Delete a file by Drive file ID
  async deleteFile(token, fileId) {
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` }
      });
    } catch(e) { console.warn("Drive deleteFile failed:", e.message); }
  },

  // Delete card images from card_pictures folder by card ID
  async deleteCardImages(token, cardId, picsFolderId) {
    if (!token || !picsFolderId) return;
    try {
      // Search for front and back images
      const names = [`card_${cardId}.jpg`, `card_${cardId}_back.jpg`];
      for (const name of names) {
        const q = `name='${name}' and '${picsFolderId}' in parents and trashed=false`;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) continue;
        const data = await res.json();
        for (const f of (data.files || [])) {
          await GDrive.deleteFile(token, f.id);
        }
      }
    } catch(e) { console.warn("Drive deleteCardImages failed:", e.message); }
  },

  // Save current app state (cards + watchlist only — NO apiKey here)
  async save(token, fileId, folderId, cards, watchlist) {
    try {
      const newFileId = await GDrive.writeFile(token, GDRIVE_FILE, folderId, {
        cards, watchlist, savedAt: new Date().toISOString()
      }, fileId);
      const cached = GDrive.loadIds();
      if (cached) GDrive.saveIds({ ...cached, fileId: newFileId });
    } catch(e) { console.warn("GDrive save failed:", e.message); }
  },

  // Save API key to its own separate file in the _carddeli folder
  async saveApiKey(token, folderId, apiKey) {
    try {
      const existingId = await GDrive.findFile(token, GDRIVE_APIKEY, folderId);
      await GDrive.writeFile(token, GDRIVE_APIKEY, folderId, { apiKey: apiKey||"", savedAt: new Date().toISOString() }, existingId);
      console.log("[GDrive] API key saved to Drive, length:", (apiKey||"").length, "existingFile:", existingId);
    } catch(e) { console.warn("GDrive saveApiKey failed:", e.message); }
  },

  // Load API key from its separate file
  async loadApiKey(token, folderId) {
    try {
      const fileId = await GDrive.findFile(token, GDRIVE_APIKEY, folderId);
      if (!fileId) return "";
      const data = await GDrive.readFile(token, fileId);
      return (data && typeof data.apiKey === "string") ? data.apiKey : "";
    } catch(e) { console.warn("GDrive loadApiKey failed:", e.message); return ""; }
  }
};

// ── DRIVE SETUP MODAL ──────────────────────────────────────────
function DriveSetupModal({ onSetup, onSkip }) {
  const { SURFACE, SURFACE2, BORDER, TEXT1, TEXT2, TEXT3, ACCENT, GREEN, BLUE } = useContext(ThemeCtx);
  const [step, setStep] = useState("prompt"); // prompt | setting_up | done | error
  const [err, setErr] = useState("");

  const handleSetup = async () => {
    setStep("setting_up");
    try {
      await onSetup();
      setStep("done");
      setTimeout(() => onSkip(), 1500); // auto-close after showing success
    } catch(e) {
      setErr(e.message || "Setup failed. Make sure you granted Google Drive access.");
      setStep("error");
    }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:SURFACE,borderRadius:20,maxWidth:380,width:"100%",border:`1px solid ${BORDER}`,overflow:"hidden"}}>
        <div style={{background:`linear-gradient(135deg,${ACCENT}22,${BLUE}22)`,borderBottom:`1px solid ${BORDER}`,padding:"20px 22px 16px",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:8}}>☁️</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:TEXT1,marginBottom:4}}>Sync with Google Drive</div>
          <div style={{fontSize:13,color:TEXT2,fontFamily:"'DM Sans',sans-serif"}}>Keep your vault safe & accessible everywhere</div>
        </div>
        <div style={{padding:"18px 22px 22px"}}>
          {step === "prompt" && (<>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:18}}>
              {[
                {icon:"📁", text:`Creates a "${GDRIVE_FOLDER}" folder in your Google Drive`},
                {icon:"💾", text:"Auto-saves your vault & watchlist after every change"},
                {icon:"🖼️", text:"Stores card photos in a card_pictures subfolder"},
                {icon:"🔄", text:"Loads your data automatically on every login"},
              ].map(({icon,text})=>(
                <div key={text} style={{display:"flex",gap:10,alignItems:"flex-start",padding:"8px 10px",background:SURFACE2,borderRadius:8,border:`1px solid ${BORDER}`}}>
                  <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
                  <span style={{fontSize:12,color:TEXT2,fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{text}</span>
                </div>
              ))}
            </div>
            <button onClick={handleSetup} style={{width:"100%",background:ACCENT,color:"#000",border:"none",borderRadius:10,padding:"13px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:8}}>
              ✨ Set up Google Drive sync
            </button>
            <button onClick={onSkip} style={{width:"100%",background:"transparent",color:TEXT2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"11px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer"}}>
              Not now — use local storage only
            </button>
          </>)}
          {step === "setting_up" && (
            <div style={{textAlign:"center",padding:"24px 0"}}>
              <div style={{width:40,height:40,border:`3px solid ${BORDER}`,borderTop:`3px solid ${ACCENT}`,borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 16px"}}/>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:TEXT1,marginBottom:4}}>Setting up your Drive…</div>
              <div style={{fontSize:12,color:TEXT2}}>Creating _carddeli folder & data file</div>
            </div>
          )}
          {step === "done" && (
            <div style={{textAlign:"center",padding:"24px 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>✅</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:TEXT1,marginBottom:4}}>All set!</div>
              <div style={{fontSize:12,color:TEXT2}}>Your vault will now sync to Google Drive automatically.</div>
            </div>
          )}
          {step === "error" && (<>
            <div style={{background:"#F8717122",border:"1px solid #F8717144",borderRadius:10,padding:"12px 14px",marginBottom:14,fontSize:12,color:"#F87171",fontFamily:"'DM Sans',sans-serif"}}>
              ⚠️ {err || "Could not connect to Google Drive."}
              <div style={{marginTop:6,fontSize:10,opacity:0.8}}>Check the browser console (F12) for details. Most common causes: Drive scope not granted, or the OAuth consent screen needs re-approval after changing scopes.</div>
            </div>
            <button onClick={handleSetup} style={{width:"100%",background:ACCENT,color:"#000",border:"none",borderRadius:10,padding:"12px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer",marginBottom:8}}>
              Try again
            </button>
            <button onClick={onSkip} style={{width:"100%",background:"transparent",color:TEXT2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"11px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer"}}>
              Continue without Drive sync
            </button>
          </>)}
        </div>
      </div>
    </div>
  );
}

// ── MODERN SVG ICONS ───────────────────────────────────────────
const Icons = {
  Home: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  ),
  Collection: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="14" height="18" rx="2"/>
      <path d="M6 2h14a2 2 0 0 1 2 2v16"/>
    </svg>
  ),
  Scan: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 9V7M12 17v-2M9 12H7M17 12h-2"/>
    </svg>
  ),
  Market: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
};

// ── SHARED COMPONENTS ──────────────────────────────────────────
function Thumb({ card, size=60 }) {
  const [imgError, setImgError] = useState(false);
  const tc = TYPE_COLORS[card.type]||TYPE_COLORS.other;
  const icons = {"pokémon":"⚡",baseball:"⚾",basketball:"🏀",football:"🏈",magic:"✦",soccer:"⚽",other:"🃏"};
  if (card.thumbnail && !imgError) {
    return <img src={card.thumbnail} alt="" onError={()=>setImgError(true)} style={{width:size,height:size*1.4,objectFit:"cover",borderRadius:8,border:`1px solid ${BORDER}`,flexShrink:0}}/>;
  }
  return (
    <div style={{width:size,height:size*1.4,borderRadius:8,background:tc.bg,border:`1px solid ${tc.accent}33`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontSize:size*0.32,gap:2,flexShrink:0}}>
      <span>{icons[card.type]||"🃏"}</span>
      <span style={{fontSize:size*0.1,color:tc.accent,fontWeight:700,textAlign:"center",padding:"0 2px",lineHeight:1.1}}>{card.name.length>9?card.name.slice(0,8)+"…":card.name}</span>
    </div>
  );
}

function MiniChart({ data, height=40 }) {
  // Only draw a chart when there are at least 2 real data points
  const chartData = (data && data.length >= 2) ? data : [];
  if (chartData.length === 0) {
    return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{fontSize:10,color:T.TEXT3,fontFamily:"'DM Mono',monospace"}}>No price history yet — hit ↻ to fetch</span>
    </div>;
  }
  const last2 = chartData.slice(-2);
  const up = last2[1].value >= last2[0].value;
  const color = up ? GREEN : RED;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{top:2,right:0,left:0,bottom:0}}>
        <defs>
          <linearGradient id={`mc-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25}/>
            <stop offset="100%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill={`url(#mc-${color.replace("#","")})`} dot={false}/>
        <Tooltip contentStyle={{background:T.SURFACE2,border:`1px solid ${T.BORDER}`,borderRadius:6,fontFamily:"'DM Mono',monospace",fontSize:10,color:T.TEXT1}} formatter={v=>[fmt$(v),""]} labelFormatter={()=>""}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function FI({ label, value, onChange, type="text", placeholder="", max="" }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label&&<label style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</label>}
      <input type={type} value={value??""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        {...(max ? {max} : {})}
        style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"}}/>
    </div>
  );
}

function FS({ label, value, onChange, options }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:4}}>
      {label&&<label style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.1em"}}>{label}</label>}
      <select value={value??""} onChange={e=>onChange(e.target.value)}
        style={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:14,outline:"none"}}>
        {options.map(o=><option key={o.v??o} value={o.v??o} style={{background:SURFACE2}}>{o.l??o}</option>)}
      </select>
    </div>
  );
}

function Chip({ children, color=ACCENT, bg="" }) {
  return <span style={{fontSize:10,padding:"3px 8px",borderRadius:20,background:bg||color+"22",color,fontFamily:"'DM Mono',monospace",fontWeight:600,whiteSpace:"nowrap",border:`1px solid ${color}33`}}>{children}</span>;
}

// ── AUTH ───────────────────────────────────────────────────────
function AuthScreen({ onLogin, apiKey, setApiKey }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");

  // Load Google Identity Services script once
  useEffect(() => {
    if (document.getElementById("gis-script")) return;
    const s = document.createElement("script");
    s.id = "gis-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }, []);

  const signInWithGoogle = () => {
    setError("");
    setLoading("google");

    // YOUR Google OAuth Client ID — replace this with your own from console.cloud.google.com
    const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE";

    if (CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
      setError("Add your Google Client ID to .env as VITE_GOOGLE_CLIENT_ID");
      setLoading(null);
      return;
    }

    if (!window.google?.accounts?.oauth2) {
      // Script not loaded yet — retry in 500ms
      setTimeout(signInWithGoogle, 500);
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      // Full Drive access so we can find/create our folder across sessions
      scope: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          setError(tokenResponse.error_description || "Google sign-in failed");
          setLoading(null);
          return;
        }
        // Fetch user profile with the access token
        try {
          const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          });
          const profile = await res.json();
          onLogin({
            name: profile.name || profile.email,
            email: profile.email,
            avatar: profile.picture || "",
            type: "google",
            accessToken: tokenResponse.access_token,
            joinedDate: new Date().toISOString(),
          });
        } catch(e) {
          setError("Could not fetch Google profile. Try again.");
        }
        setLoading(null);
      },
      error_callback: (err) => {
        if (err.type !== "popup_closed") {
          setError("Sign-in cancelled or failed. Please try again.");
        }
        setLoading(null);
      }
    });

    client.requestAccessToken({ prompt: "consent" });
  };

  const signIn = (type) => {
    if (type === "google") { signInWithGoogle(); return; }
    if (type === "demo") {
      setLoading("demo");
      setTimeout(() => {
        onLogin({ name: "Demo User", email: "demo@carddeli.app", avatar: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIgZmlsbD0iI0U4QzU0NyIvPjx0ZXh0IHg9IjMyIiB5PSIzOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSI3MDAiIGZvbnQtc2l6ZT0iMjIiIGZpbGw9IiMwMDAiPkNEPC90ZXh0Pjwvc3ZnPg==", type: "demo", joinedDate: new Date(Date.now() - 45*24*60*60*1000).toISOString() });
        setLoading(null);
      }, 800);
    }
  };

  return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
      <div style={{textAlign:"center",maxWidth:380,width:"100%",animation:"fadeUp .5s ease"}}>
        <div style={{width:140,height:140,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,marginLeft:"auto",marginRight:"auto",boxShadow:`0 8px 32px ${ACCENT}55`}}>
          <img src={LOGO_SRC} alt="The Card Deli" style={{width:"120%",height:"120%",objectFit:"contain"}}/>
        </div>
        <h1 style={{fontFamily:"'Fredoka One',cursive",fontSize:38,color:TEXT1,margin:"0 0 4px",lineHeight:1}}>The Card Deli</h1>
        <p style={{color:TEXT2,fontSize:14,marginBottom:36}}>Your card collection, fresh & stacked.</p>
        <div style={{background:SURFACE,borderRadius:20,padding:28,border:`1px solid ${BORDER}`,display:"flex",flexDirection:"column",gap:12}}>

          {/* Google */}
          <button onClick={()=>signIn("google")} disabled={!!loading}
            style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:12,background:"#fff",border:"none",borderRadius:12,padding:"14px 20px",cursor:loading?"not-allowed":"pointer",fontSize:15,fontFamily:"'DM Sans',sans-serif",fontWeight:600,color:"#111",opacity:loading&&loading!=="google"?0.5:1,transition:"all .2s"}}>
            {loading==="google"
              ? <div style={{width:20,height:20,border:"2.5px solid #ddd",borderTop:"2.5px solid #333",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
              : <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            }
            {loading==="google" ? "Signing in…" : "Continue with Google"}
          </button>

          {error && (
            <div style={{background:"#F8717115",border:"1px solid #F8717144",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#F87171",fontFamily:"'DM Sans',sans-serif",textAlign:"left"}}>
              ⚠️ {error}
            </div>
          )}

          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,height:1,background:BORDER}}/><span style={{color:TEXT3,fontSize:11,fontFamily:"'DM Mono',monospace"}}>or</span><div style={{flex:1,height:1,background:BORDER}}/>
          </div>

          {/* Demo */}
          <button onClick={()=>signIn("demo")} disabled={!!loading}
            style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:loading==="demo"?ACCENT+"33":`linear-gradient(135deg,${ACCENT}22,${ACCENT}11)`,border:`1px solid ${ACCENT}55`,borderRadius:12,padding:"13px",cursor:loading?"not-allowed":"pointer",fontSize:14,fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:ACCENT,opacity:loading&&loading!=="demo"?0.5:1,transition:"all .2s"}}>
            {loading==="demo"
              ? <div style={{width:16,height:16,border:`2px solid ${ACCENT}44`,borderTop:`2px solid ${ACCENT}`,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            }
            {loading==="demo" ? "Loading demo…" : "Try Demo"}
          </button>

          <p style={{fontSize:10,color:TEXT3,marginTop:2,lineHeight:1.6}}>
            Demo loads sample cards to explore all features. Google sync keeps your vault safe across devices.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── COST CONFIRM MODAL ────────────────────────────────────────
function CostConfirmModal({ config, onConfirm, onCancel, onManual }) {
  const { SURFACE, SURFACE2, BORDER, TEXT1, TEXT2, TEXT3, ACCENT, GREEN, BLUE } = useContext(ThemeCtx);
  if (!config) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:SURFACE,borderRadius:20,maxWidth:360,width:"100%",border:`1px solid ${BORDER}`,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
        <div style={{background:ACCENT+"18",borderBottom:`1px solid ${ACCENT}33`,padding:"16px 20px 14px"}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:ACCENT,marginBottom:2}}>💰 API Cost Estimate</div>
          <div style={{fontSize:12,color:TEXT2,fontFamily:"'DM Sans',sans-serif"}}>{config.action}</div>
        </div>
        <div style={{padding:"16px 20px"}}>
          <div style={{background:SURFACE2,borderRadius:12,padding:"12px 14px",marginBottom:14,border:`1px solid ${BORDER}`}}>
            {config.calls.map((c,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:i<config.calls.length-1?8:0}}>
                <div>
                  <div style={{fontSize:12,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{c.label}</div>
                  <div style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace"}}>{c.detail}</div>
                </div>
                <div style={{fontSize:12,color:ACCENT,fontFamily:"'DM Mono',monospace",fontWeight:700,whiteSpace:"nowrap",marginLeft:12}}>~{c.cost}</div>
              </div>
            ))}
            <div style={{borderTop:`1px solid ${BORDER}`,marginTop:10,paddingTop:10,display:"flex",justifyContent:"space-between"}}>
              <div style={{fontSize:12,fontWeight:700,color:TEXT1,fontFamily:"'DM Sans',sans-serif"}}>Estimated total</div>
              <div style={{fontSize:14,fontWeight:800,color:ACCENT,fontFamily:"'DM Mono',monospace"}}>~{config.total}</div>
            </div>
          </div>
          <div style={{fontSize:11,color:TEXT3,fontFamily:"'DM Sans',sans-serif",marginBottom:16,lineHeight:1.5}}>
            {config.note || "Costs are charged to the API key in your profile. Estimates assume typical token usage."}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button onClick={onConfirm} style={{width:"100%",background:ACCENT,color:"#000",border:"none",borderRadius:10,padding:"12px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,cursor:"pointer"}}>
              ✅ Yes, proceed
            </button>
            {config.showManual && onManual && (
              <button onClick={onManual} style={{width:"100%",background:BLUE+"18",color:BLUE,border:`1.5px solid ${BLUE}44`,borderRadius:10,padding:"11px",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,cursor:"pointer"}}>
                ✏️ Input Manually instead
              </button>
            )}
            <button onClick={onCancel} style={{width:"100%",background:"transparent",color:TEXT2,border:`1px solid ${BORDER}`,borderRadius:10,padding:"11px",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:13,cursor:"pointer"}}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to gate any async action behind a cost confirmation
// Resolves: true = proceed, false = cancel, "manual" = manual entry
function useCostConfirm() {
  const [pending, setPending] = useState(null);
  const confirm = (config) => new Promise(resolve => setPending({ config, resolve }));
  const handleConfirm = () => { pending?.resolve(true);    setPending(null); };
  const handleCancel  = () => { pending?.resolve(false);   setPending(null); };
  const handleManual  = () => { pending?.resolve("manual"); setPending(null); };
  const modal = pending
    ? <CostConfirmModal config={pending.config} onConfirm={handleConfirm} onCancel={handleCancel} onManual={handleManual}/>
    : null;
  return { confirm, modal };
}

// ── SELL WRITE-UP MODAL ────────────────────────────────────────
function SellWriteupModal({ card, onClose, apiKey }) {
  const [loading, setLoading] = useState(false);
  const [writeup, setWriteup] = useState(null);
  const [copied, setCopied] = useState(false);
  const { confirm, modal } = useCostConfirm();

  const generate = async () => {
    const ok = await confirm({
      action: "Generate AI sell write-up",
      calls: [
        { label: "Claude Haiku — text generation", detail: "~600 input + ~800 output tokens", cost: "~$0.004" },
      ],
      total: "~$0.004",
      note: "💡 Free alternative: paste your card details into claude.ai (free tier) and ask it to write a listing. This button uses your API key (~$0.004)."
    });
    if (!ok) return;
    setLoading(true);
    try {
      const cb = costBasis(card);
      const gl = gainLoss(card);
      const prompt = `Write a compelling eBay/marketplace listing description for this trading card. Be specific, persuasive, and professional. Include condition details, why it's valuable, and a call to action.

Card Details:
- Name: ${card.name}
- Set: ${card.set}
- Number: ${card.number||"N/A"}
- Year: ${card.year||"N/A"}
- Type: ${card.type}
- Rarity: ${card.rarity||"N/A"}
- Condition: ${card.condition}
- Graded: ${card.gradingService?(card.gradingService+" "+card.gradingGrade):"Raw/Ungraded"}
- Current Market Value: ${fmt$(card.value)}
- Notes: ${card.notes||"None"}

Write 3 versions:
1. SHORT (2 sentences) - for title/tagline
2. MEDIUM (1 paragraph) - for quick listing
3. FULL (3-4 paragraphs) - for detailed eBay listing

Format with headers: ## SHORT, ## MEDIUM, ## FULL`;

      const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01",...(apiKey?{"x-api-key":apiKey}:{})},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:800,messages:[{role:"user",content:prompt}]})});
      const d = await r.json();
      setWriteup(d.content.map(b=>b.text||"").join(""));
    } catch { setWriteup("Failed to generate write-up. Check your connection and try again."); }
    setLoading(false);
  };

  const copy = (text) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const sections = writeup ? writeup.split(/##\s+/).filter(Boolean).map(s=>{
    const lines = s.split("\n");
    return { title: lines[0].trim(), body: lines.slice(1).join("\n").trim() };
  }) : [];

  return (
    <>{modal}
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:SURFACE,borderRadius:20,maxWidth:600,width:"100%",maxHeight:"88vh",overflow:"auto",border:`1px solid ${BORDER}`,animation:"fadeUp .2s ease"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px 14px",borderBottom:`1px solid ${BORDER}`,position:"sticky",top:0,background:SURFACE,zIndex:1}}>
          <div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:TEXT1}}>✍️ Sell Write-Up</div>
            <div style={{fontSize:12,color:TEXT2,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>{card.name} · {card.set}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:TEXT2}}>✕</button>
        </div>
        <div style={{padding:22}}>
          {!writeup && !loading && (
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:48,marginBottom:12}}>🤖</div>
              <p style={{color:TEXT2,fontFamily:"'DM Sans',sans-serif",fontSize:14,marginBottom:20,lineHeight:1.6}}>
                AI will generate 3 versions of a sell listing — short tagline, quick paragraph, and a full eBay description.
              </p>
              <div style={{background:SURFACE2,borderRadius:12,padding:14,marginBottom:20,textAlign:"left",border:`1px solid ${BORDER}`}}>
                {[["Card",card.name],["Set",card.set],["Condition",card.condition],["Grade",card.gradingService?(card.gradingService+" "+card.gradingGrade):"Raw"],["Market Value",fmt$(card.value)]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderBottom:`1px solid ${BORDER}`}}>
                    <span style={{fontSize:12,color:TEXT2,fontFamily:"'DM Mono',monospace"}}>{l}</span>
                    <span style={{fontSize:12,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={generate} style={{background:ACCENT,color:"#000",border:"none",borderRadius:12,padding:"13px 28px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15}}>
                Generate Write-Up ✨
              </button>
            </div>
          )}
          {loading && (
            <div style={{textAlign:"center",padding:"40px 0"}}>
              <div style={{width:40,height:40,border:`3px solid ${BORDER}`,borderTop:`3px solid ${ACCENT}`,borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 16px"}}/>
              <p style={{color:TEXT2,fontFamily:"'DM Sans',sans-serif"}}>Crafting your listing…</p>
            </div>
          )}
          {writeup && !loading && sections.length>0 && (
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {sections.map((s,i)=>(
                <div key={i} style={{background:SURFACE2,borderRadius:12,padding:16,border:`1px solid ${BORDER}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:11,color:ACCENT,fontFamily:"'DM Mono',monospace",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.title}</span>
                    <button onClick={()=>copy(s.body)} style={{background:copied?"#1a2e1a":"transparent",border:`1px solid ${BORDER}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:copied?GREEN:TEXT2,transition:"all .2s"}}>
                      {copied?"✓ Copied":"Copy"}
                    </button>
                  </div>
                  <p style={{color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:13,lineHeight:1.7,whiteSpace:"pre-line",margin:0}}>{s.body}</p>
                </div>
              ))}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>copy(sections.map(s=>`${s.title}\n${s.body}`).join("\n\n"))} style={{flex:1,background:ACCENT,color:"#000",border:"none",borderRadius:10,padding:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14}}>
                  Copy All Versions
                </button>
                <button onClick={()=>{setWriteup(null);setLoading(false);}} style={{flex:1,background:"transparent",border:`1px solid ${BORDER}`,borderRadius:10,padding:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,color:TEXT2}}>
                  Regenerate
                </button>
              </div>
              <a href={card.ebayUrl||`https://sell.ebay.com/sell`} target="_blank" rel="noreferrer"
                style={{display:"block",textAlign:"center",background:BLUE+"22",border:`1px solid ${BLUE}44`,borderRadius:10,padding:12,color:BLUE,fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:14,textDecoration:"none"}}>
                🛒 Open eBay Listing →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

// ── SCANNER ────────────────────────────────────────────────────
function InputRow({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: TEXT3, fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function ScannerView({ onCardAdded, onWatchlistAdded, onBack, apiKey }) {
  const [mode, setMode]         = useState("choose");  // choose | camera | add_back | analyzing | confirm_search | result | manual
  const [searchQuery, setSearchQuery] = useState("");
  const [imgFront, setImgFront] = useState(null);
  const [imgBack,  setImgBack]  = useState(null);
  const [captureTarget, setCaptureTarget] = useState("front"); // "front" | "back"
  const [step, setStep]         = useState("");
  const [result, setResult]     = useState(null);
  const [aiError, setAiError]   = useState(null);
  const vidRef = useRef(null), streamRef = useRef(null), fileRef = useRef(null), fileBackRef = useRef(null);
  const { confirm, modal } = useCostConfirm();

  const blankForm = { name:"", set:"", number:"", year:"", type:"pokémon", condition:"Near Mint",
    rarity:"", gradingService:"", gradingGrade:"", value:"", userValue:"", notes:"",
    dateAdded: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState(blankForm);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const stopCam = () => streamRef.current?.getTracks().forEach(t => t.stop());

  const startCamera = (target = "front") => {
    setCaptureTarget(target);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera not available. This feature requires HTTPS. Please use the Upload option instead.");
      return;
    }
    setMode("camera");
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(s => {
        streamRef.current = s;
        setTimeout(() => { if (vidRef.current) { vidRef.current.srcObject = s; vidRef.current.play().catch(()=>{}); } }, 150);
      })
      .catch(err => {
        const msg = err.name === "NotAllowedError"
          ? "Camera permission denied. Please allow camera access and try again."
          : err.name === "NotFoundError"
          ? "No camera found on this device. Please use the Upload option."
          : "Camera not available. Please use the Upload option instead.";
        setMode(target === "back" ? "add_back" : "choose");
        alert(msg);
      });
  };

  const capturePhoto = () => {
    const v = vidRef.current, c = document.createElement("canvas");
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    stopCam();
    if (captureTarget === "back") {
      setImgBack(dataUrl);
      analyzeImages(imgFront, dataUrl);
    } else {
      setImgFront(dataUrl);
      setMode("add_back");
    }
  };

  const handleFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const dataUrl = ev.target.result;
      setImgFront(dataUrl);
      setMode("add_back");
    };
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const handleBackFile = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const dataUrl = ev.target.result;
      setImgBack(dataUrl);
      analyzeImages(imgFront, dataUrl);
    };
    r.readAsDataURL(f);
    e.target.value = "";
  };

  const analyzeImages = async (front, back) => {
    const ok = await confirm({
      action: `Scan & price card (${back ? "2 images" : "1 image"})`,
      calls: [
        { label: "Claude Haiku — card identification", detail: `Vision + ~400 output tokens${back?" (2 images)":" (1 image)"}`, cost: back ? "~$0.004" : "~$0.003" },
        { label: "Claude Haiku — price lookup", detail: "Web search + ~1,000 output tokens", cost: "~$0.007" },
      ],
      total: "~$0.01",
      note: "One AI call identifies the card from your photo, a second searches eBay for live sold prices. If a QR code is detected, a third call fetches full details from the linked page.",
      showManual: true,
    });
    if (ok === "manual") { setMode("manual"); setAiError(null); setForm(blankForm); return; }
    if (!ok) return;
    setMode("analyzing"); setAiError(null); setStep("Identifying card...");
    try {
      const imgContent = [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: front.split(",")[1] } },
        ...(back ? [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: back.split(",")[1] } }] : []),
        { type: "text", text: `Analyze this trading card${back ? " (front and back images provided)" : " (front only)"}. Use ALL visible text: set name, card number, year, player/character, edition, foil indicators, grading label if present.

Also check if there is a QR code visible anywhere on the card or grading label. If you can read a QR code URL from the image, include it in the qrUrl field.

For the condition field, carefully inspect the card image for: scratches, scuffs, whitening on edges/corners, creases, print defects, surface wear, yellowing. Use these strict criteria:
- Pristine/Gem Mint: Absolutely flawless, sharp corners, perfect centering, no marks
- Mint: Nearly perfect, one or two trivial flaws only visible under inspection
- Near Mint: Minor edge/corner wear, minimal surface marks, still sharp corners
- Excellent: Light wear on edges/corners, minor scuffs, slight surface marks
- Good: Moderate wear, creases possible, noticeable edge wear
- Fair: Heavy wear, creases, major scuffs or staining
- Poor: Severely damaged, torn, heavily creased

If a grading label is visible (PSA, BGS, CGC etc), use that grade to inform the condition. Do NOT default to Near Mint — be honest about visible wear. Return ONLY valid JSON, no markdown:\n{"name":"","set":"","number":"","type":"pokemon|baseball|basketball|football|soccer|magic|other","rarity":"","year":"","condition":"Pristine|Mint|Near Mint|Excellent|Good|Fair|Poor","conditionNotes":"<one sentence describing specific visible wear or why condition was assigned>","notes":"","gradingService":"","gradingGrade":"","qrUrl":""}` }
      ];

      const headers401 = { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true", "anthropic-version": "2023-06-01", ...(apiKey ? {"x-api-key": apiKey} : {}) };
      console.log("FULL HEADERS:", JSON.stringify(headers401));
      console.log("API KEY DEBUG — length:", apiKey?.length, "| first4:", apiKey?.slice(0,4), "| last4:", apiKey?.slice(-4), "| charCodes:", [...(apiKey||"")].slice(0,8).map(c=>c.charCodeAt(0)));
      const r1 = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: headers401,
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 400, messages: [{ role: "user", content: imgContent }] })
      });
      const d1 = await r1.json();
      if (!r1.ok || d1.error) throw new Error(`[${r1.status}] ${d1.error?.message || d1.error?.type || JSON.stringify(d1.error) || "Unknown error"}`);
      const raw = d1.content.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
      let parsed = JSON.parse(raw);

      // If a QR code URL was found, fetch the page and enrich card data
      if (parsed.qrUrl && parsed.qrUrl.startsWith("http")) {
        setStep("Found QR code — fetching card details...");
        try {
          const headers2 = { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true", "anthropic-version": "2023-06-01", ...(apiKey ? {"x-api-key": apiKey} : {}) };
          const r2 = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: headers2,
            body: JSON.stringify({
              model: "claude-haiku-4-5-20251001",
              max_tokens: 800,
              tools: [{ type: "web_search_20250305", name: "web_search" }],
              messages: [{
                role: "user",
                content: `Fetch this URL and extract ALL card details from the page: ${parsed.qrUrl}

Return ONLY valid JSON with any fields you can find (leave blank if not found):
{"name":"","set":"","number":"","type":"pokemon|baseball|basketball|football|soccer|magic|other","rarity":"","year":"","condition":"","gradingService":"","gradingGrade":"","notes":""}`
              }]
            })
          });
          const d2 = await r2.json();
          if (r2.ok && !d2.error) {
            const raw2 = d2.content.filter(b => b.type === "text").map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
            try {
              const fromQR = JSON.parse(raw2);
              // Merge QR data into parsed — QR page is authoritative, fill blanks only
              Object.keys(fromQR).forEach(k => {
                if (fromQR[k] && fromQR[k] !== "" && (!parsed[k] || parsed[k] === "")) {
                  parsed[k] = fromQR[k];
                } else if (fromQR[k] && fromQR[k] !== "" && k !== "condition") {
                  // QR page wins on most fields (it's the official source)
                  parsed[k] = fromQR[k];
                }
              });
              console.log("QR enriched card data:", parsed);
            } catch(e) { console.warn("Could not parse QR page response:", raw2); }
          }
        } catch(e) { console.warn("QR fetch failed:", e); }
      }

      const searchQ = [
        parsed.name, parsed.set, parsed.number, parsed.year,
        parsed.gradingService && parsed.gradingGrade ? `${parsed.gradingService} ${parsed.gradingGrade}` : ""
      ].filter(Boolean).join(" ").trim();

      // Pause here — show editable search query to user before fetching prices
      setSearchQuery(searchQ);
      const HAIKU_IN = 1/1000000, HAIKU_OUT = 5/1000000;
      const u1 = d1.usage || {};
      const step1Cost = parseFloat(((u1.input_tokens||0)*HAIKU_IN + (u1.output_tokens||0)*HAIKU_OUT).toFixed(5));
      setResult({ ...parsed, thumbnail: front, thumbnailBack: back || null, id: Date.now(),
        purchasePrice:0, gradingCost:0, otherCosts:0, sold:false,
        dateAdded: new Date().toISOString().split("T")[0],
        change24h:"0", changeWeek:"0", priceHistory:[], lastUpdated: new Date().toISOString().split("T")[0],
        manualEntry:false, _apiCostStep1: step1Cost
      });
      setStep(""); setMode("confirm_search");
    } catch(err) {
      console.error("AI error:", err);
      setStep("");
      const msg = (err?.message || "").toLowerCase();
      const raw = err?.message || "Unknown error";
      let reason;
      if (!apiKey) {
        reason = "No API key set. Add your Anthropic API key in the Profile panel (tap your avatar → API Key).";
      } else if (msg.includes("401") || msg.includes("authentication_error") || msg.includes("invalid x-api-key") || msg.includes("invalid api")) {
        reason = `Invalid API key — double-check it in the Profile panel.\n\nKey length: ${apiKey?.length || 0} chars\nStarts with: ${apiKey?.slice(0,8) || "(empty)"}\n\nDetails: ${raw}`;
      } else if (msg.includes("403") || msg.includes("permission") || msg.includes("forbidden")) {
        reason = `API key doesn't have access — check your Anthropic billing at console.anthropic.com.\n\nDetails: ${raw}`;
      } else if (msg.includes("429") || msg.includes("rate_limit") || msg.includes("overloaded")) {
        reason = `Rate limit reached — wait a moment and try again.\n\nDetails: ${raw}`;
      } else if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("network")) {
        reason = "Network error — check your internet connection and try again.";
      } else if (msg.includes("json") || msg.includes("parse") || msg.includes("unexpected token")) {
        reason = `Unexpected API response — try again.\n\nDetails: ${raw}`;
      } else if (msg.includes("500") || msg.includes("502") || msg.includes("503")) {
        reason = `Anthropic API is temporarily unavailable — try again shortly.\n\nDetails: ${raw}`;
      } else {
        reason = `Analysis failed — ${raw}`;
      }
      setAiError(reason);
      setForm(blankForm);
      setMode("manual");
    }
  };

  const fetchPrices = async (query) => {
    setMode("analyzing"); setStep("Looking up prices...");
    const HAIKU_IN = 1/1000000, HAIKU_OUT = 5/1000000;
    try {
      const headers = { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true", "anthropic-version": "2023-06-01", ...(apiKey ? {"x-api-key": apiKey} : {}) };

      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers,
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `You are a trading card price expert. Based on your knowledge of trading card markets and eBay sold listings, provide realistic price estimates for this card: "${query}".

Return ONLY this JSON, no other text, no markdown:
{"soldPrices":[0.00,0.00,0.00],"activePrices":[0.00,0.00],"mostRecentListed":0.00,"ebayUrl":"https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1"}

Fill in realistic numbers based on what this type of card typically sells for. If you don't know, use 0.`
          }]
        })
      });

      const d = await r.json();
      if (!r.ok || d.error) throw new Error(`[${r.status}] ${d.error?.message || "API error"}`);

      const u = d.usage || {};
      const step1Cost = result?._apiCostStep1 || 0;
      const step2Cost = parseFloat(((u.input_tokens||0)*HAIKU_IN + (u.output_tokens||0)*HAIKU_OUT).toFixed(5));
      const totalCost = parseFloat((step1Cost + step2Cost).toFixed(5));

      const raw = (d.content||[]).map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      console.log("Price response:", raw);

      let mv=0, avg10s=0, avg10l=0, mrl=0;
      let srcUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`;
      try {
        const pi = JSON.parse(raw);
        const sold = (pi.soldPrices||[]).map(Number).filter(n=>n>0);
        const active = (pi.activePrices||[]).map(Number).filter(n=>n>0);
        mv = sold[0]||0;
        avg10s = sold.length ? Math.round(sold.reduce((a,b)=>a+b,0)/sold.length*100)/100 : 0;
        avg10l = active.length ? Math.round(active.reduce((a,b)=>a+b,0)/active.length*100)/100 : 0;
        mrl = Number(pi.mostRecentListed)||0;
        if (pi.ebayUrl) srcUrl = pi.ebayUrl;
      } catch(e) {
        console.warn("JSON parse failed, trying extraction:", e.message, raw);
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) { try { const pi=JSON.parse(m[0]); const sold=(pi.soldPrices||[]).map(Number).filter(n=>n>0); mv=sold[0]||0; avg10s=sold.length?Math.round(sold.reduce((a,b)=>a+b,0)/sold.length*100)/100:0; mrl=Number(pi.mostRecentListed)||0; if(pi.ebayUrl)srcUrl=pi.ebayUrl; } catch(e2){} }
      }

      const displayValue = mv||avg10s||mrl||avg10l||0;
      const monthName = new Date().toLocaleString("en-US",{month:"short"});
      setResult(r => ({
        ...r, value:displayValue,
        priceMostRecentSold:mv, priceAvg10Sold:avg10s, priceAvg10List:avg10l, priceMostRecentListed:mrl,
        priceSource:"eBay Est.", priceSourceUrl:srcUrl,
        priceUpdatedAt:new Date().toISOString().split("T")[0], ebayUrl:srcUrl,
        change24h:"0", changeWeek:"0",
        priceHistory:displayValue>0?[{month:monthName,value:displayValue}]:[],
        lastUpdated:new Date().toISOString().split("T")[0], apiCost:totalCost
      }));
      setStep(""); setMode("result");
    } catch(err) {
      console.error("fetchPrices error:", err);
      setResult(r=>({...r, apiCost:parseFloat((result?._apiCostStep1||0).toFixed(5))}));
      setAiError(`Price lookup failed — ${err?.message||"Unknown error"}`);
      setStep(""); setMode("result");
    }
  };

  const submitManual = () => {
    if (!form.name.trim()) return alert("Please enter a card name.");
    const card = {
      ...form,
      value: parseFloat(form.value) || 0,
      thumbnail: imgFront || null,
      thumbnailBack: imgBack || null,
      id: Date.now(),
      purchasePrice: 0, gradingCost: 0, otherCosts: 0, sold: false,
      dateAdded: form.dateAdded || new Date().toISOString().split("T")[0],
      change24h: "0", changeWeek: "0",
      priceHistory: parseFloat(form.value) > 0 ? [{month: new Date().toLocaleString('en-US',{month:'short'}), value: parseFloat(form.value)}] : [],
      lastUpdated: new Date().toISOString().split("T")[0],
      ebayUrl: `https://ebay.com/sch/i.html?_nkw=${encodeURIComponent(form.name)}`,
      manualEntry: true
    };
    onCardAdded(card);
  };

  const submitManualWatchlist = () => {
    if (!form.name.trim()) return alert("Please enter a card name.");
    const card = {
      ...form,
      value: parseFloat(form.value) || 0,
      thumbnail: imgFront || null,
      thumbnailBack: imgBack || null,
      id: Date.now(),
      purchasePrice: 0, gradingCost: 0, otherCosts: 0, sold: false,
      dateAdded: form.dateAdded || new Date().toISOString().split("T")[0],
      change24h: "0", changeWeek: "0",
      priceHistory: parseFloat(form.value) > 0 ? [{month: new Date().toLocaleString('en-US',{month:'short'}), value: parseFloat(form.value)}] : [],
      lastUpdated: new Date().toISOString().split("T")[0],
      ebayUrl: `https://ebay.com/sch/i.html?_nkw=${encodeURIComponent(form.name)}`,
      manualEntry: true
    };
    onWatchlistAdded(card);
  };

  const SvgCamera = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>);
  const SvgUpload = () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/><line x1="12" y1="2" x2="12" y2="10"/><polyline points="9 5 12 2 15 5"/></svg>);
  const SvgPencil = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>);

  const OptionBtn = ({ SvgIcon, title, sub, onClick, ghost }) => (
    <button onClick={onClick} style={{ background: ghost ? "transparent" : ACCENT, color: ghost ? TEXT2 : "#000", border: ghost ? `1px solid ${BORDER}` : "none", borderRadius: 14, padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, width: "100%", transition: "all .2s" }}>
      <span style={{ flexShrink: 0, opacity: ghost ? 0.7 : 1 }}><SvgIcon /></span>
      <div style={{ textAlign: "left" }}><div>{title}</div><div style={{ fontSize: 12, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{sub}</div></div>
    </button>
  );

  const isFront = mode === "choose";
  const isAddBack = mode === "add_back";
  const isAnalyzing = mode === "analyzing";

  return (
    <>{modal}
    <div style={{paddingBottom:90}}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={() => { stopCam(); onBack(); }} style={{ background: "none", border: "none", cursor: "pointer", color: TEXT1, display: "flex", alignItems: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span style={{ fontFamily: "'Fredoka One',cursive", fontSize: 20, color: TEXT1, flex: 1 }}>
          {mode === "manual" ? "Manual Entry" : "Scan Card"}
        </span>
        {(isFront || isAddBack || isAnalyzing) && (
          <button onClick={() => { stopCam(); setMode("manual"); setAiError(null); setForm(blankForm); }}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 11px", cursor: "pointer", color: TEXT2, fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600 }}>
            <SvgPencil/> Manual
          </button>
        )}
      </div>

      {/* CHOOSE — first image */}
      {isFront && (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, maxWidth: 480, margin: "0 auto" }}>
          <p style={{ color: TEXT2, fontSize: 13, fontFamily: "'DM Sans',sans-serif", textAlign: "center", marginTop: 4, marginBottom: 4 }}>
            Take or upload a photo of your card to identify and price it
          </p>
          <OptionBtn SvgIcon={SvgCamera} title="Camera" sub="Point at either side of the card" onClick={() => startCamera("front")} />
          <OptionBtn SvgIcon={SvgUpload} title="Upload Image" sub="JPG or PNG from your device" onClick={() => fileRef.current?.click()} ghost />
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
        </div>
      )}

      {/* ADD BACK — optional second image */}
      {isAddBack && (
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, maxWidth: 480, margin: "0 auto" }}>
          {/* Preview of first image */}
          {imgFront && (
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <img src={imgFront} alt="" style={{ maxHeight: 120, maxWidth: "100%", objectFit: "contain", borderRadius: 10, border: `2px solid ${GREEN}55` }}/>
              <div style={{ fontSize: 10, color: GREEN, fontFamily: "'DM Mono',monospace", marginTop: 4, fontWeight: 700 }}>✓ First image captured</div>
            </div>
          )}

          {/* Divider with label */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: BORDER }}/>
            <span style={{ fontSize: 11, color: TEXT3, fontFamily: "'DM Mono',monospace", whiteSpace: "nowrap" }}>Add back of card? (optional)</span>
            <div style={{ flex: 1, height: 1, background: BORDER }}/>
          </div>

          <OptionBtn SvgIcon={SvgCamera} title="Camera — Back" sub="Flip card over and scan the back" onClick={() => startCamera("back")} />
          <OptionBtn SvgIcon={SvgUpload} title="Upload Back Image" sub="JPG or PNG from your device" onClick={() => fileBackRef.current?.click()} ghost />
          <input ref={fileBackRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleBackFile} />

          {/* Analyze with just the one image */}
          <button onClick={() => analyzeImages(imgFront, null)}
            style={{ background: ACCENT, color: "#000", border: "none", borderRadius: 14, padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, width: "100%" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Analyze Now
          </button>

          <button onClick={() => { setImgFront(null); setMode("choose"); }}
            style={{ background: "transparent", border: "none", color: TEXT3, fontFamily: "'DM Sans',sans-serif", fontSize: 12, cursor: "pointer", textAlign: "center", padding: "4px" }}>
            ← Retake first image
          </button>
        </div>
      )}

      {/* CAMERA */}
      {mode === "camera" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 20 }}>
          <p style={{ color: ACCENT, fontSize: 13, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
            Scanning {captureTarget === "back" ? "back" : "front"} of card
          </p>
          <div style={{ position: "relative", width: "100%", maxWidth: 480 }}>
            <video ref={vidRef} autoPlay playsInline style={{ width: "100%", borderRadius: 14, background: "#000" }} />
            {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
              <div key={v+h} style={{ position:"absolute",[v]:12,[h]:12,width:24,height:24, borderTop:v==="top"?`2px solid ${ACCENT}`:"none",borderBottom:v==="bottom"?`2px solid ${ACCENT}`:"none", borderLeft:h==="left"?`2px solid ${ACCENT}`:"none",borderRight:h==="right"?`2px solid ${ACCENT}`:"none"}}/>
            ))}
          </div>
          <p style={{ color: TEXT2, fontSize: 13, fontFamily: "'DM Sans',sans-serif" }}>Center the card, then tap capture</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={capturePhoto} style={{ background: ACCENT, color: "#000", border: "none", borderRadius: 50, width: 60, height: 60, fontSize: 24, cursor: "pointer", boxShadow: `0 0 20px ${ACCENT}66` }}>📸</button>
            <button onClick={() => { stopCam(); setMode(captureTarget === "back" ? "add_back" : "choose"); }} style={{ background: SURFACE, color: TEXT2, border: `1px solid ${BORDER}`, borderRadius: 50, width: 60, height: 60, fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
        </div>
      )}

      {/* ANALYZING */}
      {isAnalyzing && (
        <div style={{ padding: 40, textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:24 }}>
            {imgFront && <img src={imgFront} alt="Front" style={{ height:90, objectFit:"contain", borderRadius:10, border:`1px solid ${BORDER}` }}/>}
            {imgBack  && <img src={imgBack}  alt="Back"  style={{ height:90, objectFit:"contain", borderRadius:10, border:`1px solid ${BORDER}` }}/>}
          </div>
          <div style={{ width: 44, height: 44, border: `3px solid ${BORDER}`, borderTop: `3px solid ${ACCENT}`, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: ACCENT, fontSize: 15, fontWeight: 600 }}>{step}</p>
        </div>
      )}

      {/* CONFIRM SEARCH QUERY */}
      {mode === "confirm_search" && result && (
        <div style={{ padding: "20px", maxWidth: 560, margin: "0 auto" }}>
          {/* Show both images side by side */}
          {(imgFront || imgBack) && (
            <div style={{ display:"grid", gridTemplateColumns: imgFront && imgBack ? "1fr 1fr" : "1fr", gap:8, marginBottom:16 }}>
              {imgFront && <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${BORDER}`,background:SURFACE}}><img src={imgFront} alt="Front" style={{width:"100%",maxHeight:160,objectFit:"contain",display:"block"}}/><div style={{textAlign:"center",fontSize:10,color:TEXT3,padding:"4px 0",fontFamily:"'DM Mono',monospace"}}>FRONT</div></div>}
              {imgBack  && <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${BORDER}`,background:SURFACE}}><img src={imgBack}  alt="Back"  style={{width:"100%",maxHeight:160,objectFit:"contain",display:"block"}}/><div style={{textAlign:"center",fontSize:10,color:TEXT3,padding:"4px 0",fontFamily:"'DM Mono',monospace"}}>BACK</div></div>}
            </div>
          )}
          <div style={{ background:SURFACE, borderRadius:16, padding:20, border:`1px solid ${BORDER}` }}>
            <h2 style={{ fontFamily:"'Fredoka One',cursive", fontSize:20, color:TEXT1, margin:"0 0 4px" }}>{result.name}</h2>
            <p style={{ color:TEXT2, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:16 }}>{result.set} · #{result.number} · {result.year}</p>
            <div style={{ fontSize:10, color:TEXT3, fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 }}>Search Keywords — edit before looking up prices</div>
            <input
              value={searchQuery}
              onChange={e=>setSearchQuery(e.target.value)}
              style={{ width:"100%", background:SURFACE2, border:`2px solid ${ACCENT}55`, borderRadius:10, padding:"11px 14px", fontFamily:"'DM Mono',monospace", fontSize:13, color:TEXT1, outline:"none", boxSizing:"border-box", marginBottom:14 }}
            />
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              <button onClick={()=>fetchPrices(searchQuery)} style={{ width:"100%", background:ACCENT, color:"#000", border:"none", borderRadius:10, padding:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14 }}>🔍 Search Prices</button>
              <button onClick={()=>setMode("result")} style={{ width:"100%", background:"transparent", color:TEXT2, border:`1px solid ${BORDER}`, borderRadius:10, padding:11, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13 }}>Skip — add without prices</button>
            </div>
          </div>
        </div>
      )}

      {/* RESULT */}
      {mode === "result" && result && (
        <div style={{ padding: 20, maxWidth: 560, margin: "0 auto" }}>
          {/* Show both images side by side if available */}
          {(imgFront || imgBack) && (
            <div style={{ display:"grid", gridTemplateColumns: imgFront && imgBack ? "1fr 1fr" : "1fr", gap:8, marginBottom:16 }}>
              {imgFront && <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${BORDER}`,background:SURFACE}}><img src={imgFront} alt="Front" style={{width:"100%",maxHeight:160,objectFit:"contain",display:"block"}}/><div style={{textAlign:"center",fontSize:10,color:TEXT3,padding:"4px 0",fontFamily:"'DM Mono',monospace"}}>FRONT</div></div>}
              {imgBack  && <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${BORDER}`,background:SURFACE}}><img src={imgBack}  alt="Back"  style={{width:"100%",maxHeight:160,objectFit:"contain",display:"block"}}/><div style={{textAlign:"center",fontSize:10,color:TEXT3,padding:"4px 0",fontFamily:"'DM Mono',monospace"}}>BACK</div></div>}
            </div>
          )}
          <div style={{ background: SURFACE, borderRadius: 16, padding: 20, border: `1px solid ${BORDER}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <h2 style={{ fontFamily: "'Fredoka One',cursive", fontSize: 24, color: TEXT1, margin: "0 0 4px" }}>{result.name}</h2>
                <p style={{ color: TEXT2, fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>{result.set} · #{result.number} · {result.year}</p>
              </div>
              <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 20, background: GREEN+"22", color: GREEN, fontFamily: "'DM Mono',monospace", fontWeight: 700, border: `1px solid ${GREEN}44`, whiteSpace:"nowrap", marginTop:4 }}>✦ AI</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
              {[
                {label:"Most Recent Sold",   val:result.priceMostRecentSold,    hi:true},
                {label:"Most Recent Listed", val:result.priceMostRecentListed,  hi:true},
                {label:"Avg 10 Sold",        val:result.priceAvg10Sold,         hi:false},
                {label:"Avg 10 Listed",      val:result.priceAvg10List,         hi:false},
              ].map(({label,val,hi})=>(
                <div key={label} style={{ background:hi?ACCENT+"12":SURFACE2, borderRadius:8, padding:"8px 6px", border:`1px solid ${hi?ACCENT+"33":BORDER}`, textAlign:"center" }}>
                  <div style={{ fontSize:8, color:hi?ACCENT:TEXT3, fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:4, lineHeight:1.3 }}>{label}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:hi?ACCENT:TEXT1, fontFamily:"'DM Mono',monospace" }}>
                    {val>0 ? fmt$(val) : <span style={{color:TEXT3,fontWeight:400,fontSize:11}}>—</span>}
                  </div>
                </div>
              ))}
            </div>
            {result.priceSource && (
              <div style={{ fontSize:10, color:TEXT3, fontFamily:"'DM Mono',monospace", marginBottom:12, textAlign:"center" }}>
                Source: <a href={result.priceSourceUrl||"#"} target="_blank" rel="noreferrer" style={{color:ACCENT,textDecoration:"none"}}>{result.priceSource} ↗</a> · {result.priceUpdatedAt}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: result.conditionNotes ? 8 : 14 }}>
              {[["Type",result.type],["Condition",result.condition],["Rarity",result.rarity||"—"],["Graded",result.gradingService?(result.gradingService+" "+result.gradingGrade):"Raw"]].map(([l,v])=>(
                <div key={l} style={{ background:SURFACE2, borderRadius:8, padding:"9px 11px" }}>
                  <div style={{ fontSize:9, color:TEXT3, fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:2 }}>{l}</div>
                  <div style={{ fontSize:12, color:TEXT1, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
            {result.conditionNotes && (
              <div style={{background:SURFACE2,borderRadius:8,padding:"8px 11px",marginBottom:14,border:`1px solid ${BORDER}`}}>
                <div style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:3}}>Condition Assessment</div>
                <div style={{fontSize:12,color:TEXT2,fontFamily:"'DM Sans',sans-serif",fontStyle:"italic"}}>{result.conditionNotes}</div>
              </div>
            )}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:4}}>Date Added</div>
              <input type="date" value={result.dateAdded||new Date().toISOString().split("T")[0]}
                max={new Date().toISOString().split("T")[0]}
                onChange={e=>setResult(r=>({...r,dateAdded:e.target.value}))}
                style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{ display: "flex", flexDirection:"column", gap: 8 }}>
              <button onClick={() => onCardAdded(result)} style={{ width:"100%", background:ACCENT, color:"#000", border:"none", borderRadius:10, padding:13, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14 }}>+ Add to Vault</button>
              <button onClick={() => onWatchlistAdded(result)} style={{ width:"100%", background:ACCENT+"18", color:ACCENT, border:`2px solid ${ACCENT}`, borderRadius:10, padding:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14 }}>👀 Add to Watchlist</button>
              <button onClick={() => { setMode("choose"); setResult(null); setImgFront(null); setImgBack(null); }} style={{ width:"100%", background:"transparent", color:TEXT2, border:`1px solid ${BORDER}`, borderRadius:10, padding:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13 }}>🔄 Scan Another</button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ENTRY */}
      {mode === "manual" && (
        <div style={{ padding: "16px 20px 40px", maxWidth: 560, margin: "0 auto" }}>
          {aiError && (
            <div style={{ background:RED+"15", border:`1px solid ${RED}44`, borderRadius:12, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"flex-start", gap:10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={RED} strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:RED, marginBottom:4 }}>AI Analysis Failed</div>
                {aiError.split("\n\n").map((line, i) => (
                  <div key={i} style={{ fontSize:12, color: i===0 ? TEXT1 : TEXT3, fontFamily:"'DM Sans',sans-serif", marginBottom: i===0 ? 4 : 0, wordBreak:"break-all" }}>{line}</div>
                ))}
              </div>
            </div>
          )}
          {imgFront && <div style={{ marginBottom:16, textAlign:"center" }}><img src={imgFront} alt="" style={{ maxHeight:150, maxWidth:"100%", objectFit:"contain", borderRadius:10, border:`1px solid ${BORDER}` }}/></div>}
          {!imgFront && (
            <div>
              <button onClick={() => fileRef.current?.click()} style={{ width:"100%", background:SURFACE, border:`1px dashed ${BORDER}`, borderRadius:12, padding:"14px", cursor:"pointer", color:TEXT2, fontFamily:"'DM Sans',sans-serif", fontSize:13, marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <SvgUpload /> Attach photo (optional)
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => { const f=e.target.files[0]; if(!f)return; const r=new FileReader(); r.onload=ev=>setImgFront(ev.target.result); r.readAsDataURL(f); }} />
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18, padding:"9px 12px", background:ACCENT+"15", border:`1px solid ${ACCENT}44`, borderRadius:10 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span style={{ fontSize:12, color:ACCENT, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>This card will be tagged as manually entered</span>
          </div>
          <div style={{ background:SURFACE, borderRadius:16, padding:18, border:`1px solid ${BORDER}` }}>
            <InputRow label="Card Name *"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="e.g. Charizard"/></InputRow>
            <InputRow label="Set / Series"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} value={form.set} onChange={e=>setF("set",e.target.value)} placeholder="e.g. Base Set"/></InputRow>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <InputRow label="Card #"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} value={form.number} onChange={e=>setF("number",e.target.value)} placeholder="e.g. 4/102"/></InputRow>
              <InputRow label="Year"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} value={form.year} onChange={e=>setF("year",e.target.value)} placeholder="e.g. 1999"/></InputRow>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <InputRow label="Type"><select style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none"}} value={form.type} onChange={e=>setF("type",e.target.value)}>{["pokémon","baseball","basketball","football","soccer","magic","other"].map(o=><option key={o} value={o} style={{background:SURFACE}}>{o}</option>)}</select></InputRow>
              <InputRow label="Condition"><select style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none"}} value={form.condition} onChange={e=>setF("condition",e.target.value)}>{["Pristine","Mint","Near Mint","Excellent","Good","Fair","Poor"].map(o=><option key={o} value={o} style={{background:SURFACE}}>{o}</option>)}</select></InputRow>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <InputRow label="Grading Service"><select style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none"}} value={form.gradingService} onChange={e=>setF("gradingService",e.target.value)}>{["","PSA","BGS","CGC","SGC","HGA","CSG","ACE"].map(o=><option key={o} value={o} style={{background:SURFACE}}>{o}</option>)}</select></InputRow>
              <InputRow label="Grade"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} value={form.gradingGrade} onChange={e=>setF("gradingGrade",e.target.value)} placeholder="e.g. 9.5"/></InputRow>
            </div>
            <InputRow label="Estimated Value ($)"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} type="number" value={form.value} onChange={e=>setF("value",e.target.value)} placeholder="e.g. 150"/></InputRow>
            <InputRow label="My Value ($)"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} type="number" value={form.userValue||""} onChange={e=>setF("userValue",e.target.value)} placeholder="Your personal valuation"/></InputRow>
            <InputRow label="Rarity"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} value={form.rarity} onChange={e=>setF("rarity",e.target.value)} placeholder="e.g. Holo Rare"/></InputRow>
            <InputRow label="Notes"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Any extra details..."/></InputRow>
            <InputRow label="Date Added"><input style={{width:"100%",background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 12px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",boxSizing:"border-box"}} type="date" max={new Date().toISOString().split("T")[0]} value={form.dateAdded} onChange={e=>setF("dateAdded",e.target.value)}/></InputRow>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:16 }}>
            <button onClick={submitManual} style={{ width:"100%", background:ACCENT, color:"#000", border:"none", borderRadius:10, padding:14, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14 }}>+ Add to Vault</button>
            <button onClick={submitManualWatchlist} style={{ width:"100%", background:ACCENT+"18", color:ACCENT, border:`2px solid ${ACCENT}`, borderRadius:10, padding:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14 }}>👀 Add to Watchlist</button>
            <button onClick={() => { setMode("choose"); setImgFront(null); setImgBack(null); setAiError(null); }} style={{ width:"100%", background:"transparent", color:TEXT2, border:`1px solid ${BORDER}`, borderRadius:10, padding:12, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:13 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

// ── HOME / PORTFOLIO ───────────────────────────────────────────
function HomeView({ cards, onSelectCard, onScan }) {
  const active=cards.filter(c=>!c.sold), sold=cards.filter(c=>c.sold);
  const tv=active.reduce((s,c)=>s+c.value,0), tc=cards.reduce((s,c)=>s+costBasis(c),0);
  const ug=active.reduce((s,c)=>s+gainLoss(c),0), rg=sold.reduce((s,c)=>s+gainLoss(c),0);
  const ph=(cards[0]?.priceHistory||[]).map((pt,i)=>({month:pt.month,value:active.reduce((s,c)=>s+(c.priceHistory?.[i]?.value||c.value),0)}));
  const topMovers=[...active].sort((a,b)=>parseFloat(b.change24h||0)-parseFloat(a.change24h||0)).slice(0,4);

  return (
    <div style={{paddingBottom:90}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(160deg,#111,#0a0a0a)",padding:"24px 20px 0",borderBottom:`1px solid ${BORDER}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <p style={{color:TEXT3,fontSize:11,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.12em",margin:"0 0 4px"}}>Portfolio Value</p>
            <div style={{fontSize:38,fontWeight:800,color:TEXT1,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{fmt$(tv)}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
              <span style={{fontSize:13,color:ug>=0?GREEN:RED,fontFamily:"'DM Mono',monospace",fontWeight:700}}>
                {ug>=0?"▲":"▼"} {fmt$k(Math.abs(ug))} ({ug>=0?"+":""}{tc>0?((ug/tc)*100).toFixed(1):0}%)
              </span>
              <span style={{fontSize:10,color:TEXT3}}>unrealized</span>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:12,color:TEXT3,fontFamily:"'DM Mono',monospace"}}>{active.length} cards</div>
            <div style={{fontSize:12,color:rg>=0?GREEN:RED,fontFamily:"'DM Mono',monospace",marginTop:4,fontWeight:700}}>+{fmt$k(rg)} realized</div>
          </div>
        </div>
        <div style={{height:90,margin:"0 -4px",borderRadius:8,background:T.dark?"transparent":"#EBEBEB"}}><MiniChart data={ph} height={90}/></div>
      </div>

      <div style={{padding:"16px 16px 0"}}>
        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[{l:"Cost Basis",v:fmt$k(tc),c:TEXT1},{l:"Realized",v:(rg>=0?"+":"")+fmt$k(rg),c:rg>=0?GREEN:RED},{l:"Sold",v:sold.length+" cards",c:TEXT2}].map(s=>(
            <div key={s.l} style={{background:SURFACE,borderRadius:12,padding:"12px 10px",border:`1px solid ${BORDER}`}}>
              <div style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:3}}>{s.l}</div>
              <div style={{fontSize:13,fontWeight:800,color:s.c,fontFamily:"'DM Mono',monospace"}}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Scan CTA */}
        <button onClick={onScan} style={{width:"100%",background:ACCENT,color:"#000",border:"none",borderRadius:14,padding:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,fontFamily:"'Fredoka One',cursive",fontSize:17,marginBottom:20,boxShadow:`0 0 24px ${ACCENT}44`}}>
          <Icons.Scan/> Scan a Card
        </button>

        {/* Top Movers / Recent Cards */}
        <h3 style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:TEXT1,marginBottom:10}}>
          {topMovers.some(c=>c.priceMostRecentSold>0) ? "Top Movers Today" : "Recent Cards"}
        </h3>
        <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
          {topMovers.length === 0 ? (
            <div style={{background:SURFACE,borderRadius:14,padding:"28px 20px",border:`1px dashed ${BORDER}`,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:10}}>🃏</div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:TEXT1,marginBottom:6}}>Your vault is empty</div>
              <div style={{fontSize:12,color:TEXT2,fontFamily:"'DM Sans',sans-serif",lineHeight:1.6,marginBottom:16}}>Scan your first card to start tracking your collection and portfolio value.</div>
              <button onClick={onScan} style={{background:ACCENT,color:"#000",border:"none",borderRadius:10,padding:"10px 22px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13}}>
                Scan Your First Card →
              </button>
            </div>
          ) : topMovers.map(card=>{
            const ch=parseFloat(card.change24h||0), up=ch>=0;
            return (
              <div key={card.id} onClick={()=>onSelectCard(card)}
                style={{background:SURFACE,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,cursor:"pointer",border:`1px solid ${BORDER}`,transition:"border .15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=ACCENT+"66"}
                onMouseLeave={e=>e.currentTarget.style.borderColor=BORDER}>
                <Thumb card={card} size={40}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.name}</div>
                  <div style={{fontSize:10,color:TEXT2,fontFamily:"'DM Sans',sans-serif"}}>{card.set}</div>
                </div>
                <div style={{minWidth:70,height:32}}><MiniChart data={card.priceHistory} height={32}/></div>
                <div style={{textAlign:"right",minWidth:64}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:TEXT1}}>{fmt$k(card.value)}</div>
                  {card.priceMostRecentSold>0 && <div style={{fontSize:11,fontWeight:700,color:up?GREEN:RED,fontFamily:"'DM Mono',monospace"}}>{up?"▲":"▼"}{Math.abs(ch)}%</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── COLLECTION ─────────────────────────────────────────────────
function CollectionView({ cards, onSelectCard, onDelete, onImportCards }) {
  const [q,setQ]=useState(""),tf=useState("all"),sort=useState("value"),vm=useState("list");
  const [typeFilter,setType]=tf, [sortBy,setSort]=sort, [viewMode,setViewMode]=vm;
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // {added, skipped, errors}
  const importRef = useRef(null);
  const { BG, SURFACE, SURFACE2, BORDER, TEXT1, TEXT2, TEXT3, ACCENT, GREEN, RED, BLUE } = useContext(ThemeCtx);

  const CARD_COLUMNS = [
    "name","set","number","year","type","condition","rarity",
    "value","userValue","purchasePrice","purchaseDate","purchaseVenue",
    "gradingService","gradingGrade","gradingCost","otherCosts",
    "sold","salePrice","saleDate","saleVenue","notes","dateAdded"
  ];

  const toCsv = (rows) => rows.map(r => r.map(v => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g,'""')}"` : s;
  }).join(",")).join("\n");

  const downloadTemplate = () => {
    const rows = [
      CARD_COLUMNS,
      ["Charizard","Base Set","4/102","1999","pokémon","Near Mint","Holo Rare",420,280,"2023-06-12","eBay","PSA","9",25,0,"","","","","First Edition"],
      ["Mike Trout RC","Topps Update","US175","2011","baseball","Excellent","Rookie Card",185,120,"2022-04-18","Card Show","BGS","8.5",18,0,"","","","",""],
    ];
    const blob = new Blob([toCsv(rows)], {type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "card-deli-import-template.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  const exportCards = () => {
    const exportCols = [...CARD_COLUMNS, "priceMostRecentSold","priceAvg10Sold","priceAvg10List","priceSource","priceUpdatedAt","lastUpdated"];
    const rows = [exportCols, ...cards.map(c => exportCols.map(k => c[k] ?? ""))];
    const blob = new Blob([toCsv(rows)], {type:"text/csv"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `card-deli-export-${new Date().toISOString().split("T")[0]}.csv`; a.click(); URL.revokeObjectURL(a.href);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImporting(true); setImportResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split(/\r?\n/).filter(l => l.trim());
        const parseCsvLine = (line) => {
          const res = []; let cur = "", inQ = false;
          for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') { inQ = !inQ; }
            else if (c === ',' && !inQ) { res.push(cur.trim()); cur = ""; }
            else cur += c;
          }
          res.push(cur.trim()); return res;
        };
        const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g,""));
        const added = [], skipped = [];
        lines.slice(1).forEach((line, i) => {
          const vals = parseCsvLine(line);
          const row = {};
          headers.forEach((h, idx) => { row[h] = vals[idx] ?? ""; });
          const name = (row.name || "").toString().trim();
          if (!name) { skipped.push(`Row ${i+2}: missing name`); return; }
          added.push({
            id: Date.now()+i, name,
            set: row.set||"", number: row.number||"", year: row.year||"",
            type: (row.type||"other").toLowerCase(),
            condition: row.condition||"Near Mint", rarity: row.rarity||"",
            value: parseFloat(row.value)||0, purchasePrice: parseFloat(row.purchaseprice)||0,
            purchaseDate: row.purchasedate||"", purchaseVenue: row.purchasevenue||"",
            gradingService: row.gradingservice||"", gradingGrade: row.gradinggrade||"",
            gradingCost: parseFloat(row.gradingcost)||0, otherCosts: parseFloat(row.othercosts)||0,
            sold: ["true","yes","1"].includes((row.sold||"").toLowerCase()),
            salePrice: parseFloat(row.saleprice)||null, saleDate: row.saledate||"",
            saleVenue: row.salevenue||"", notes: row.notes||"",
            thumbnail: null, manualEntry: true, change24h:0, changeWeek:0,
            priceMostRecentSold:0, priceAvg10Sold:0, priceAvg10List:0,
            lastUpdated: new Date().toISOString().split("T")[0],
            priceHistory: parseFloat(row.value) > 0 ? [{month: new Date().toLocaleString('en-US',{month:'short'}), value: parseFloat(row.value)}] : [],
            ebayUrl: `https://ebay.com/sch/i.html?_nkw=${encodeURIComponent(name)}`,
          });
        });
        onImportCards(added);
        setImportResult({added:added.length, skipped:skipped.length, skippedDetails:skipped, errors:[]});
      } catch(err) {
        setImportResult({added:0, skipped:0, errors:[err.message], skippedDetails:[]});
      }
      setImporting(false);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const rows=cards
    .filter(c=>typeFilter==="all"||c.type===typeFilter)
    .filter(c=>!q||c.name.toLowerCase().includes(q.toLowerCase())||c.set.toLowerCase().includes(q.toLowerCase()))
    .sort((a,b)=>sortBy==="value"?b.value-a.value:sortBy==="name"?a.name.localeCompare(b.name):gainLoss(b)-gainLoss(a));

  return (
    <div style={{paddingBottom:90}}>
      <div style={{padding:"14px 14px 10px",position:"sticky",top:0,background:BG,zIndex:10,borderBottom:`1px solid ${BORDER}`}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search cards…"
          style={{width:"100%",background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:10,padding:"9px 14px",fontFamily:"'DM Sans',sans-serif",fontSize:13,color:TEXT1,outline:"none",marginBottom:8}}/>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:6}}>
          {[{v:"all",l:"All"},{v:"pokémon",l:"Pokémon"},{v:"baseball",l:"Baseball"},{v:"basketball",l:"Basketball"},{v:"soccer",l:"Soccer"},{v:"magic",l:"Magic"},{v:"football",l:"Football"},{v:"other",l:"Other"}].map(t=>(
            <button key={t.v} onClick={()=>setType(t.v)}
              style={{flexShrink:0,padding:"5px 12px",borderRadius:20,border:`1px solid ${typeFilter===t.v?ACCENT:BORDER}`,background:typeFilter===t.v?ACCENT+"22":"transparent",color:typeFilter===t.v?ACCENT:TEXT2,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
              {t.l}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <select value={sortBy} onChange={e=>setSort(e.target.value)} style={{flex:1,background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:8,padding:"6px 10px",fontFamily:"'DM Sans',sans-serif",fontSize:12,color:TEXT1,outline:"none"}}>
            <option value="value" style={{background:SURFACE}}>Value ↓</option>
            <option value="gain" style={{background:SURFACE}}>Gain ↓</option>
            <option value="name" style={{background:SURFACE}}>Name A-Z</option>
          </select>
          <div style={{display:"flex",border:`1px solid ${BORDER}`,borderRadius:8,overflow:"hidden"}}>
            {[["grid","⊞"],["list","≡"]].map(([v,ic])=>(
              <button key={v} onClick={()=>setViewMode(v)} style={{padding:"6px 10px",border:"none",background:viewMode===v?ACCENT+"22":"transparent",color:viewMode===v?ACCENT:TEXT2,cursor:"pointer",fontSize:14}}>{ic}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:"10px 14px"}}>
        {/* Import / Export toolbar */}
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
          <button onClick={()=>importRef.current?.click()} disabled={importing}
            style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",background:GREEN+"18",color:GREEN,border:`1px solid ${GREEN}44`,borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {importing?"⏳ Importing…":"📥 Import Spreadsheet"}
          </button>
          <button onClick={exportCards} disabled={cards.length===0}
            style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",background:BLUE+"18",color:BLUE,border:`1px solid ${BLUE}44`,borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",opacity:cards.length===0?0.5:1}}>
            📤 Export to Excel
          </button>
          <button onClick={downloadTemplate}
            style={{display:"flex",alignItems:"center",gap:5,padding:"6px 11px",background:"transparent",color:TEXT2,border:`1px solid ${BORDER}`,borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,cursor:"pointer"}}>
            📋 Download Template
          </button>
          <input ref={importRef} type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={handleImportFile}/>
        </div>

        {/* Import result banner */}
        {importResult && (
          <div style={{background:importResult.errors?.length?RED+"15":GREEN+"15",border:`1px solid ${importResult.errors?.length?RED+"44":GREEN+"44"}`,borderRadius:10,padding:"10px 14px",marginBottom:10,position:"relative"}}>
            <button onClick={()=>setImportResult(null)} style={{position:"absolute",top:8,right:10,background:"none",border:"none",color:TEXT2,cursor:"pointer",fontSize:16,lineHeight:1}}>×</button>
            {importResult.errors?.length ? (
              <div style={{color:RED,fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600}}>
                ❌ Import error: {importResult.errors[0]}
              </div>
            ) : (
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12}}>
                <span style={{color:GREEN,fontWeight:700}}>✅ {importResult.added} card{importResult.added!==1?"s":""} imported</span>
                {importResult.skipped>0 && <span style={{color:TEXT2,marginLeft:8}}> · {importResult.skipped} row{importResult.skipped!==1?"s":""} skipped (missing name)</span>}
              </div>
            )}
          </div>
        )}

        <div style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace",marginBottom:10}}>{rows.length} cards · {fmt$k(rows.reduce((s,c)=>s+c.value,0))}</div>
        {viewMode==="grid"?(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:10}}>
            {rows.map(card=>{
              const ch=parseFloat(card.change24h||0);
              return (
                <div key={card.id} onClick={()=>onSelectCard(card)}
                  style={{background:SURFACE,borderRadius:14,padding:12,border:`1px solid ${BORDER}`,cursor:"pointer",position:"relative",transition:"all .18s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=ACCENT+"55";e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.transform="";}}>
                  {card.sold&&<Chip children="SOLD" color={RED} style={{position:"absolute",top:8,right:8}}/>}
                  {card.gradingService&&<span style={{position:"absolute",top:card.sold?26:8,right:8,fontSize:9,padding:"2px 7px",borderRadius:20,background:BLUE+"22",color:BLUE,fontFamily:"'DM Mono',monospace",fontWeight:700,border:`1px solid ${BLUE}33`}}>{card.gradingService}</span>}
                  {card.manualEntry&&<span style={{position:"absolute",bottom:8,left:8,fontSize:9,padding:"2px 7px",borderRadius:20,background:ACCENT+"22",color:ACCENT,fontFamily:"'DM Mono',monospace",fontWeight:700,border:`1px solid ${ACCENT}33`}}>✎ manual</span>}
                  <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Thumb card={card} size={80}/></div>
                  <div style={{fontWeight:700,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.name}</div>
                  <div style={{fontSize:9,color:TEXT2,marginBottom:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.set}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:13,fontWeight:800,color:TEXT1,fontFamily:"'DM Mono',monospace"}}>{fmt$k(card.value)}</span>
                    {card.priceMostRecentSold>0 && <span style={{fontSize:10,fontWeight:700,color:ch>=0?GREEN:RED,fontFamily:"'DM Mono',monospace"}}>{ch>=0?"▲":"▼"}{Math.abs(ch)}%</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {rows.map(card=>{
              const ch=parseFloat(card.change24h||0);
              return (
                <div key={card.id} style={{background:SURFACE,borderRadius:12,border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",overflow:"hidden"}}>
                  <div onClick={()=>onSelectCard(card)} style={{flex:1,padding:"10px 12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",minWidth:0}}>
                    <Thumb card={card} size={40}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>{card.name}</div>
                      <div style={{fontSize:10,color:TEXT2}}>{card.set} · {card.year||"—"}</div>
                    </div>
                    <div style={{minWidth:55,height:26}}><MiniChart data={card.priceHistory} height={26}/></div>
                    <div style={{textAlign:"right",minWidth:52}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,fontWeight:700,color:TEXT1}}>{fmt$k(card.value)}</div>
                      {card.priceMostRecentSold>0 && <div style={{fontSize:10,fontWeight:700,color:ch>=0?GREEN:RED,fontFamily:"'DM Mono',monospace"}}>{ch>=0?"▲":"▼"}{Math.abs(ch)}%</div>}
                    </div>
                  </div>
                  <button onClick={()=>{if(window.confirm(`Remove "${card.name}"?`))onDelete(card.id);}}
                    style={{background:"transparent",border:"none",borderLeft:`1px solid ${BORDER}`,padding:"0 14px",cursor:"pointer",color:RED,height:"100%",flexShrink:0,display:"flex",alignItems:"center"}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              );
            })}
            {rows.length===0&&<div style={{textAlign:"center",padding:48,color:TEXT3,fontFamily:"'DM Sans',sans-serif"}}><div style={{fontSize:40,marginBottom:10}}>🃏</div>No cards found</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CARD DETAIL ────────────────────────────────────────────────
function CardDetail({ card, onBack, onUpdate, onDelete, onRefreshPrice, fetching, apiKey }) {
  const [tab,setTab]=useState("overview");
  const [ed,setEd]=useState({...card});
  const [editing,setEditing]=useState(false);
  const [showSell,setShowSell]=useState(false);
  const [imgExpanded,setImgExpanded]=useState(false);
  const [showBack,setShowBack]=useState(false);
  const TODAY = new Date().toISOString().split("T")[0];

  // Only reset ed when navigating to a different card entirely
  useEffect(()=>{ setEd({...card}); }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const gl=gainLoss(card), cb=costBasis(card);
  const ch=parseFloat(card.change24h||0), chW=parseFloat(card.changeWeek||0);
  const save=()=>{onUpdate({...ed, sold:!!ed.sold});setEditing(false);};
  const activeImg = showBack ? card.thumbnailBack : card.thumbnail;
  const hasBack = !!card.thumbnailBack;

  return (
    <div style={{paddingBottom:90}}>
      {showSell&&<SellWriteupModal card={card} onClose={()=>setShowSell(false)} apiKey={apiKey}/>}

      {/* Full-screen image lightbox */}
      {imgExpanded && activeImg && (
        <div onClick={()=>setImgExpanded(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,cursor:"zoom-out"}}>
          <img src={activeImg} alt={card.name}
            style={{maxWidth:"100%",maxHeight:"90vh",objectFit:"contain",borderRadius:12,boxShadow:"0 8px 40px rgba(0,0,0,0.8)"}}/>
          <button onClick={()=>setImgExpanded(false)}
            style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.15)",border:"none",color:"#fff",width:36,height:36,borderRadius:"50%",fontSize:20,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",borderBottom:`1px solid ${BORDER}`,position:"sticky",top:0,background:BG,zIndex:10}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:TEXT1,display:"flex",alignItems:"center"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:TEXT1,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.name}</span>
        <button onClick={()=>setEditing(e=>!e)} style={{background:editing?ACCENT+"22":"transparent",color:editing?ACCENT:TEXT2,border:`1px solid ${editing?ACCENT:BORDER}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600}}>
          {editing?"Cancel":"Edit"}
        </button>
        <button onClick={()=>{if(window.confirm(`Remove "${card.name}" from your vault?`))onDelete(card.id);}}
          style={{background:"transparent",color:RED,border:`1px solid ${RED}44`,borderRadius:8,padding:"6px 10px",cursor:"pointer",display:"flex",alignItems:"center",flexShrink:0}}
          title="Delete card">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </div>

      <div style={{padding:"0 16px"}}>
        {/* Card images — show both side by side if both exist, otherwise single full-width */}
        {(card.thumbnail || card.thumbnailBack) && (
          <div style={{margin:"14px 0", display:"grid", gridTemplateColumns: card.thumbnail && card.thumbnailBack ? "1fr 1fr" : "1fr", gap:8}}>
            {card.thumbnail && (
              <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${BORDER}`,background:SURFACE,position:"relative",cursor:"zoom-in"}}
                onClick={()=>{setShowBack(false);setImgExpanded(true);}}>
                <img src={card.thumbnail} alt="Front" style={{width:"100%",maxHeight:220,objectFit:"contain",display:"block"}}/>
                {card.thumbnailBack && <div style={{position:"absolute",bottom:4,left:0,right:0,textAlign:"center",fontSize:9,color:"rgba(255,255,255,0.8)",fontFamily:"'DM Mono',monospace",background:"rgba(0,0,0,0.4)",padding:"2px 0"}}>FRONT</div>}
              </div>
            )}
            {card.thumbnailBack && (
              <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${BORDER}`,background:SURFACE,position:"relative",cursor:"zoom-in"}}
                onClick={()=>{setShowBack(true);setImgExpanded(true);}}>
                <img src={card.thumbnailBack} alt="Back" style={{width:"100%",maxHeight:220,objectFit:"contain",display:"block"}}/>
                <div style={{position:"absolute",bottom:4,left:0,right:0,textAlign:"center",fontSize:9,color:"rgba(255,255,255,0.8)",fontFamily:"'DM Mono',monospace",background:"rgba(0,0,0,0.4)",padding:"2px 0"}}>BACK</div>
              </div>
            )}
          </div>
        )}

        {/* Hero */}
        <div style={{background:SURFACE,borderRadius:16,margin:"14px 0",padding:18,display:"flex",gap:14,alignItems:"center",border:`1px solid ${BORDER}`}}>
          {!card.thumbnail && <Thumb card={card} size={72}/>}
          <div style={{flex:1}}>
            <div style={{color:TEXT2,fontSize:11,fontFamily:"'DM Sans',sans-serif",marginBottom:2,display:"flex",alignItems:"center",gap:6}}>{card.set} · #{card.number} · {card.year}{card.manualEntry&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:ACCENT+"22",color:ACCENT,fontFamily:"'DM Mono',monospace",fontWeight:700,border:`1px solid ${ACCENT}33`}}>✎ manual</span>}</div>
            <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:4}}>
              <span style={{fontSize:26,fontWeight:800,color:TEXT1,fontFamily:"'DM Mono',monospace"}}>{fmt$(card.value)}</span>
              {card.priceMostRecentSold>0 && <span style={{fontSize:11,color:ch>=0?GREEN:RED,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{ch>=0?"▲":"▼"}{Math.abs(ch)}%</span>}
            </div>
            {card.userValue>0&&<div style={{fontSize:11,color:ACCENT,fontFamily:"'DM Mono',monospace",marginBottom:2}}>My Value: {fmt$(card.userValue)}</div>}
            {card.priceMostRecentSold>0 && <div style={{fontSize:11,color:TEXT3,fontFamily:"'DM Mono',monospace"}}>Week: <span style={{color:chW>=0?GREEN:RED,fontWeight:700}}>{chW>=0?"▲":"▼"}{Math.abs(chW)}%</span></div>}
          </div>
          <button onClick={()=>onRefreshPrice(card)} disabled={fetching}
            style={{background:fetching?SURFACE2:ACCENT,color:fetching?TEXT2:"#000",border:`1px solid ${fetching?BORDER:ACCENT}`,borderRadius:10,padding:"10px 14px",cursor:fetching?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700,display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:72,transition:"all .2s"}}>
            <span style={{fontSize:16}}>{fetching?"…":"↻"}</span>
            <span style={{fontSize:9,fontWeight:600,opacity:0.8,whiteSpace:"nowrap"}}>{fetching?"Fetching…":"Tap to refresh"}</span>
          </button>
        </div>

        {/* Chart */}
        <div style={{background:SURFACE,borderRadius:14,padding:"14px 12px 8px",marginBottom:14,border:`1px solid ${BORDER}`}}>
          <div style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:8}}>Price History</div>
          <MiniChart data={card.priceHistory||[]} height={90}/>
          {(card.priceHistory||[]).length >= 2 && (
          <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
            {(card.priceHistory||[]).map(p=>(
              <div key={p.month} style={{textAlign:"center"}}>
                <div style={{fontSize:8,color:TEXT3,fontFamily:"'DM Mono',monospace"}}>{p.month}</div>
                <div style={{fontSize:9,color:TEXT1,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{fmt$k(p.value)}</div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Pricing Data */}
        <div style={{background:SURFACE,borderRadius:14,padding:16,marginBottom:14,border:`1px solid ${BORDER}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.08em"}}>Market Pricing</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              {card.priceSource ? (
                <a href={card.priceSourceUrl||card.ebayUrl||"#"} target="_blank" rel="noreferrer"
                  style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:ACCENT,fontFamily:"'DM Mono',monospace",fontWeight:700,textDecoration:"none",background:ACCENT+"18",border:`1px solid ${ACCENT}33`,borderRadius:20,padding:"2px 8px"}}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  {card.priceSource}
                </a>
              ) : (
                <span style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace"}}>No source</span>
              )}
              {card.priceUpdatedAt&&<span style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace"}}>{card.priceUpdatedAt}</span>}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {label:"Most Recent Sold",   val:card.priceMostRecentSold,    highlight:true},
              {label:"Most Recent Listed", val:card.priceMostRecentListed,  highlight:true},
              {label:"Avg Last 10 Sold",   val:card.priceAvg10Sold,         highlight:false},
              {label:"Avg Last 10 Listed", val:card.priceAvg10List,         highlight:false},
            ].map(({label,val,highlight})=>(
              <div key={label} style={{background:highlight?ACCENT+"12":SURFACE2,borderRadius:10,padding:"10px 8px",border:`1px solid ${highlight?ACCENT+"33":BORDER}`,textAlign:"center"}}>
                <div style={{fontSize:8,color:highlight?ACCENT:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:5,lineHeight:1.3}}>{label}</div>
                <div style={{fontSize:14,fontWeight:800,color:highlight?ACCENT:TEXT1,fontFamily:"'DM Mono',monospace"}}>
                  {val!=null&&val>0 ? fmt$(val) : <span style={{color:TEXT3,fontWeight:400,fontSize:11}}>—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sell write-up button */}
        <button onClick={()=>setShowSell(true)}
          style={{width:"100%",background:"linear-gradient(135deg,#1a1500,#0a0a00)",color:ACCENT,border:`1px solid ${ACCENT}44`,borderRadius:12,padding:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14,marginBottom:14,transition:"all .2s"}}
          onMouseEnter={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${ACCENT}22,${ACCENT}11)`;e.currentTarget.style.borderColor=ACCENT+"88";}}
          onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg,#1a1500,#0a0a00)";e.currentTarget.style.borderColor=ACCENT+"44";}}>
          ✍️ Generate Sell Write-Up
        </button>

        {/* Tabs */}
        <div style={{display:"flex",background:SURFACE,borderRadius:10,padding:3,marginBottom:14,border:`1px solid ${BORDER}`}}>
          {[["overview","Overview"],["tax","Tax / P&L"],["market","Market"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"7px",border:"none",borderRadius:8,background:tab===v?SURFACE2:"transparent",color:tab===v?TEXT1:TEXT2,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,cursor:"pointer",border:tab===v?`1px solid ${BORDER}`:"1px solid transparent"}}>
              {l}
            </button>
          ))}
        </div>

        {tab==="overview"&&(
          editing?(
            <div style={{background:SURFACE,borderRadius:14,padding:18,border:`1px solid ${BORDER}`,display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <FI label="Name" value={ed.name} onChange={v=>setEd(p=>({...p,name:v}))}/>
                <FI label="Set" value={ed.set} onChange={v=>setEd(p=>({...p,set:v}))}/>
                <FI label="Year" value={ed.year} onChange={v=>setEd(p=>({...p,year:v}))}/>
                <FI label="Market Value ($)" type="number" value={ed.value} onChange={v=>setEd(p=>({...p,value:parseFloat(v)||0}))}/>
                <FI label="My Value ($)" type="number" value={ed.userValue||""} onChange={v=>setEd(p=>({...p,userValue:parseFloat(v)||0}))} />
                <FS label="Condition" value={ed.condition} onChange={v=>setEd(p=>({...p,condition:v}))} options={CONDITIONS}/>
                <FS label="Type" value={ed.type} onChange={v=>setEd(p=>({...p,type:v}))} options={Object.keys(TYPE_COLORS)}/>
              </div>
              <FI label="Notes" value={ed.notes} onChange={v=>setEd(p=>({...p,notes:v}))}/>
              <FI label="Date Added" type="date" max={TODAY} value={ed.dateAdded||""} onChange={v=>setEd(p=>({...p,dateAdded:v}))}/>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={save} style={{flex:1,background:ACCENT,color:"#000",border:"none",borderRadius:10,padding:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14}}>Save</button>
                <button onClick={()=>{if(window.confirm("Remove this card?"))onDelete(card.id);}} style={{background:RED+"22",color:RED,border:`1px solid ${RED}44`,borderRadius:10,padding:"12px 16px",cursor:"pointer",fontSize:14}}>🗑️</button>
              </div>
            </div>
          ):(
            <div style={{background:SURFACE,borderRadius:14,padding:16,border:`1px solid ${BORDER}`}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["Type",card.type],["Condition",card.condition],["Rarity",card.rarity||"—"],["Year",card.year||"—"],["Set",card.set],["Number",card.number||"—"],["Graded By",card.gradingService||"Raw"],["Grade",card.gradingGrade||"—"],["Date Added",card.dateAdded||"—"]].map(([l,v])=>(
                  <div key={l} style={{background:SURFACE2,borderRadius:8,padding:"9px 11px"}}>
                    <div style={{fontSize:8,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:2}}>{l}</div>
                    <div style={{fontSize:12,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>
              {card.notes&&<div style={{background:SURFACE2,borderRadius:8,padding:"9px 11px",marginTop:8}}><div style={{fontSize:8,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:2}}>Notes</div><div style={{fontSize:12,color:TEXT1}}>{card.notes}</div></div>}
              {card.conditionNotes&&<div style={{background:SURFACE2,borderRadius:8,padding:"9px 11px",marginTop:8,border:`1px solid ${BORDER}`}}><div style={{fontSize:8,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:2}}>Condition Assessment</div><div style={{fontSize:12,color:TEXT2,fontStyle:"italic"}}>{card.conditionNotes}</div></div>}
            </div>
          )
        )}

        {tab==="tax"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:SURFACE,borderRadius:14,padding:16,border:`1px solid ${BORDER}`}}>
              <div style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:12}}>Cost Basis & P&L</div>
              {[["Purchase Price",fmt$(card.purchasePrice),TEXT2],["Grading Cost",fmt$(card.gradingCost),TEXT2],["Other Costs",fmt$(card.otherCosts),TEXT2],["─","─",TEXT3],["Total Basis",fmt$(cb),TEXT1],["Market Value",fmt$(card.sold?card.salePrice:card.value),ACCENT],["My Value",card.userValue>0?fmt$(card.userValue):"—",ACCENT],["API Cost",card.apiCost>0?`$${card.apiCost.toFixed(4)}`:"—",TEXT3],["Gain / Loss",(gl>=0?"+":"")+fmt$(gl),gl>=0?GREEN:RED]].map(([l,v,c],i)=>(
                <div key={l+i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:i<3?`1px solid ${BORDER}`:"none"}}>
                  <span style={{fontSize:12,color:TEXT2,fontFamily:"'DM Sans',sans-serif"}}>{l}</span>
                  <span style={{fontSize:12,color:c,fontFamily:"'DM Mono',monospace",fontWeight:i>=4?700:400}}>{v}</span>
                </div>
              ))}
              <div style={{background:SURFACE2,borderRadius:8,padding:"10px 12px",marginTop:8,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:12,color:TEXT2}}>Return %</span>
                <span style={{fontSize:14,fontWeight:800,color:gl>=0?GREEN:RED,fontFamily:"'DM Mono',monospace"}}>{gl>=0?"+":""}{gainPct(card)}%</span>
              </div>
            </div>
            <div style={{background:SURFACE,borderRadius:14,padding:16,border:`1px solid ${BORDER}`}}>
              <div style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:12}}>Purchase Details</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <FI label="Purchase Price ($)" type="number" value={ed.purchasePrice} onChange={v=>setEd(p=>({...p,purchasePrice:v}))}/>
                  <FI label="Date" type="date" max={TODAY} value={ed.purchaseDate} onChange={v=>setEd(p=>({...p,purchaseDate:v}))}/>
                </div>
                <FS label="Venue" value={ed.purchaseVenue} onChange={v=>setEd(p=>({...p,purchaseVenue:v}))} options={VENUES}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  <FS label="Grader" value={ed.gradingService} onChange={v=>setEd(p=>({...p,gradingService:v}))} options={GRADERS}/>
                  <FI label="Grade" value={ed.gradingGrade} onChange={v=>setEd(p=>({...p,gradingGrade:v}))}/>
                  <FI label="Grading Cost ($)" type="number" value={ed.gradingCost} onChange={v=>setEd(p=>({...p,gradingCost:v}))}/>
                </div>
                <FI label="Other Costs ($)" type="number" value={ed.otherCosts} onChange={v=>setEd(p=>({...p,otherCosts:v}))}/>
                <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                  <input type="checkbox" checked={!!ed.sold} onChange={e=>setEd(p=>({...p,sold:e.target.checked}))} style={{accentColor:ACCENT,width:16,height:16}}/>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:TEXT1}}>Mark as Sold</span>
                </label>
                {ed.sold&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <FI label="Sale Price ($)" type="number" value={ed.salePrice} onChange={v=>setEd(p=>({...p,salePrice:v}))}/>
                    <FI label="Sale Date" type="date" max={TODAY} value={ed.saleDate} onChange={v=>setEd(p=>({...p,saleDate:v}))}/>
                    <FS label="Sale Venue" value={ed.saleVenue} onChange={v=>setEd(p=>({...p,saleVenue:v}))} options={VENUES}/>
                  </div>
                )}
                <button onClick={save} style={{background:ACCENT,color:"#000",border:"none",borderRadius:10,padding:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:14}}>Save Transaction Data</button>
              </div>
            </div>
          </div>
        )}

        {tab==="market"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:SURFACE,borderRadius:14,padding:16,border:`1px solid ${BORDER}`}}>
              {[{n:"Search eBay Sold",u:card.ebayUrl||`https://ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name)}&LH_Sold=1`,ic:"🏷️"},{n:"TCGPlayer",u:`https://tcgplayer.com/search/all/product?q=${encodeURIComponent(card.name)}`,ic:"📊"},{n:"PSA Card Facts",u:`https://www.psacard.com/cardfacts/search#q/${encodeURIComponent(card.name)}`,ic:"🔍"},{n:"130Point Price Guide",u:`https://130point.com/sales/?set=${encodeURIComponent(card.set)}&card=${encodeURIComponent(card.name)}`,ic:"💹"}].map(l=>(
                <a key={l.n} href={l.u} target="_blank" rel="noreferrer"
                  style={{display:"flex",alignItems:"center",gap:12,padding:"11px",background:SURFACE2,borderRadius:10,textDecoration:"none",marginBottom:6,border:`1px solid ${BORDER}`}}>
                  <span style={{fontSize:18}}>{l.ic}</span>
                  <span style={{fontWeight:600,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:13,flex:1}}>{l.n}</span>
                  <span style={{color:TEXT3,fontSize:14}}>→</span>
                </a>
              ))}
            </div>
            <a href={`https://sell.ebay.com/sl/cross-border/flow?title=${encodeURIComponent(card.name+" "+card.set)}&price=${card.value}`} target="_blank" rel="noreferrer"
              style={{display:"block",background:BLUE,color:"#fff",borderRadius:12,padding:14,textAlign:"center",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15,textDecoration:"none"}}>
              🛒 List on eBay
            </a>
            <button onClick={()=>setShowSell(true)} style={{background:ACCENT+"22",color:ACCENT,border:`1px solid ${ACCENT}44`,borderRadius:12,padding:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:15,textDecoration:"none"}}>
              ✍️ Generate Sell Write-Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── MARKETPLACE ────────────────────────────────────────────────
function MarketplaceView({ cards, watchlist = [], removeFromWatchlist, apiKey }) {
  const [tab,setTab]=useState("buy");
  const [query,setQuery] = useState("");

  const SOURCES = [
    { id:"ebay_sold", name:"eBay Sold",   color:"#e53238", icon:"🏷️",  urlFn: q=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&LH_Sold=1&LH_Complete=1` },
    { id:"ebay_buy",  name:"eBay Buy",    color:"#e53238", icon:"🛒",   urlFn: q=>`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}` },
    { id:"tcg",       name:"TCGPlayer",   color:"#1a73e8", icon:"📊",   urlFn: q=>`https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(q)}` },
    { id:"130pt",     name:"130Point",    color:"#6c63ff", icon:"💹",   urlFn: q=>`https://130point.com/sales/?card=${encodeURIComponent(q)}` },
    { id:"psa",       name:"PSA",         color:"#d4a017", icon:"🔍",   urlFn: q=>`https://www.psacard.com/cardfacts/search#q/${encodeURIComponent(q)}` },
    { id:"pwcc",      name:"PWCC",        color:"#2ecc71", icon:"🏆",   urlFn: q=>`https://pwccmarketplace.com/search?query=${encodeURIComponent(q)}` },
    { id:"alt",       name:"Alt Mktpl",   color:"#e67e22", icon:"✨",   urlFn: q=>`https://www.alt.com/marketplace?q=${encodeURIComponent(q)}` },
    { id:"comc",      name:"COMC",        color:"#17a2b8", icon:"📦",   urlFn: q=>`https://www.comc.com/Cards/search?searchText=${encodeURIComponent(q)}` },
  ];

  return (
    <div style={{paddingBottom:90}}>
      <div style={{padding:"14px 14px 10px",borderBottom:`1px solid ${BORDER}`}}>
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:TEXT1,marginBottom:10}}>Marketplace</h2>
        <div style={{display:"flex",background:SURFACE,borderRadius:10,padding:3,border:`1px solid ${BORDER}`}}>
          {[["buy","Find Cards"],["watchlist","Watchlist"],["sell","List to Sell"],["listings","My Listings"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"8px 2px",border:"none",borderRadius:8,background:tab===v?SURFACE2:"transparent",color:tab===v?TEXT1:TEXT2,fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer",borderColor:tab===v?BORDER:"transparent",borderStyle:"solid",borderWidth:1,position:"relative"}}>
              {l}{v==="watchlist"&&watchlist.length>0&&<span style={{position:"absolute",top:2,right:2,background:ACCENT,color:"#000",borderRadius:"50%",width:14,height:14,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{watchlist.length}</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:14}}>

        {tab==="buy"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:SURFACE,borderRadius:14,padding:16,border:`1px solid ${BORDER}`}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:TEXT1,marginBottom:4}}>Find a Card</div>
              <p style={{color:TEXT2,fontSize:12,fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>Type a card name, then tap a source to search it — free, no API needed.</p>
              <input
                value={query}
                onChange={e=>setQuery(e.target.value)}
                placeholder="e.g. Charizard Base Set PSA 9"
                style={{width:"100%",background:SURFACE2,border:`2px solid ${query?ACCENT+"88":BORDER}`,borderRadius:10,padding:"11px 14px",fontSize:14,fontFamily:"'DM Sans',sans-serif",color:TEXT1,outline:"none",boxSizing:"border-box",marginBottom:14,transition:"border-color .2s"}}
              />
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {SOURCES.map(s=>(
                  <a
                    key={s.id}
                    href={s.urlFn(query.trim()||"trading cards")}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{display:"flex",alignItems:"center",gap:10,padding:"11px 12px",background:SURFACE2,borderRadius:10,textDecoration:"none",border:`1.5px solid ${BORDER}`,transition:"all .15s",opacity:query.trim()?1:0.55}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=s.color;e.currentTarget.style.background=s.color+"18";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.background=SURFACE2;}}>
                    <span style={{fontSize:20,flexShrink:0}}>{s.icon}</span>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:700,color:TEXT1,fontFamily:"'DM Sans',sans-serif"}}>{s.name}</div>
                      <div style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace",marginTop:1}}>opens in new tab →</div>
                    </div>
                  </a>
                ))}
              </div>
              {!query.trim()&&(
                <div style={{marginTop:12,fontSize:11,color:TEXT3,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>
                  Type a card name above to activate the search links
                </div>
              )}
            </div>
          </div>
        )}

        {tab==="sell"&&(
          <div>
            <div style={{background:SURFACE,borderRadius:14,padding:16,marginBottom:12,border:`1px solid ${BORDER}`}}>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:TEXT1,marginBottom:4}}>List on eBay</div>
              <p style={{color:TEXT2,fontSize:12,fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>Tap a card to open an eBay listing pre-filled with details and price.</p>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {cards.filter(c=>!c.sold).slice(0,6).map(card=>(
                  <div key={card.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px",background:SURFACE2,borderRadius:10,cursor:"pointer",border:`1px solid ${BORDER}`}}
                    onClick={()=>window.open(`https://sell.ebay.com/sl/cross-border/flow?title=${encodeURIComponent(card.name+" "+card.set)}&price=${card.value}`,"_blank","noopener")}>
                    <Thumb card={card} size={34}/>
                    <div style={{flex:1}}><div style={{fontWeight:700,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:12}}>{card.name}</div><div style={{fontSize:10,color:TEXT2}}>{card.condition} · {fmt$(card.value)}</div></div>
                    <span style={{fontSize:11,color:BLUE,fontWeight:600}}>List →</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:SURFACE,borderRadius:14,padding:16,border:`1px solid ${ACCENT}22`}}>
              <div style={{fontSize:11,color:ACCENT,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:10}}>Other Marketplaces</div>
              {[{n:"TCGPlayer",u:"https://tcgplayer.com/sell",d:"Pokémon & Magic"},{n:"PWCC",u:"https://pwccmarketplace.com",d:"Premium sports cards"},{n:"Whatnot",u:"https://whatnot.com",d:"Live selling auctions"},{n:"Goldin",u:"https://goldinauctions.com",d:"High-value consignment"}].map(m=>(
                <a key={m.n} href={m.u} target="_blank" rel="noopener noreferrer" style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:SURFACE2,padding:"10px 12px",borderRadius:9,textDecoration:"none",marginBottom:6,border:`1px solid ${BORDER}`}}>
                  <div><div style={{fontWeight:700,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>{m.n}</div><div style={{fontSize:10,color:TEXT2}}>{m.d}</div></div>
                  <span style={{color:TEXT3}}>→</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {tab==="watchlist"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {watchlist.length===0 ? (
              <div style={{textAlign:"center",padding:"60px 20px"}}>
                <div style={{fontSize:48,marginBottom:16}}>👀</div>
                <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:TEXT1,marginBottom:8}}>Nothing on Watch</div>
                <p style={{color:TEXT2,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Scan a card and tap "Add to Watchlist" to track prices without adding to your vault.</p>
              </div>
            ) : watchlist.map(card=>(
              <div key={card.id} style={{background:SURFACE,borderRadius:14,padding:14,border:`1px solid ${BORDER}`}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <Thumb card={card} size={48}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:TEXT1,fontSize:14,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{card.name}</div>
                    <div style={{fontSize:11,color:TEXT2,marginBottom:6}}>{card.set}{card.number?" · #"+card.number:""}{card.year?" · "+card.year:""}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:8}}>
                      {[{label:"Recent Sold",val:card.priceMostRecentSold,hi:true},{label:"Avg 10 Sold",val:card.priceAvg10Sold,hi:false},{label:"Avg Listed",val:card.priceAvg10List,hi:false}].map(({label,val,hi})=>(
                        <div key={label} style={{background:hi?ACCENT+"12":SURFACE2,borderRadius:6,padding:"5px 4px",border:`1px solid ${hi?ACCENT+"33":BORDER}`,textAlign:"center"}}>
                          <div style={{fontSize:7,color:hi?ACCENT:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:2,lineHeight:1.2}}>{label}</div>
                          <div style={{fontSize:12,fontWeight:800,color:hi?ACCENT:TEXT1,fontFamily:"'DM Mono',monospace"}}>{val>0?fmt$(val):<span style={{color:TEXT3,fontWeight:400,fontSize:10}}>—</span>}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <a href={`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(card.name+" "+card.set)}&LH_Sold=1`} target="_blank" rel="noopener noreferrer"
                        style={{flex:1,background:BLUE+"15",color:BLUE,border:`1px solid ${BLUE}33`,borderRadius:8,padding:"6px",fontSize:11,fontWeight:700,textAlign:"center",textDecoration:"none",fontFamily:"'DM Sans',sans-serif"}}>
                        eBay ↗
                      </a>
                      <button onClick={()=>removeFromWatchlist(card.id)}
                        style={{background:"transparent",color:RED,border:`1px solid ${RED}33`,borderRadius:8,padding:"6px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                <div style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace",marginTop:8,textAlign:"right"}}>Added {card.watchedAt}</div>
              </div>
            ))}
          </div>
        )}

        {tab==="listings"&&(
          <div style={{background:SURFACE,borderRadius:14,padding:16,border:`1px solid ${BORDER}`}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:TEXT1,marginBottom:12}}>My Active Listings</div>
            {cards.filter(c=>!c.sold).slice(0,4).map(card=>(
              <div key={card.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px",background:SURFACE2,borderRadius:10,marginBottom:6,border:`1px solid ${BORDER}`}}>
                <Thumb card={card} size={38}/>
                <div style={{flex:1}}><div style={{fontWeight:700,color:TEXT1,fontFamily:"'DM Sans',sans-serif",fontSize:13}}>{card.name}</div><div style={{fontSize:10,color:TEXT2}}>{fmt$(card.value)} · {card.condition}</div></div>
                <a href={card.ebayUrl||"https://ebay.com"} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:BLUE,fontWeight:600,textDecoration:"none"}}>View →</a>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ── ANALYTICS ──────────────────────────────────────────────────
function AnalyticsView({ cards, fetching, onRefreshAll }) {
  const active=cards.filter(c=>!c.sold), sold=cards.filter(c=>c.sold);
  const tv=active.reduce((s,c)=>s+c.value,0), tc=cards.reduce((s,c)=>s+costBasis(c),0);
  const ug=active.reduce((s,c)=>s+gainLoss(c),0), rg=sold.reduce((s,c)=>s+gainLoss(c),0);
  const stGain=sold.filter(c=>c.purchaseDate&&c.saleDate&&(new Date(c.saleDate)-new Date(c.purchaseDate))/86400000<=365).reduce((s,c)=>s+gainLoss(c),0);
  const ltGain=sold.filter(c=>!c.purchaseDate||!c.saleDate||(new Date(c.saleDate)-new Date(c.purchaseDate))/86400000>365).reduce((s,c)=>s+gainLoss(c),0);
  const byType=Object.entries(active.reduce((a,c)=>{a[c.type]=(a[c.type]||0)+c.value;return a;},{})).sort((a,b)=>b[1]-a[1]);
  const months=cards[0]?.priceHistory?.map(p=>p.month)||[];
  const ph=months.map((m,i)=>({month:m,value:active.reduce((s,c)=>s+(c.priceHistory?.[i]?.value||c.value),0)}));

  const S=({l,v,s,c=TEXT1})=>(
    <div style={{background:SURFACE,borderRadius:12,padding:"14px 12px",border:`1px solid ${BORDER}`}}>
      <div style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:4}}>{l}</div>
      <div style={{fontSize:18,fontWeight:800,color:c,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{v}</div>
      {s&&<div style={{fontSize:10,color:TEXT3,marginTop:4}}>{s}</div>}
    </div>
  );

  return (
    <div style={{paddingBottom:90}}>
      <div style={{padding:"14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <h2 style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:TEXT1}}>Analytics</h2>
        <button onClick={onRefreshAll} disabled={fetching} style={{background:ACCENT+"22",color:ACCENT,border:`1px solid ${ACCENT}44`,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:700}}>
          {fetching?"…":"↻ Refresh"}
        </button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
        <S l="Portfolio" v={fmt$k(tv)} s={`${active.length} cards`}/>
        <S l="Unrealized" v={(ug>=0?"+":"")+fmt$k(ug)} s={`${tc>0?((ug/tc)*100).toFixed(1):0}% return`} c={ug>=0?GREEN:RED}/>
        <S l="Realized" v={(rg>=0?"+":"")+fmt$k(rg)} s={`${sold.length} sold`} c={rg>=0?GREEN:RED}/>
        <S l="Cost Basis" v={fmt$k(tc)} c={TEXT2}/>
      </div>

      <div style={{background:SURFACE,borderRadius:14,padding:"14px 12px 8px",marginBottom:14,border:`1px solid ${BORDER}`}}>
        <div style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:8}}>Portfolio Over Time</div>
        <ResponsiveContainer width="100%" height={130}>
          <AreaChart data={ph} margin={{top:4,right:4,left:0,bottom:0}}>
            <defs><linearGradient id="pgv2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ACCENT} stopOpacity={0.2}/><stop offset="100%" stopColor={ACCENT} stopOpacity={0}/></linearGradient></defs>
            <Area type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} fill="url(#pgv2)" dot={{fill:ACCENT,r:2}}/>
            <XAxis dataKey="month" tick={{fill:TEXT3,fontSize:9,fontFamily:"'DM Mono',monospace"}} axisLine={false} tickLine={false}/>
            <YAxis width={36} tick={{fill:TEXT3,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
            <Tooltip contentStyle={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,fontFamily:"'DM Mono',monospace",fontSize:10,color:TEXT1}} formatter={v=>[fmt$(v),"Value"]}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{background:SURFACE,borderRadius:14,padding:16,marginBottom:14,border:`1px solid ${ACCENT}22`}}>
        <div style={{fontSize:11,color:ACCENT,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:10}}>Tax Summary (reference only)</div>
        {[["Short-term gains (≤1yr)",fmt$k(stGain),stGain>=0?GREEN:RED],["Long-term gains (>1yr)",fmt$k(ltGain),ltGain>=0?GREEN:RED],["Total realized",fmt$k(rg),rg>=0?GREEN:RED]].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${BORDER}`}}>
            <span style={{fontSize:12,color:TEXT2,fontFamily:"'DM Sans',sans-serif"}}>{l}</span>
            <span style={{fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:700,color:c}}>{v}</span>
          </div>
        ))}
        <p style={{fontSize:10,color:TEXT3,marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>⚠️ Consult a tax professional for actual tax advice.</p>
      </div>

      {byType.length>0&&(
        <div style={{background:SURFACE,borderRadius:14,padding:16,marginBottom:14,border:`1px solid ${BORDER}`}}>
          <div style={{fontSize:11,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:12}}>Allocation</div>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <PieChart width={100} height={100}>
              <Pie data={byType.map(([n,v])=>({name:n,value:v}))} cx={50} cy={50} innerRadius={28} outerRadius={46} dataKey="value" paddingAngle={3}>
                {byType.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]}/>)}
              </Pie>
            </PieChart>
            <div style={{flex:1,minWidth:0}}>
              {byType.map(([type,val],i)=>(
                <div key={type} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:7,height:7,borderRadius:2,background:CHART_COLORS[i%CHART_COLORS.length]}}/><span style={{fontSize:11,color:TEXT1,fontFamily:"'DM Sans',sans-serif"}}>{type}</span></div>
                  <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:700,color:TEXT1}}>{fmt$k(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{background:SURFACE,borderRadius:14,padding:"14px 12px 8px",border:`1px solid ${BORDER}`}}>
        <div style={{fontSize:9,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:8}}>Gain / Loss by Card</div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={cards.map(c=>({name:c.name.length>7?c.name.slice(0,6)+"…":c.name,gain:gainLoss(c)}))} margin={{top:4,right:4,left:0,bottom:0}}>
            <XAxis dataKey="name" tick={{fill:TEXT3,fontSize:8}} axisLine={false} tickLine={false}/>
            <YAxis width={36} tick={{fill:TEXT3,fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>fmt$k(v)}/>
            <Tooltip contentStyle={{background:SURFACE2,border:`1px solid ${BORDER}`,borderRadius:8,fontFamily:"'DM Mono',monospace",fontSize:10,color:TEXT1}} formatter={v=>[fmt$(v),"G/L"]}/>
            <Bar dataKey="gain" radius={[3,3,0,0]}>{cards.map((c,i)=><Cell key={i} fill={gainLoss(c)>=0?GREEN:RED}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      </div>
    </div>
  );
}

// ── THEME TOKENS (computed from darkMode flag) ─────────────────
function makeTheme(dark) {
  return {
    BG:      dark ? "#0A0A0A" : "#F5F5F0",
    SURFACE: dark ? "#111111" : "#FFFFFF",
    SURF2:   dark ? "#1A1A1A" : "#F0EFE8",
    BORDER:  dark ? "#2A2A2A" : "#DDDBD2",
    TEXT1:   dark ? "#F0F0F0" : "#111111",
    TEXT2:   dark ? "#888888" : "#555555",
    TEXT3:   dark ? "#444444" : "#AAAAAA",
    ACCENT:  dark ? "#E8C547" : "#C9930A",
    GREEN:   dark ? "#4ADE80" : "#16A34A",
    RED:     dark ? "#F87171" : "#DC2626",
    BLUE:    dark ? "#60A5FA" : "#2563EB",
    dark,
  };
}

// ── PROFILE PANEL ──────────────────────────────────────────────
function ProfilePanel({ user, communityCount, onClose, onLogout, darkMode, theme, apiKey, setApiKey, driveStatus, onSetupDrive }) {
  const { BG:TBG, SURFACE:TSURF, SURF2:TSURF2, BORDER:TBORDER, TEXT1:TT1, TEXT2:TT2, TEXT3:TT3, ACCENT:TACC, GREEN:TGREEN } = theme;
  const joined = user.joinedDate ? new Date(user.joinedDate) : new Date();
  const joinedStr = joined.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysAgo = Math.floor((Date.now() - joined.getTime()) / (1000*60*60*24));
  const memberLabel = daysAgo === 0 ? "Joined today" : daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
  const [showKey, setShowKey] = useState(false);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:90,background:"rgba(0,0,0,0.45)"}}/>
      {/* Panel */}
      <div style={{position:"fixed",top:0,right:0,height:"100%",width:300,zIndex:100,
        background:TSURF,borderLeft:`1px solid ${TBORDER}`,display:"flex",flexDirection:"column",
        boxShadow:"-8px 0 40px rgba(0,0,0,0.4)",animation:"slideInRight .22s ease"}}>
        <style>{`@keyframes slideInRight{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}`}</style>

        {/* Header */}
        <div style={{padding:"22px 20px 18px",borderBottom:`1px solid ${TBORDER}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <span style={{fontFamily:"'Fredoka One',cursive",fontSize:17,color:TT1}}>Profile</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:TT3,padding:4}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{flex:1,overflowY:"auto",paddingBottom:"env(safe-area-inset-bottom,16px)"}}>

        {/* Avatar + name */}
        <div style={{padding:"24px 20px 20px",borderBottom:`1px solid ${TBORDER}`,display:"flex",flexDirection:"column",alignItems:"center",gap:12,textAlign:"center"}}>
          {user.avatar
            ?<img src={user.avatar} alt="" style={{width:72,height:72,borderRadius:"50%",border:`3px solid ${TACC}`}}/>
            :<div style={{width:72,height:72,borderRadius:"50%",background:TACC,display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontSize:26,fontWeight:700}}>{user.name?.[0]}</div>
          }
          <div>
            <div style={{fontSize:18,fontWeight:700,color:TT1,marginBottom:3}}>{user.name}</div>
            {user.email&&<div style={{fontSize:12,color:TT2,fontFamily:"'DM Mono',monospace"}}>{user.email}</div>}
            <div style={{display:"inline-flex",alignItems:"center",gap:5,marginTop:6,background:TACC+"18",border:`1px solid ${TACC}44`,borderRadius:20,padding:"3px 10px"}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={TACC} strokeWidth="2.5" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span style={{fontSize:11,color:TACC,fontWeight:700,fontFamily:"'DM Mono',monospace",textTransform:"capitalize"}}>{user.type || "member"}</span>
            </div>
          </div>
        </div>

        {/* Stats rows */}
        <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:2,borderBottom:`1px solid ${TBORDER}`}}>
          <div style={{fontSize:10,color:TT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>Account</div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:TSURF2,borderRadius:10,marginBottom:6}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TT3} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{fontSize:13,color:TT2}}>Member since</span>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:13,fontWeight:600,color:TT1}}>{joinedStr}</div>
              <div style={{fontSize:11,color:TT3}}>{memberLabel}</div>
            </div>
          </div>

          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",background:TSURF2,borderRadius:10}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={TT3} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span style={{fontSize:13,color:TT2}}>Community</span>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:14,fontWeight:700,color:TACC}}>{communityCount.toLocaleString()}</div>
              <div style={{fontSize:11,color:TT3}}>collectors</div>
            </div>
          </div>
        </div>

        {/* Google Drive Sync */}
        {user.type==="google" && (
          <div style={{padding:"16px 20px 0"}}>
            <div style={{background:TSURF2,borderRadius:10,padding:"10px 14px",border:`1px solid ${driveStatus==="synced"?TGREEN+"44":TBORDER}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:15}}>☁️</span>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:driveStatus==="synced"?TGREEN:TT2,fontFamily:"'DM Sans',sans-serif"}}>
                    {driveStatus==="synced"?"Drive Synced":driveStatus==="loading"?"Loading…":driveStatus==="error"?"Drive Error — tap to retry":"Drive Not Set Up"}
                  </div>
                  <div style={{fontSize:10,color:TT3,fontFamily:"'DM Mono',monospace"}}>_carddeli/ folder</div>
                </div>
              </div>
              {driveStatus!=="synced" && (
                <button onClick={onSetupDrive} style={{background:TACC,color:"#000",border:"none",borderRadius:7,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                  Set up
                </button>
              )}
            </div>
          </div>
        )}

        {/* API Key */}
        <div style={{padding:"16px 20px 0"}}>
          <button onClick={()=>setShowKey(s=>!s)}
            style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:TSURF2,border:`1px solid ${apiKey?TACC+"55":TBORDER}`,borderRadius:10,padding:"10px 14px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:apiKey?TACC:TT2}}>
            <span style={{display:"flex",alignItems:"center",gap:7}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              API Key {apiKey?"✓":"(not set)"}
            </span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform:showKey?"rotate(180deg)":"none",transition:"transform .2s"}}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {showKey&&(
            <div style={{marginTop:8,position:"relative"}}>
              <input type="password" placeholder="sk-ant-..." value={apiKey} onChange={e=>setApiKey(e.target.value.trim())}
                style={{width:"100%",background:TSURF2,border:`1px solid ${apiKey?TACC+"66":TBORDER}`,borderRadius:8,padding:"9px 30px 9px 10px",fontSize:12,fontFamily:"'DM Mono',monospace",color:TT1,outline:"none",boxSizing:"border-box"}}/>
              {apiKey&&<button onClick={()=>setApiKey("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:TT3,fontSize:16,lineHeight:1,padding:0}}>×</button>}
            </div>
          )}
        </div>

        {/* Sign out */}
        <div style={{padding:"16px 20px 20px"}}>
          <button onClick={onLogout}
            style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:9,
              padding:"12px",borderRadius:12,border:`1px solid ${TBORDER}`,background:"transparent",
              color:TT2,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,
              transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background="#EF444422";e.currentTarget.style.color="#F87171";e.currentTarget.style.borderColor="#F8717155";}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=TT2;e.currentTarget.style.borderColor=TBORDER;}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>

        </div>{/* end scrollable body */}
      </div>
    </>
  );
}

// ── MERCH MODAL ────────────────────────────────────────────────
function MerchModal({ onClose, theme }) {
  const { SURFACE, SURFACE2, BORDER, TEXT1, TEXT2, TEXT3, ACCENT, GREEN, BLUE, RED } = theme;

  const PRODUCTS = [
    {
      id:"tshirt", emoji:"👕", name:"The Card Deli T-Shirt",
      desc:"Soft unisex tee with the Card Deli logo. Available in black and white.",
      price:"$28", status:"coming_soon",
      platform:"Printful + Etsy", tag:"Apparel",
    },
    {
      id:"hat", emoji:"🧢", name:"The Card Deli Snapback",
      desc:"Structured snapback hat with embroidered logo. One size fits most.",
      price:"$32", status:"coming_soon",
      platform:"Printful + Etsy", tag:"Apparel",
    },
    {
      id:"stand", emoji:"🖼️", name:"3D Printed Card Stand",
      desc:"Custom single-card display stand, fits standard & graded slabs. Printed in your choice of colour.",
      price:"$12", status:"coming_soon",
      platform:"Etsy", tag:"3D Print",
    },
    {
      id:"border", emoji:"✨", name:"3D Printed Card Border Frame",
      desc:"Decorative display border/frame for slabs and raw cards. Multiple finishes available.",
      price:"$18", status:"coming_soon",
      platform:"Etsy", tag:"3D Print",
    },
  ];

  const tagColor = t => t==="Apparel" ? BLUE : t==="3D Print" ? GREEN : ACCENT;

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:2000,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0"}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:SURFACE,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:600,maxHeight:"90vh",overflow:"auto",border:`1px solid ${BORDER}`,borderBottom:"none",animation:"fadeUp .25s ease"}}>

        {/* Header */}
        <div style={{position:"sticky",top:0,background:SURFACE,borderBottom:`1px solid ${BORDER}`,padding:"18px 20px 14px",zIndex:1,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <img src={LOGO_SRC} alt="" style={{width:36,height:36,objectFit:"contain"}}/>
            <div>
              <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:TEXT1,lineHeight:1}}>The Card Deli Shop</div>
              <div style={{fontSize:11,color:TEXT2,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>Merch, 3D prints & more</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${BORDER}`,color:TEXT2,borderRadius:8,width:32,height:32,cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        <div style={{padding:"16px 16px 32px"}}>

          {/* Coming soon banner */}
          <div style={{background:`linear-gradient(135deg,${ACCENT}22,${BLUE}18)`,border:`1px solid ${ACCENT}44`,borderRadius:12,padding:"12px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>🚧</span>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:ACCENT,fontFamily:"'DM Sans',sans-serif"}}>Opening Soon!</div>
              <div style={{fontSize:11,color:TEXT2,fontFamily:"'DM Sans',sans-serif"}}>Drop your email below to get notified when the shop goes live.</div>
            </div>
          </div>

          {/* Products */}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {PRODUCTS.map(p=>(
              <div key={p.id} style={{background:SURFACE2,borderRadius:14,padding:"14px 16px",border:`1px solid ${BORDER}`,display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{fontSize:36,flexShrink:0,lineHeight:1,marginTop:2}}>{p.emoji}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:700,color:TEXT1,fontSize:14}}>{p.name}</span>
                    <span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:tagColor(p.tag)+"22",color:tagColor(p.tag),fontFamily:"'DM Mono',monospace",fontWeight:700,border:`1px solid ${tagColor(p.tag)}44`}}>{p.tag}</span>
                  </div>
                  <div style={{fontSize:12,color:TEXT2,fontFamily:"'DM Sans',sans-serif",marginBottom:6,lineHeight:1.5}}>{p.desc}</div>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:15,fontWeight:800,color:ACCENT,fontFamily:"'DM Mono',monospace"}}>{p.price}</span>
                    <span style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace"}}>via {p.platform}</span>
                    <span style={{marginLeft:"auto",fontSize:10,padding:"3px 9px",borderRadius:20,background:SURFACE,border:`1px solid ${BORDER}`,color:TEXT3,fontFamily:"'DM Mono',monospace"}}>Coming Soon</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notify me */}
          <div style={{background:SURFACE2,borderRadius:14,padding:16,border:`1px solid ${BORDER}`,marginBottom:16}}>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:15,color:TEXT1,marginBottom:4}}>Get Notified</div>
            <div style={{fontSize:12,color:TEXT2,fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>Be first to know when the shop opens. No spam, just a single launch email.</div>
            <div style={{display:"flex",gap:8}}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{flex:1,background:SURFACE,border:`1px solid ${BORDER}`,borderRadius:9,padding:"10px 13px",fontSize:13,fontFamily:"'DM Sans',sans-serif",color:TEXT1,outline:"none",boxSizing:"border-box"}}
              />
              <button
                onClick={e=>{const inp=e.currentTarget.previousSibling;if(inp.value.includes("@")){inp.disabled=true;e.currentTarget.textContent="✓ Done";e.currentTarget.style.background=GREEN;e.currentTarget.disabled=true;}}}
                style={{background:ACCENT,color:"#000",border:"none",borderRadius:9,padding:"10px 18px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:13,flexShrink:0}}>
                Notify Me
              </button>
            </div>
            <div style={{fontSize:10,color:TEXT3,fontFamily:"'DM Sans',sans-serif",marginTop:8}}>
              💡 Want a custom colour on the 3D prints? Reply to the launch email with your preference.
            </div>
          </div>

          {/* How we'll sell */}
          <div style={{background:SURFACE2,borderRadius:14,padding:14,border:`1px solid ${BORDER}`}}>
            <div style={{fontSize:10,color:TEXT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",marginBottom:10}}>Where to find us</div>
            {[
              {icon:"🛍️", name:"Etsy", desc:"3D printed stands, borders & handmade items", url:"https://etsy.com"},
              {icon:"👕", name:"Printful / Etsy", desc:"T-shirts & hats — printed on demand, ships worldwide", url:"https://etsy.com"},
            ].map(s=>(
              <div key={s.name} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${BORDER}`}}>
                <span style={{fontSize:18}}>{s.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:700,color:TEXT1,fontFamily:"'DM Sans',sans-serif"}}>{s.name}</div>
                  <div style={{fontSize:10,color:TEXT2,fontFamily:"'DM Sans',sans-serif"}}>{s.desc}</div>
                </div>
              </div>
            ))}
            <div style={{fontSize:11,color:TEXT2,fontFamily:"'DM Sans',sans-serif",marginTop:10,lineHeight:1.6}}>
              Want to suggest a product or give feedback? Tap the 🔑 profile icon and reach out.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────────
class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(e) { return { hasError: true, error: e }; }
  componentDidCatch(e, info) { console.error("App crashed:", e, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:"100vh",background:"#0A0A0A",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:"'DM Sans',sans-serif",color:"#fff",gap:16}}>
          <div style={{fontSize:40}}>⚠️</div>
          <div style={{fontSize:18,fontWeight:700}}>Something went wrong</div>
          <div style={{fontSize:12,color:"#aaa",maxWidth:400,textAlign:"center"}}>{this.state.error?.message || "Unknown error"}</div>
          <button onClick={()=>{ localStorage.removeItem("_carddeli_drive_ids"); window.location.reload(); }}
            style={{background:"#FF6B35",color:"#000",border:"none",borderRadius:8,padding:"10px 20px",cursor:"pointer",fontWeight:700,fontSize:14}}>
            Clear Cache &amp; Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
function AppInner() {
  const [user, setUser] = useState(null);

  // Restore session on refresh — demo/guest survive as-is; Google re-authenticates silently
  useEffect(() => {
    try {
      const saved = localStorage.getItem("_carddeli_session");
      if (saved) {
        const u = JSON.parse(saved);
        // Demo session: restore fully (no token needed)
        if (u.type === "demo") {
          setUser(u);
          setCards(SAMPLE_CARDS);
        }
        // Google session: restore profile so we don't flash the login screen,
        // then silently re-auth via prompt:"none" to get a fresh token
        if (u.type === "google") {
          setUser({ ...u, accessToken: null }); // show app immediately, token comes shortly
          // Attempt silent token refresh
          const tryRefresh = () => {
            const CLIENT_ID = import.meta?.env?.VITE_GOOGLE_CLIENT_ID || "";
            if (!CLIENT_ID || !window.google?.accounts?.oauth2) {
              setTimeout(tryRefresh, 600);
              return;
            }
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: CLIENT_ID,
              scope: ["https://www.googleapis.com/auth/drive","https://www.googleapis.com/auth/userinfo.profile","https://www.googleapis.com/auth/userinfo.email"].join(" "),
              hint: u.email,
              callback: async (tokenResponse) => {
                if (tokenResponse.error) return; // silent fail — user will see stale data, can log out and back in
                setUser(prev => prev ? { ...prev, accessToken: tokenResponse.access_token } : prev);
                // Trigger Drive load now that we have a token
                handleLogin({ ...u, accessToken: tokenResponse.access_token }, true);
              },
              error_callback: () => {} // silent
            });
            client.requestAccessToken({ prompt: "" }); // no prompt = silent
          };
          setTimeout(tryRefresh, 400);
        }
      }
    } catch(e) {}
  }, []); // eslint-disable-line
  const [apiKey, setApiKey] = useState("");

  // Persist API key to localStorage whenever it changes (Drive sync happens via saveToDrive on next card update)
  useEffect(() => {
    if (!user || user.type !== "google") return;
    const k = `apikey_${user.email || user.name}`;
    try {
      if (apiKey) localStorage.setItem(k, apiKey.trim());
      else localStorage.removeItem(k);
    } catch(e) {}
  }, [apiKey, user]);
  const [cards, setCards] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [showMerch, setShowMerch] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [page, setPage] = useState("home");
  const [selectedCard, setSelectedCard] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [notif, setNotif] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const lastScrollY = useRef(0);
  const contentRef = useRef(null);
  const COMMUNITY_COUNT = 4821;

  // Capture the browser's install prompt event (Chrome/Android)
  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // Don't show if user already dismissed
    try { if (localStorage.getItem("_carddeli_install_dismissed")) return; } catch(e) {}
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Google Drive sync state
  const [driveToken, setDriveToken]       = useState(null);
  const [driveFolderId, setDriveFolderId] = useState(null);
  const [drivePicsId, setDrivePicsId]     = useState(null);
  const [driveFileId, setDriveFileId]     = useState(null);
  const [showDriveSetup, setShowDriveSetup] = useState(false);
  const [driveStatus, setDriveStatus]     = useState("none");
  const driveRef = useRef({ folderId:null, picsFolderId:null, fileId:null, token:null });

  const saveToDrive = async (newCards, newWatchlist) => {
    const { token, folderId, fileId } = driveRef.current;
    if (!token || !folderId || !fileId) return;
    // Strip any base64 blobs — only keep URL references (lh3 URLs are fine in JSON)
    const cardsToSave = (newCards ?? cards).map(c => {
      let s = { ...c };
      if (s.thumbnail    && s.thumbnail.startsWith("data:"))     s.thumbnail = null;
      if (s.thumbnailBack && s.thumbnailBack.startsWith("data:")) s.thumbnailBack = null;
      if (s.driveThumb   && s.driveThumb.startsWith("data:"))    s.driveThumb = null;
      if (s.driveThumbBack && s.driveThumbBack.startsWith("data:")) s.driveThumbBack = null;
      return s;
    });
    await GDrive.save(token, fileId, folderId, cardsToSave, newWatchlist ?? watchlist);
  };

  useEffect(() => {
    document.title = "The Card Deli";
    const existingLink = document.querySelector("link[rel*='icon']");
    const link = existingLink || document.createElement("link");
    link.type = "image/png"; link.rel = "shortcut icon"; link.href = LOGO_SRC;
    if (!existingLink) document.head.appendChild(link);
  }, []);

  const handleContentScroll = (e) => {
    if (page === "scan") return;
    const curr = e.target.scrollTop;
    const diff = curr - lastScrollY.current;
    if (diff > 8) setNavVisible(false);
    else if (diff < -5) setNavVisible(true);
    lastScrollY.current = curr;
  };

  const handleLogin = async (u, silent = false) => {
    setUser(u);
    // Persist session so refresh doesn't log out
    try {
      const toSave = { name: u.name, email: u.email, avatar: u.avatar, type: u.type, joinedDate: u.joinedDate };
      localStorage.setItem("_carddeli_session", JSON.stringify(toSave));
    } catch(e) {}
    if (u.type === "demo") { if (!silent) setCards(SAMPLE_CARDS); return; }
    if (u.type === "google" && u.accessToken) {
      driveRef.current.token = u.accessToken;
      setDriveStatus("loading");
      try {
        const result = await GDrive.load(u.accessToken);
        if (result.found) {
          // Wire up drive refs
          driveRef.current = { token: u.accessToken, folderId: result.folderId, picsFolderId: result.picsFolderId, fileId: result.fileId };
          setDriveFolderId(result.folderId); setDrivePicsId(result.picsFolderId); setDriveFileId(result.fileId);

          // API key — Drive is authoritative across devices, localStorage is fallback
          const driveKey = (result.apiKey || "").trim();
          const localKey = (localStorage.getItem(`apikey_${u.email || u.name}`) || "").trim();
          const restoredKey = driveKey || localKey;
          if (restoredKey) {
            setApiKey(restoredKey);
            try { localStorage.setItem(`apikey_${u.email || u.name}`, restoredKey); } catch(e) {}
          }

          // Cards — safely hydrate with thumbnails from localStorage
          const rawCards = Array.isArray(result.data?.cards) ? result.data.cards : [];
          const cardsWithThumbs = rawCards.map(c => {
            if (!c || typeof c !== "object") return null;
            let updated = { ...c };
            // Try localStorage first (same device, fast)
            if (!updated.thumbnail) { try { const s = localStorage.getItem(`thumb_${c.id}`); if (s) updated.thumbnail = s; } catch(e) {} }
            if (!updated.thumbnailBack) { try { const s = localStorage.getItem(`thumb_back_${c.id}`); if (s) updated.thumbnailBack = s; } catch(e) {} }
            // Fall back to Drive URLs (cross-device)
            if (!updated.thumbnail && updated.driveThumb) updated.thumbnail = updated.driveThumb;
            if (!updated.thumbnailBack && updated.driveThumbBack) updated.thumbnailBack = updated.driveThumbBack;
            return updated;
          }).filter(Boolean);
          setCards(cardsWithThumbs);
          setWatchlist(Array.isArray(result.data?.watchlist) ? result.data.watchlist : []);
          setDriveStatus("synced");

          // Backfill: upload images to _carddeli_pics/ for cards missing an lh3 driveThumb URL
          const { token: t, picsFolderId: pf } = { token: u.accessToken, picsFolderId: result.picsFolderId };
          if (t && pf) {
            setTimeout(async () => {
              let anyUpdated = false;
              const updated = await Promise.all(rawCards.map(async c => {
                if (!c) return c;
                let card = { ...c };
                // Needs upload if: no driveThumb, OR driveThumb is still base64 (old format)
                const needsFront = !card.driveThumb || card.driveThumb.startsWith("data:");
                const needsBack  = !card.driveThumbBack || card.driveThumbBack.startsWith("data:");
                if (needsFront) {
                  const local = (() => { try { return localStorage.getItem(`thumb_${c.id}`); } catch(e) { return null; } })();
                  const src = local && local.startsWith("data:") ? local : (card.driveThumb && card.driveThumb.startsWith("data:") ? card.driveThumb : null);
                  if (src) {
                    try { const url = await GDrive.uploadImage(t, c.id, src, pf, ""); if (url.startsWith("http")) { card.driveThumb = url; anyUpdated = true; } } catch(e) {}
                  }
                }
                if (needsBack) {
                  const local = (() => { try { return localStorage.getItem(`thumb_back_${c.id}`); } catch(e) { return null; } })();
                  const src = local && local.startsWith("data:") ? local : (card.driveThumbBack && card.driveThumbBack.startsWith("data:") ? card.driveThumbBack : null);
                  if (src) {
                    try { const url = await GDrive.uploadImage(t, c.id, src, pf, "_back"); if (url.startsWith("http")) { card.driveThumbBack = url; anyUpdated = true; } } catch(e) {}
                  }
                }
                return card;
              }));
              if (anyUpdated) {
                setCards(p => {
                  const merged = p.map(pc => {
                    const u = updated.find(x => x && x.id === pc.id);
                    return u ? { ...pc, driveThumb: u.driveThumb || pc.driveThumb, driveThumbBack: u.driveThumbBack || pc.driveThumbBack } : pc;
                  });
                  saveToDrive(merged, undefined);
                  return merged;
                });
              }
            }, 1500);
          }
        } else {
          // load() failed (network error etc) — don't show setup, just mark as unsynced
          driveRef.current = { token: u.accessToken, folderId: result.folderId || null, picsFolderId: result.picsFolderId || null, fileId: null };
          console.warn("Drive load returned found:false —", result.error);
          setDriveStatus("error");
        }
      } catch(e) {
        console.warn("Drive load threw:", e);
        setDriveStatus("error");
      }
    }
  };

  const handleDriveSetup = async () => {
    const token = driveRef.current.token;
    if (!token) throw new Error("No access token — please sign in with Google again.");
    const result = await GDrive.setup(token);
    driveRef.current = { token, folderId: result.folderId, picsFolderId: result.picsFolderId, fileId: result.fileId };
    setDriveFolderId(result.folderId); setDrivePicsId(result.picsFolderId); setDriveFileId(result.fileId);
    // Load whatever data is already in the file (may have cards from before)
    try {
      const data = await GDrive.readFile(token, result.fileId);
      const rawCards = Array.isArray(data?.cards) ? data.cards : [];
      const cardsWithThumbs = rawCards.map(c => {
        if (!c || typeof c !== "object") return null;
        let updated = { ...c };
        if (!updated.thumbnail) { try { const s = localStorage.getItem(`thumb_${c.id}`); if (s) updated.thumbnail = s; } catch(e) {} }
        if (!updated.thumbnailBack) { try { const s = localStorage.getItem(`thumb_back_${c.id}`); if (s) updated.thumbnailBack = s; } catch(e) {} }
        if (!updated.thumbnail && updated.driveThumb) updated.thumbnail = updated.driveThumb;
        if (!updated.thumbnailBack && updated.driveThumbBack) updated.thumbnailBack = updated.driveThumbBack;
        return updated;
      }).filter(Boolean);
      if (cardsWithThumbs.length > 0) setCards(cardsWithThumbs);
      const rawWatchlist = Array.isArray(data?.watchlist) ? data.watchlist : [];
      if (rawWatchlist.length > 0) setWatchlist(rawWatchlist);
    } catch(e) { console.warn("Could not load existing data after setup:", e); }
    setDriveStatus("synced");
    setTimeout(() => setShowDriveSetup(false), 1400);
  };

  const uploadCardImage = async (cardId, dataUrl, suffix = "") => {
    const { token, picsFolderId } = driveRef.current;
    if (!token || !picsFolderId || !dataUrl) return dataUrl;
    try {
      return await GDrive.uploadImage(token, cardId, dataUrl, picsFolderId, suffix);
    } catch(e) { return dataUrl; }
  };
  const toast = (msg, err) => { setNotif({msg,err}); setTimeout(()=>setNotif(null),3000); };
  const { confirm: confirmCost, modal: costModal } = useCostConfirm();

  const addCard = async (card) => {
    const c = { ...card };
    // Save full-res to localStorage for instant local display
    if (c.thumbnail    && c.thumbnail.startsWith("data:"))    { try { localStorage.setItem(`thumb_${c.id}`, c.thumbnail); } catch(e) {} }
    if (c.thumbnailBack && c.thumbnailBack.startsWith("data:")){ try { localStorage.setItem(`thumb_back_${c.id}`, c.thumbnailBack); } catch(e) {} }
    // Upload resized copies to Drive _carddeli_pics/ and store the lh3 URL
    if (c.thumbnail && c.thumbnail.startsWith("data:")) {
      try {
        const url = await uploadCardImage(card.id, c.thumbnail, "");
        if (url && url.startsWith("http")) c.driveThumb = url;
      } catch(e) {}
    }
    if (c.thumbnailBack && c.thumbnailBack.startsWith("data:")) {
      try {
        const url = await uploadCardImage(card.id, c.thumbnailBack, "_back");
        if (url && url.startsWith("http")) c.driveThumbBack = url;
      } catch(e) {}
    }
    setCards(p => { const n=[c,...p]; saveToDrive(n, undefined); return n; });
    setPage("home"); toast(`"${card.name}" added to Vault! 🎉`);
  };
  const addToWatchlist = (card) => {
    const wcard = { ...card, id: Date.now(), watchedAt: new Date().toISOString().split("T")[0], alertPrice: null };
    setWatchlist(p => { const n=[wcard,...p]; saveToDrive(undefined, n); return n; });
    setPage("market");
    toast(`"${card.name}" added to Watchlist! 👀`);
  };
  const removeFromWatchlist = (id) => {
    setWatchlist(p => { const n=p.filter(c=>c.id!==id); saveToDrive(undefined,n); return n; });
    toast("Removed from Watchlist");
  };
  const updateCard = (u) => {
    setCards(p => { const n=p.map(c=>c.id===u.id?u:c); saveToDrive(n, undefined); return n; });
  };
  const deleteCard = (id) => {
    try { localStorage.removeItem(`thumb_${id}`); localStorage.removeItem(`thumb_back_${id}`); } catch(e) {}
    // Delete images from Google Drive in background
    const { token, picsFolderId } = driveRef.current;
    if (token && picsFolderId) {
      GDrive.deleteCardImages(token, id, picsFolderId).catch(()=>{});
    }
    setCards(p => { const n=p.filter(c=>c.id!==id); saveToDrive(n, undefined); return n; });
    setPage("collection"); toast("Card removed");
  };
  const importCards = (newCards) => {
    if (cards.length > 0) {
      const choice = window.confirm(
        `Your vault has ${cards.length} existing card${cards.length!==1?"s":""}.\n\nClick OK to ADD the ${newCards.length} imported card${newCards.length!==1?"s":""} to your existing vault.\n\nClick Cancel to REPLACE your vault with only the imported cards (your existing ${cards.length} card${cards.length!==1?"s":""} will be deleted).`
      );
      if (choice) {
        // Append
        setCards(p => { const n=[...newCards,...p]; saveToDrive(n, undefined); return n; });
        toast(`${newCards.length} card${newCards.length!==1?"s":""} added to vault! 📥`);
      } else {
        // Replace — confirm again since it's destructive
        const confirm2 = window.confirm(`Are you sure? This will permanently delete your ${cards.length} existing card${cards.length!==1?"s":""} and replace with the ${newCards.length} imported card${newCards.length!==1?"s":""}.`);
        if (confirm2) {
          setCards(newCards);
          saveToDrive(newCards, undefined);
          toast(`Vault replaced with ${newCards.length} imported card${newCards.length!==1?"s":""}. 📥`);
        }
      }
    } else {
      setCards(p => { const n=[...newCards,...p]; saveToDrive(n, undefined); return n; });
      toast(`${newCards.length} card${newCards.length!==1?"s":""} imported! 📥`);
    }
  };

  const refreshPrice = async (card) => {
    const ok = await confirmCost({
      action: `Refresh price for "${card.name}"`,
      calls: [
        { label: "Claude Haiku — eBay price lookup", detail: "Web search + ~300 output tokens", cost: "~$0.005" },
      ],
      total: "~$0.01",
      note: "Searches eBay completed sold listings to update this card's market value."
    });
    if (!ok) return;
    setFetching(true);
    try {
      const searchQ = [card.name, card.set, card.number, card.year, card.gradingService && card.gradingGrade ? `${card.gradingService} ${card.gradingGrade}` : ""].filter(Boolean).join(" ").trim();
      const headers = {"Content-Type":"application/json","anthropic-dangerous-direct-browser-access":"true","anthropic-version":"2023-06-01",...(apiKey?{"x-api-key":apiKey}:{})};
      const HAIKU_IN=1/1000000, HAIKU_OUT=5/1000000;

      const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers,
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:800,
          messages:[{role:"user",content:`You are a trading card price expert. Provide realistic eBay price estimates for: "${searchQ}". Return ONLY this JSON, no other text:\n{"soldPrices":[0.00,0.00,0.00],"activePrices":[0.00,0.00],"mostRecentListed":0.00,"ebayUrl":"https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQ)}&LH_Sold=1&LH_Complete=1"}\nFill in realistic numbers. Use 0 if unknown.`}]
        })});
      const d = await r.json();
      if (!r.ok||d.error) throw new Error(`[${r.status}] ${d.error?.message||"API error"}`);

      const u = d.usage||{};
      const refreshCost = parseFloat(((u.input_tokens||0)*HAIKU_IN+(u.output_tokens||0)*HAIKU_OUT).toFixed(5));

      const raw = (d.content||[]).map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
      console.log("Refresh price raw:", raw);
      let pi=null;
      try { pi=JSON.parse(raw); } catch(e) { const m=raw.match(/\{[\s\S]*\}/); if(m){try{pi=JSON.parse(m[0]);}catch(e2){}} }
      if (pi) {
        const sold = (pi.soldPrices||[]).map(Number).filter(n=>n>0);
        const active = (pi.activePrices||[]).map(Number).filter(n=>n>0);
        const nv = sold[0] || 0;
        const mrl = Number(pi.mostRecentListed)||0;
        const avg10s = sold.length ? Math.round(sold.reduce((a,b)=>a+b,0)/sold.length*100)/100 : 0;
        const avg10l = active.length ? Math.round(active.reduce((a,b)=>a+b,0)/active.length*100)/100 : 0;
        if (nv > 0 || avg10s > 0 || mrl > 0) {
          const best = nv || avg10s || mrl;
          const monthName = new Date().toLocaleString("en-US",{month:"short"});
          setCards(p=>{ const n=p.map(c=>c.id===card.id?{...c,
            value: best,
            priceMostRecentSold: nv,
            priceMostRecentListed: mrl,
            priceAvg10Sold: avg10s,
            priceAvg10List: avg10l,
            priceSource: "eBay Sold Listings",
            priceSourceUrl: pi.ebayUrl || `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(searchQ)}&LH_Sold=1`,
            priceUpdatedAt: new Date().toISOString().split("T")[0],
            lastUpdated: new Date().toISOString().split("T")[0],
            priceHistory: [...(c.priceHistory||[]).slice(-11), {month:monthName, value:best}],
            apiCost: parseFloat(((c.apiCost||0) + refreshCost).toFixed(5))
          }:c); saveToDrive(n, undefined); return n; });
          toast(`${card.name}: ${fmt$(best)}`);
        } else { toast("No prices found — try editing the search keywords",true); }
      } else { toast("Price refresh failed — no data returned",true); }
    } catch(e) { console.error("Refresh error:",e); toast("Price refresh failed: "+e.message,true); }
    setFetching(false);
  };

  const navTo = (p) => { setPage(p); setSelectedCard(null); setNavVisible(true); lastScrollY.current = 0; };
  const openCard = (card) => { setSelectedCard(card); setPage("detail"); };

  if (!user) return <AuthScreen onLogin={handleLogin} apiKey={apiKey} setApiKey={setApiKey}/>;

  const NAV = [
    {id:"home",  label:"Home",       Icon:Icons.Home},
    {id:"collection",label:"Vault",  Icon:Icons.Collection},
    {id:"scan",  label:"Scan",       Icon:Icons.Scan},
    {id:"market",label:"Market",     Icon:Icons.Market},
    {id:"analytics",label:"Charts",  Icon:Icons.Analytics},
  ];

  const showNav = !["detail"].includes(page);

  const theme = makeTheme(darkMode);
  applyTheme(darkMode); // sync module-level color vars for all child components
  const { BG:TBG, SURFACE:TSURF, SURF2:TSURF2, BORDER:TBORDER, TEXT1:TT1, TEXT2:TT2, TEXT3:TT3, ACCENT:TACC, GREEN:TGREEN, RED:TRED, BLUE:TBLUE } = theme;

  return (
  <ThemeCtx.Provider value={theme}>
    {costModal}
    {showDriveSetup && <DriveSetupModal onSetup={handleDriveSetup} onSkip={()=>setShowDriveSetup(false)}/>}
    {showMerch && <MerchModal onClose={()=>setShowMerch(false)} theme={theme}/>}
    <div className="cd-root" style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100dvh",background:TBG}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{background:${darkMode?"#0A0A0A":"#F5F5F0"};min-height:100%}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:${darkMode?"#333":"#ccc"};border-radius:2px}
        input,select{font-family:inherit;color-scheme:${darkMode?"dark":"light"}}
        a{text-decoration:none}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        select option{background:${darkMode?"#111":"#fff"};color:${darkMode?"#f0f0f0":"#111"}}

        /* ── DESKTOP LAYOUT (≥600px) ── */
        @media (min-width:600px) {
          body { background: ${darkMode?"#050505":"#F5F5F0"}; }
          html { background: ${darkMode?"#050505":"#F5F5F0"}; }
          .cd-root {
            display: grid !important;
            grid-template-columns: 230px 1fr;
            grid-template-rows: 58px 1fr;
            min-height: 100vh;
          }
          .cd-topbar   { grid-column:1/-1; grid-row:1; display:flex !important; }
          .cd-sidebar  { grid-column:1;    grid-row:2; display:flex !important; flex-direction:column; }
          .cd-content  { grid-column:2;    grid-row:2; overflow-y:auto; min-height:0; }
          .cd-bottomnav{ display:none !important; }
          .cd-mobhead  { display:none !important; }
        }
        @media (max-width:599px) {
          html, body { overflow-x: hidden; max-width: 100vw; height: 100%; margin: 0; padding: 0; }
          .cd-root    { overflow-x: hidden; max-width: 100vw; min-height: 100dvh; display: flex; flex-direction: column; }
          .cd-content { overflow-x: hidden; max-width: 100vw; width: 100%; flex: 1; overflow-y: auto; min-height: 0; }
          .cd-topbar  { display:none !important; }
          .cd-sidebar { display:none !important; }
          .recharts-wrapper, .recharts-surface { max-width: 100% !important; }
        }
      `}</style>

      {/* Toast */}
      {notif&&(
        <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,
          background:notif.err?(darkMode?"#7f1d1d":"#fef2f2"):(darkMode?"#14532d":"#f0fdf4"),
          color:notif.err?(darkMode?"#fff":"#b91c1c"):(darkMode?"#fff":"#15803d"),
          padding:"10px 18px",borderRadius:10,fontSize:13,fontWeight:600,
          boxShadow:"0 8px 24px rgba(0,0,0,0.3)",animation:"slideDown .2s ease",
          maxWidth:320,textAlign:"center",border:`1px solid ${notif.err?TRED:TGREEN}44`}}>
          {notif.msg}
        </div>
      )}

      {/* PWA Install Banner */}
      {showInstallBanner&&(
        <div style={{position:"fixed",bottom:72,left:12,right:12,zIndex:9998,
          background:`linear-gradient(135deg,${TSURF},${TSURF2})`,
          border:`1px solid ${TACC}55`,borderRadius:16,
          padding:"14px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
          display:"flex",alignItems:"center",gap:12,animation:"slideDown .3s ease"}}>
          <div style={{width:40,height:40,borderRadius:10,background:TACC,flexShrink:0,
            display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 12px ${TACC}55`}}>
            <img src={LOGO_SRC} alt="" style={{width:52,height:52,objectFit:"contain"}}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,color:TT1,fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>Add to Home Screen</div>
            <div style={{fontSize:11,color:TT2,fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>Install for full-screen, no browser bar</div>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button onClick={async ()=>{
              if (installPrompt) {
                installPrompt.prompt();
                const { outcome } = await installPrompt.userChoice;
                if (outcome === "accepted") { setShowInstallBanner(false); setInstallPrompt(null); }
              }
            }} style={{background:TACC,border:"none",borderRadius:10,padding:"8px 14px",
              fontSize:13,fontWeight:700,color:"#000",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
              boxShadow:`0 4px 12px ${TACC}44`}}>
              Install
            </button>
            <button onClick={()=>{
              setShowInstallBanner(false);
              try { localStorage.setItem("_carddeli_install_dismissed","1"); } catch(e) {}
            }} style={{background:"transparent",border:`1px solid ${TBORDER}`,borderRadius:10,
              padding:"8px 12px",fontSize:13,color:TT2,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── DESKTOP TOP BAR ── */}
      <header className="cd-topbar" style={{display:"none",alignItems:"center",justifyContent:"space-between",
        padding:"0 22px",background:TSURF,borderBottom:`1px solid ${TBORDER}`,
        position:"sticky",top:0,zIndex:40}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setShowMerch(true)} title="The Card Deli Shop">
          <div style={{width:17,height:17,borderRadius:"50%",background:TACC,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 8px ${TACC}55`}}><img src={LOGO_SRC} alt="" style={{width:60,height:60,objectFit:"contain"}}/></div>
          <span style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:TT1}}>The Card Deli</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {fetching&&<div style={{width:14,height:14,border:`2px solid ${TBORDER}`,borderTop:`2px solid ${TACC}`,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>}
          {driveStatus==="synced"&&<span title="Google Drive synced" style={{fontSize:11,color:TGREEN,fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:3}}>☁️ Synced</span>}
          {driveStatus==="loading"&&<span style={{fontSize:11,color:TT2,fontFamily:"'DM Mono',monospace"}}>☁️ Loading…</span>}
          {driveStatus==="error"&&<span title="Drive sync failed — check console" style={{fontSize:11,color:TRED,fontFamily:"'DM Mono',monospace"}}>☁️ Error</span>}
          {apiKey&&<span title={`API key active (${apiKey.length} chars, starts: ${apiKey.slice(0,8)})`} style={{fontSize:11,color:TACC,fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:3,background:TACC+"18",border:`1px solid ${TACC}44`,borderRadius:20,padding:"2px 8px"}}>🔑 AI On ({apiKey.length})</span>}
          {/* Theme toggle */}
          <button onClick={()=>setDarkMode(d=>!d)}
            style={{display:"flex",alignItems:"center",gap:6,background:TSURF2,border:`1px solid ${TBORDER}`,borderRadius:20,padding:"5px 12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,color:TT2,transition:"all .2s"}}>
            {darkMode?(
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ):(
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
            {darkMode?"Light":"Dark"}
          </button>
          <button onClick={()=>setProfileOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",padding:0,position:"relative"}}>
            {user.avatar
              ?<img src={user.avatar} alt="" style={{width:32,height:32,borderRadius:"50%",border:`2px solid ${profileOpen?TACC:TBORDER}`,transition:"border-color .2s"}}/>
              :<div style={{width:32,height:32,borderRadius:"50%",background:TACC,display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontSize:13,fontWeight:700,border:`2px solid ${profileOpen?TACC:TBORDER}`}}>{user.name?.[0]}</div>
            }
          </button>
        </div>
      </header>

      {/* ── DESKTOP SIDEBAR ── */}
      <nav className="cd-sidebar" style={{display:"none",background:TSURF,borderRight:`1px solid ${TBORDER}`,
        padding:"20px 10px 16px",position:"sticky",top:58,height:"calc(100vh - 58px)",overflow:"auto"}}>
        <div style={{fontSize:9,color:TT3,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.12em",padding:"0 10px",marginBottom:12}}>Navigation</div>
        {NAV.map(({id,label,Icon})=>{
          const active = page===id||(id==="collection"&&page==="detail");
          return (
            <button key={id} onClick={()=>navTo(id)}
              style={{display:"flex",alignItems:"center",gap:11,padding:"10px 12px",borderRadius:10,border:"none",
                background:active?TACC+"18":"transparent",
                color:active?TACC:TT2,
                cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:active?700:500,
                marginBottom:2,width:"100%",textAlign:"left",transition:"all .15s",
                borderLeft:active?`2px solid ${TACC}`:"2px solid transparent"}}>
              <Icon/>{label}
            </button>
          );
        })}
        <div style={{flex:1}}/>
        {/* Theme toggle in sidebar */}
        <button onClick={()=>setDarkMode(d=>!d)}
          style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:`1px solid ${TBORDER}`,
            background:"transparent",color:TT2,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,
            fontWeight:500,width:"100%",marginBottom:8,transition:"all .2s"}}>
          {darkMode
            ?<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            :<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
          {darkMode?"Light Mode":"Dark Mode"}
        </button>
        <button onClick={()=>setUser(null)}
          style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:10,border:"none",
            background:"transparent",color:TT3,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,
            fontWeight:500,width:"100%"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Sign out
        </button>
      </nav>

      {/* ── MOBILE TOP BAR ── */}
      {showNav&&(
        <div className="cd-mobhead" style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"13px 16px",background:TSURF,borderBottom:`1px solid ${TBORDER}`,
          position:"sticky",top:0,zIndex:20}}>
          <div style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer"}} onClick={()=>setShowMerch(true)} title="The Card Deli Shop">
            <div style={{width:16,height:16,borderRadius:"50%",background:TACC,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 2px 8px ${TACC}44`}}><img src={LOGO_SRC} alt="" style={{width:55,height:55,objectFit:"contain"}}/></div>
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:TT1}}>The Card Deli</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {fetching&&<div style={{width:14,height:14,border:`2px solid ${TBORDER}`,borderTop:`2px solid ${TACC}`,borderRadius:"50%",animation:"spin .7s linear infinite"}}/>}
            {/* Mobile theme toggle */}
            <button onClick={()=>setDarkMode(d=>!d)}
              style={{background:"none",border:`1px solid ${TBORDER}`,borderRadius:8,padding:"5px 8px",cursor:"pointer",color:TT2,display:"flex",alignItems:"center"}}>
              {darkMode
                ?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                :<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>
            <button onClick={()=>setProfileOpen(o=>!o)} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
              {user.avatar
                ?<img src={user.avatar} alt="" style={{width:30,height:30,borderRadius:"50%",border:`2px solid ${profileOpen?TACC:TBORDER}`,transition:"border-color .2s"}}/>
                :<div style={{width:30,height:30,borderRadius:"50%",background:TACC,display:"flex",alignItems:"center",justifyContent:"center",color:"#000",fontSize:12,fontWeight:700,border:`2px solid ${profileOpen?TACC:TBORDER}`}}>{user.name?.[0]}</div>
              }
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="cd-content" ref={contentRef} onScroll={handleContentScroll}
        style={{paddingBottom: showNav ? "calc(80px + env(safe-area-inset-bottom, 0px))" : 0, overflowX:"hidden", width:"100%", boxSizing:"border-box"}}>
        {page==="home"&&<HomeView cards={cards} onSelectCard={openCard} onScan={()=>navTo("scan")}/>}
        {page==="collection"&&<CollectionView cards={cards} onSelectCard={openCard} onDelete={deleteCard} onImportCards={importCards}/>}
        {page==="scan"&&<ScannerView onCardAdded={addCard} onWatchlistAdded={addToWatchlist} onBack={()=>navTo("home")} apiKey={apiKey}/>}
        {page==="market"&&<MarketplaceView cards={cards} watchlist={watchlist} removeFromWatchlist={removeFromWatchlist} apiKey={apiKey}/>}
        {page==="analytics"&&<AnalyticsView cards={cards} fetching={fetching} onRefreshAll={()=>cards.filter(c=>!c.sold).forEach(c=>refreshPrice(c))}/>}
        {page==="detail"&&selectedCard&&(
          <CardDetail
            card={cards.find(c=>c.id===selectedCard.id)||selectedCard}
            onBack={()=>navTo("collection")}
            onUpdate={updateCard}
            onDelete={deleteCard}
            fetching={fetching}
            onRefreshPrice={refreshPrice}
            apiKey={apiKey}
          />
        )}
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {showNav&&(
        <nav className="cd-bottomnav" style={{position:"fixed",bottom:0,left:0,right:0,
          background:TSURF,borderTop:`1px solid ${TBORDER}`,
          display:"flex",zIndex:100,boxShadow:`0 -4px 20px rgba(0,0,0,${darkMode?0.4:0.12})`,
          paddingBottom:"env(safe-area-inset-bottom,0px)",
          transform:(navVisible||page==="scan")?"translateY(0)":"translateY(110%)",
          transition:"transform 0.28s cubic-bezier(0.4,0,0.2,1)"}}>
          {NAV.map(({id,Icon})=>{
            const active = page===id||(id==="collection"&&page==="detail");
            const isScan = id==="scan";
            return (
              <button key={id} onClick={()=>navTo(id)}
                style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",
                  padding:isScan?"6px 4px":"10px 4px",border:"none",background:"transparent",
                  cursor:"pointer",position:"relative"}}>
                {isScan?(
                  <div style={{width:38,height:38,borderRadius:"50%",
                    background:active?TACC:TACC+"22",
                    border:`2px solid ${active?TACC:TACC+"55"}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:active?"#000":TACC,
                    boxShadow:active?`0 0 14px ${TACC}66`:"none",transition:"all .2s"}}>
                    <Icon/>
                  </div>
                ):(
                  <>
                    <span style={{color:active?TACC:TT3,transition:"color .15s"}}><Icon/></span>
                    {active&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",
                      width:16,height:2,background:TACC,borderRadius:"0 0 2px 2px"}}/>}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      )}
    </div>
      {profileOpen&&<ProfilePanel user={user} communityCount={COMMUNITY_COUNT} onClose={()=>setProfileOpen(false)} onLogout={()=>{setUser(null);setApiKey("");setProfileOpen(false);setCards([]);setWatchlist([]);setDriveStatus("none");driveRef.current={folderId:null,picsFolderId:null,fileId:null,token:null};try{localStorage.removeItem("_carddeli_session");}catch(e){}}} darkMode={darkMode} theme={theme} apiKey={apiKey} setApiKey={(k)=>{ setApiKey(k); const {token,folderId}=driveRef.current; if(token&&folderId) GDrive.saveApiKey(token,folderId,k).catch(()=>{}); }} driveStatus={driveStatus} onSetupDrive={()=>setShowDriveSetup(true)}/> }
  </ThemeCtx.Provider>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <AppInner />
    </AppErrorBoundary>
  );
}