import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from './lib/supabase';
import { genId, TEMPLATES, INITIAL_FORM_DATA, INITIAL_TOGGLES } from './lib/constants';

// Components
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import Auth from './components/Auth';
import Modals from './components/Modals';

function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState('form');
  const [theme, setTheme] = useState('light');
  const [currency, setCurrency] = useState('₹');
  const [agreementId, setAgreementId] = useState(() => {
    try {
      const draft = localStorage.getItem('fd_draft');
      if (draft) return JSON.parse(draft).agreementId;
    } catch (e) {}
    return genId();
  });
  const [versionNum, setVersionNum] = useState(1);
  const [approvalStatus, setApprovalStatus] = useState('pending');
  const [isClientMode, setIsClientMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState('advance');
  const [toasts, setToasts] = useState([]);
  const [signedDate, setSignedDate] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Diagnostic: Alert if Supabase keys are missing
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if ((!url || !key) && !isClientMode) {
      console.error("Supabase environment variables are missing!");
      addToast("⚠ Configuration Error: Missing Supabase Keys");
    }
  }, []);

  const [savedAgreements, setSavedAgreements] = useState([]);

  const [formData, setFormData] = useState(() => {
    try {
      const draft = localStorage.getItem('fd_draft');
      if (draft) return JSON.parse(draft).formData;
    } catch (e) {}
    return { ...INITIAL_FORM_DATA };
  });

  const [scopeItems, setScopeItems] = useState(() => {
    try {
      const draft = localStorage.getItem('fd_draft');
      if (draft) return JSON.parse(draft).scopeItems;
    } catch (e) {}
    return [];
  });

  const [toggles, setToggles] = useState({ ...INITIAL_TOGGLES });

  const [watermark, setWatermark] = useState({
    text: 'MJ FREELANCE',
    show: true
  });

  const [sigMode, setSigMode] = useState('type');
  const [versionHistory, setVersionHistory] = useState([
    { num: 1, action: 'Initial draft', time: 'Initial' }
  ]);

  const canvasRef = useRef(null);
  const drawCtx = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- Date ---
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) fetchAgreements();
      } catch (error) {
        console.error("Failed to initialize Supabase auth:", error);
        addToast("⚠ Supabase connection failed. Running in Local Mode.");
      } finally {
        setIsInitializingAuth(false);
      }
    };
    initAuth();

    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchAgreements();
          fetchProfile();
        }
        setIsInitializingAuth(false);
      });
      subscription = data?.subscription;
    } catch (error) {
      console.error("Failed to subscribe to auth changes:", error);
    }

    return () => {
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (e) {
          console.error("Failed to unsubscribe:", e);
        }
      }
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/agreement/')) {
      const id = hash.replace('#/agreement/', '');
      setIsClientMode(true);
      setAgreementId(id);
      fetchAgreementById(id);
    }
  }, []);

  // REALTIME SYNC: Listen for updates to this specific agreement
  useEffect(() => {
    if (agreementId) {
      let channel;
      try {
        channel = supabase
          .channel(`agreement-${agreementId}`)
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'agreements',
            filter: `agreement_id=eq.${agreementId}`
          }, (payload) => {
            // Update view immediately for both freelancer and client
            loadAgreementFromData(payload.new);
            
            if (isClientMode) {
              // No extra toast needed for client usually
            } else {
              // Refresh the sidebar list for freelancer
              fetchAgreements();
              
              if (payload.new.status === 'accepted') {
                addToast('🎉 Client just accepted the agreement!');
              }
            }
          })
          .subscribe();
      } catch (err) {
        console.error("Failed to establish real-time sync channel:", err);
      }
      
      return () => {
        if (channel) {
          try {
            supabase.removeChannel(channel);
          } catch (err) {
            console.error("Failed to remove channel:", err);
          }
        }
      };
    }
  }, [agreementId, isClientMode]);

  useEffect(() => {
    if (!isClientMode) {
      localStorage.setItem('fd_draft', JSON.stringify({ formData, scopeItems, agreementId }));
    }
  }, [formData, scopeItems, agreementId, isClientMode]);

  useEffect(() => {
    if (sigMode === 'draw' && canvasRef.current) {
      drawCtx.current = canvasRef.current.getContext('2d');
      drawCtx.current.lineWidth = 2;
      drawCtx.current.lineCap = 'round';
      drawCtx.current.strokeStyle = '#1a1814';
    }
  }, [sigMode, activeTab]);

  // --- Handlers ---
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleToggleChange = (e) => {
    const { id, checked } = e.target;
    setToggles(prev => ({ ...prev, [id.replace('tog-', '')]: checked }));
  };

  const addScopeItem = () => setScopeItems([...scopeItems, '']);
  const updateScopeItem = (idx, val) => {
    const newItems = [...scopeItems];
    newItems[idx] = val;
    setScopeItems(newItems);
  };
  const removeScopeItem = (idx) => setScopeItems(scopeItems.filter((_, i) => i !== idx));

  const addToast = (msg) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const bumpVersion = (action) => {
    const next = versionNum + 1;
    setVersionNum(next);
    setVersionHistory(prev => [{ num: next, action, time: new Date().toLocaleTimeString() }, ...prev]);
  };

  const applyTemplate = (name) => {
    const t = TEMPLATES[name];
    setFormData(prev => ({
      ...prev,
      areaOfWork: t.areaOfWork,
      projectTitle: t.projectTitle,
      projectDesc: t.projectDesc,
      components: t.components,
      totalCost: t.totalCost,
      advancePct: t.advancePct,
      gstPct: t.gstPct,
      timeline: t.timeline,
      revisions: t.revisions,
      warranty: t.warranty
    }));
    setScopeItems(t.scope);
    addToast(`Applied: ${t.areaOfWork} template`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
      if (error) {
        const { data: sData, error: sError } = await supabase.auth.signUp({ email: authEmail, password: authPass });
        if (sError) addToast('✕ Auth failed: ' + sError.message);
        else {
          addToast('✓ Account created! Welcome.');
          setUser(sData.user);
        }
      } else {
        addToast('✓ Logged in successfully');
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
      addToast('✕ Connection failed: Could not connect to authentication server.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleContinueOffline = () => {
    const guestUser = {
      email: 'local-guest@freelancedoc.local',
      id: 'local-guest',
      isAnonymous: true
    };
    setUser(guestUser);
    addToast('🔌 Connected to Local Mode');
    try {
      const localList = JSON.parse(localStorage.getItem('fd_local_agreements') || '[]');
      setSavedAgreements(localList.map(transformFromDb));
    } catch (e) {
      console.error("Failed to load local agreements:", e);
    }
  };

  const handleLogout = async () => {
    try {
      if (user && !user.isAnonymous) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error("Error signing out:", e);
    }
    setUser(null);
    setSavedAgreements([]);
    addToast('Logged out');
  };

  const fetchProfile = async () => {
    if (!user || user.isAnonymous) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!error && data) {
        setFormData(prev => ({
          ...prev,
          freelancerName: data.freelancer_name || prev.freelancerName,
          freelancerUpi: data.freelancer_upi || prev.freelancerUpi
        }));
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  const fetchAgreements = async () => {
    if (!user) return;
    if (user.isAnonymous) {
      try {
        const localList = JSON.parse(localStorage.getItem('fd_local_agreements') || '[]');
        setSavedAgreements(localList.map(transformFromDb));
      } catch (e) {
        console.error("Failed to load local agreements:", e);
      }
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { data, error } = await supabase.from('agreements').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (!error && data) setSavedAgreements(data.map(transformFromDb));
    } catch (err) {
      console.error("Failed to fetch agreements:", err);
      addToast("⚠ Failed to load saved cloud agreements.");
    }
  };

  const transformFromDb = (d) => ({
    id: d.agreement_id,
    date: new Date(d.created_at || new Date()).toLocaleDateString('en-IN'),
    client: d.client_name,
    title: d.project_title,
    status: d.status
  });

  const saveAgreement = async (silent = false) => {
    if (!user) {
      if (!silent) addToast('Please login to save');
      return false;
    }
    if (!silent) addToast(user.isAnonymous ? 'Saving locally...' : 'Saving to cloud...');
    const dbData = {
      agreement_id: agreementId,
      user_id: user.id,
      freelancer_name: formData.freelancerName,
      client_name: formData.clientName,
      client_email: formData.clientEmail,
      project_title: formData.projectTitle,
      area_of_work: formData.areaOfWork,
      project_desc: formData.projectDesc,
      total_cost: parseFloat(formData.totalCost) || 0,
      advance_pct: parseInt(formData.advancePct) || 0,
      gst_pct: parseInt(formData.gstPct) || 0,
      status: approvalStatus,
      form_data: formData,
      scope_items: scopeItems,
      toggles: toggles,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (user.isAnonymous) {
      try {
        const localList = JSON.parse(localStorage.getItem('fd_local_agreements') || '[]');
        const existingIdx = localList.findIndex(item => item.agreement_id === agreementId);
        if (existingIdx > -1) {
          dbData.created_at = localList[existingIdx].created_at || dbData.created_at;
          localList[existingIdx] = dbData;
        } else {
          localList.unshift(dbData);
        }
        localStorage.setItem('fd_local_agreements', JSON.stringify(localList));
        if (!silent) addToast('💾 Saved locally (Offline)');
        bumpVersion('Local Saved');
        fetchAgreements();
        return true;
      } catch (e) {
        if (!silent) addToast('✕ Save failed: ' + e.message);
        return false;
      }
    }

    try {
      const { error } = await supabase.from('agreements').upsert(dbData, { onConflict: 'agreement_id' });
      if (!error) {
        if (!silent) addToast('💾 Saved to Supabase');
        if (user) {
          await supabase.from('profiles').upsert({ id: user.id, freelancer_name: formData.freelancerName, freelancer_upi: formData.freelancerUpi, updated_at: new Date().toISOString() });
        }
        bumpVersion('Cloud Saved');
        fetchAgreements();
        return true;
      } else {
        if (!silent) addToast('✕ Save failed: ' + error.message);
        return false;
      }
    } catch (err) {
      console.error(err);
      if (!silent) addToast('✕ Save failed: Connection error');
      return false;
    }
  };

  const fetchAgreementById = async (id) => {
    if (user?.isAnonymous) {
      try {
        const localList = JSON.parse(localStorage.getItem('fd_local_agreements') || '[]');
        const agreement = localList.find(item => item.agreement_id === id);
        if (agreement) {
          loadAgreementFromData(agreement);
          addToast('✓ Local agreement loaded');
        } else {
          addToast('✕ Agreement not found locally');
        }
      } catch (e) {
        addToast('✕ Failed to load local agreement');
      }
      return;
    }

    addToast('Fetching agreement...');
    try {
      const { data, error } = await supabase.from('agreements').select('*').eq('agreement_id', id).single();
      if (!error && data) {
        loadAgreementFromData(data);
        addToast('✓ Agreement loaded');
      } else {
        addToast('✕ Agreement not found');
      }
    } catch (err) {
      console.error(err);
      addToast('✕ Connection error: Failed to fetch agreement');
    }
  };

  const loadAgreementFromData = (data) => {
    setAgreementId(data.agreement_id);
    setFormData(data.form_data);
    setScopeItems(data.scope_items || []);
    setToggles(data.toggles || INITIAL_TOGGLES);
    setApprovalStatus(data.status || 'pending');
    setSignedDate(data.signed_date || '');
  };

  const newAgreement = () => {
    setAgreementId(genId());
    setFormData({ ...INITIAL_FORM_DATA });
    setScopeItems([]);
    setApprovalStatus('pending');
    setSignedDate('');
    addToast('Starting fresh agreement');
  };

  const sendToClient = async () => {
    // 1. Auto-save current state to cloud first
    const saved = await saveAgreement(true);
    if (!saved) {
      addToast('⚠ Save failed. Check connection before sending.');
      return;
    }

    // 2. Open Gmail with latest data
    const shareUrl = `${window.location.origin}${window.location.pathname}#/agreement/${agreementId}`;
    const subject = encodeURIComponent(`Service Agreement: ${formData.projectTitle}`);
    const body = encodeURIComponent(`Hello ${formData.clientName || 'Client'},\n\nPlease review and accept the service agreement for ${formData.projectTitle} here:\n${shareUrl}\n\nRegards,\n${formData.freelancerName}`);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${formData.clientEmail}&su=${subject}&body=${body}`, '_blank');
    addToast('✓ Saved & Opened Gmail');
  };

  const exportPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    const element = document.getElementById('agreementDoc');
    doc.html(element, { callback: (d) => d.save(`${agreementId}.pdf`), x: 0, y: 0, html2canvas: { scale: 0.75 } });
  };

  const printInvoice = () => {
    const printContent = document.getElementById('invoiceContent').innerHTML;
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
    printWindow.document.write(`<html><head><title>Invoice</title><style>body { font-family: sans-serif; padding: 40px; } .modal { border: none; } button { display: none; }</style></head><body>${printContent}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const payViaUPI = () => {
    const amt = paymentMode === 'full' ? grand : paymentMode === 'advance' ? (adv + (gst * advPct / 100)) : (grand - (adv + (gst * advPct / 100)));
    const upiUrl = `upi://pay?pa=${formData.freelancerUpi}&pn=${formData.freelancerName}&am=${amt}&cu=INR`;
    window.location.href = upiUrl;
  };

  const clientAction = async (status) => {
    try {
      const { error } = await supabase.from('agreements').update({ status, signed_date: status === 'accepted' ? new Date().toISOString() : null }).eq('agreement_id', agreementId);
      if (!error) {
        setApprovalStatus(status);
        if (status === 'accepted') {
          setSignedDate(new Date().toISOString());
          addToast('✓ Agreement Accepted & Signed!');
        } else addToast('Agreement Rejected');
      } else addToast('✕ Action failed: ' + error.message);
    } catch (err) {
      console.error(err);
      addToast('✕ Connection error: Failed to perform action');
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    drawCtx.current.beginPath();
    drawCtx.current.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    drawCtx.current.lineTo(x, y);
    drawCtx.current.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);
  const clearCanvas = () => { if (drawCtx.current) drawCtx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); };

  // --- Calculations ---
  const total = parseFloat(formData.totalCost) || 0;
  const advPct = parseFloat(formData.advancePct) || 0;
  const gstPct = parseFloat(formData.gstPct) || 0;
  const adv = total * advPct / 100;
  const gst = total * gstPct / 100;
  const grand = total + gst;

  const warnings = [];
  if (!formData.clientName.trim()) warnings.push({ type: 'danger', msg: 'Client name missing — agreement is legally unenforceable without it.' });
  if (advPct === 0) warnings.push({ type: 'danger', msg: 'No advance payment — high financial risk.' });
  else if (advPct < 30) warnings.push({ type: 'warn', msg: `Advance of ${advPct}% is below recommended 30%.` });
  if (total === 0) warnings.push({ type: 'warn', msg: 'Project cost is 0.' });
  if (!toggles.liability) warnings.push({ type: 'warn', msg: 'Liability clause disabled — strongly recommended.' });

  const sectionTitle = (num, title) => (
    <div className="doc-section-title" key={num}>{num}. {title}</div>
  );

  if (isInitializingAuth && !isClientMode) {
    return (
      <div className="auth-screen">
        <div style={{ color: 'white', fontFamily: 'var(--font-serif)', fontSize: '20px' }}>Loading FreelanceDoc...</div>
      </div>
    );
  }

  return (
    <div data-theme={theme} className={isClientMode ? 'client-mode' : ''}>
      {!user && !isClientMode ? (
        <Auth 
          handleLogin={handleLogin}
          authEmail={authEmail} setAuthEmail={setAuthEmail}
          authPass={authPass} setAuthPass={setAuthPass}
          isAuthLoading={isAuthLoading}
          handleContinueOffline={handleContinueOffline}
        />
      ) : (
        <>
          {isClientMode ? (
            <div className="client-view-header no-print">
              <div className="logo">FreelanceDoc</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn" onClick={exportPDF}>⬇ Download PDF</button>
                <div className="badge">{approvalStatus}</div>
              </div>
            </div>
          ) : (
            <div className="topbar">
              <div className="logo">FreelanceDoc <span>Agreement Generator</span></div>
              <div className="topbar-actions">
                <select className="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="₹">₹ INR</option><option value="$">$ USD</option><option value="€">€ EUR</option><option value="£">£ GBP</option>
                </select>
                <button className="btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '🌙 Dark' : '☀ Light'}</button>
                <button className="btn btn-gold no-print" onClick={() => setIsInvoiceModalOpen(true)}>📄 Invoice</button>
                <button className="btn no-print" onClick={() => window.print()}>🖨 Print</button>
                <button className="btn no-print" onClick={exportPDF}>⬇ PDF</button>
                <button className="btn btn-primary no-print" onClick={saveAgreement}>💾 Save</button>
                <button className="btn btn-gold no-print" onClick={sendToClient}>📧 Send to Client</button>
                {user && <button className="btn btn-danger no-print" onClick={handleLogout} title={`Logged in as ${user.email}`}>🚪 Logout</button>}
              </div>
            </div>
          )}

          <div className="app-layout">
            {!isClientMode && (
              <Sidebar 
                activeTab={activeTab} setActiveTab={setActiveTab}
                formData={formData} handleInputChange={handleInputChange}
                scopeItems={scopeItems} updateScopeItem={updateScopeItem} removeScopeItem={removeScopeItem} addScopeItem={addScopeItem}
                currency={currency} total={total} adv={adv} gst={gst} grand={grand} advPct={advPct} gstPct={gstPct}
                warnings={warnings} applyTemplate={applyTemplate}
                watermark={watermark} setWatermark={setWatermark}
                newAgreement={newAgreement}
                toggles={toggles} handleToggleChange={handleToggleChange}
                sigMode={sigMode} setSigMode={setSigMode}
                versionHistory={versionHistory}
                savedAgreements={savedAgreements} fetchAgreementById={fetchAgreementById}
                user={user}
              />
            )}
            <Preview 
              formData={formData} toggles={toggles} watermark={watermark}
              approvalStatus={approvalStatus} agreementId={agreementId} dateStr={dateStr}
              currency={currency} total={total} adv={adv} gst={gst} grand={grand} advPct={advPct} gstPct={gstPct}
              sigMode={sigMode} canvasRef={canvasRef} startDrawing={startDrawing} draw={draw} stopDrawing={stopDrawing} clearCanvas={clearCanvas}
              signedDate={signedDate} isClientMode={isClientMode} clientAction={clientAction}
              paymentMode={paymentMode} setPaymentMode={setPaymentMode} payViaUPI={payViaUPI}
              sectionTitle={sectionTitle}
            />
          </div>
        </>
      )}

      <Modals 
        isInvoiceModalOpen={isInvoiceModalOpen} setIsInvoiceModalOpen={setIsInvoiceModalOpen}
        agreementId={agreementId} formData={formData} dateStr={dateStr}
        currency={currency} total={total} gstPct={gstPct} gst={gst} grand={grand} adv={adv} advPct={advPct}
        printInvoice={printInvoice} toasts={toasts}
      />
    </div>
  );
}

export default App;
