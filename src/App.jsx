import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from './lib/supabase';

const genId = () => {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'AGR-';
  for (let i = 0; i < 8; i++) id += c[Math.floor(Math.random() * c.length)];
  return id;
};

const TEMPLATES = {
  electronics: { areaOfWork: 'Electronics & Embedded Systems', projectTitle: 'Collision Detection Device', projectDesc: 'Design and development of an embedded collision detection device using IR and ultrasonic sensors interfaced with an ESP32 microcontroller.', components: 'IR Sensor, Ultrasonic Sensor, ESP32, PCB Board, Power Module', totalCost: '4500', advancePct: '50', gstPct: '18', timeline: '21', revisions: '2', warranty: '30 days from delivery', scope: ['Circuit schematic design and component selection', 'Firmware programming on ESP32', 'PCB layout and fabrication coordination', 'Field testing and calibration', 'Delivery with documentation'] },
  software: { areaOfWork: 'Software Development', projectTitle: 'Custom Web Application', projectDesc: 'Full-stack web application development including frontend UI, REST API backend, database integration, and cloud deployment.', components: 'React.js, Node.js, PostgreSQL, Docker, AWS', totalCost: '25000', advancePct: '40', gstPct: '18', timeline: '45', revisions: '3', warranty: '60 days post-launch', scope: ['Requirements analysis and system architecture', 'Frontend development (React)', 'Backend API (Node.js/Express)', 'Database design and integration', 'Testing, QA, and deployment'] },
  ai: { areaOfWork: 'Artificial Intelligence / ML', projectTitle: 'Custom ML Model Development', projectDesc: 'Development and training of a machine learning model for image classification, including preprocessing, training, evaluation, and API deployment.', components: 'Python, TensorFlow, PyTorch, FastAPI, Docker', totalCost: '35000', advancePct: '50', gstPct: '18', timeline: '30', revisions: '2', warranty: '45 days model performance guarantee', scope: ['Dataset collection and preprocessing', 'Model architecture selection and training', 'Performance evaluation and optimization', 'REST API wrapping and deployment', 'Documentation and model card'] },
  iot: { areaOfWork: 'IoT & Automation', projectTitle: 'Smart Automation System', projectDesc: 'End-to-end IoT automation with sensor nodes, MQTT communication, cloud dashboard, and mobile control interface.', components: 'ESP8266, MQTT Broker, Node-RED, InfluxDB, Grafana', totalCost: '12000', advancePct: '50', gstPct: '18', timeline: '30', revisions: '2', warranty: '60 days', scope: ['Hardware node design and programming', 'MQTT broker setup', 'Dashboard development (Node-RED/Grafana)', 'Mobile app integration', 'Testing and documentation'] },
  design: { areaOfWork: 'Design & Creative', projectTitle: 'Brand Identity Design', projectDesc: 'Complete brand identity package including logo design, typography, color palette, and brand guidelines.', components: 'Figma, Adobe Illustrator, Adobe Photoshop', totalCost: '8000', advancePct: '30', gstPct: '18', timeline: '14', revisions: '3', warranty: 'Not applicable', scope: ['Brand discovery and mood board', 'Logo concepts (3 variations)', 'Typography and color selection', 'Brand guidelines PDF', 'Final file delivery (AI, SVG, PNG, PDF)'] },
  consulting: { areaOfWork: 'Consulting', projectTitle: 'Technical Architecture Consulting', projectDesc: 'Technical consulting including system architecture review, recommendations report, and implementation roadmap.', components: 'Documentation tools, Diagramming software', totalCost: '15000', advancePct: '100', gstPct: '18', timeline: '10', revisions: '1', warranty: 'Not applicable', scope: ['Discovery and requirements gathering', 'Architecture review', 'Recommendations report', 'Implementation roadmap', 'Follow-up consultation call'] }
};

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
  const [paymentMode, setPaymentMode] = useState('advance');
  const [toasts, setToasts] = useState([]);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [signedDate, setSignedDate] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [savedAgreements, setSavedAgreements] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fd_agreements') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [formData, setFormData] = useState(() => {
    try {
      const draft = localStorage.getItem('fd_draft');
      if (draft) return JSON.parse(draft).formData;
    } catch (e) {}
    return {
      freelancerName: 'Michael Justus W',
      clientName: '',
      clientEmail: '',
      freelancerUpi: 'michael@okaxis',
      projectTitle: 'Collision Detection Device',
      areaOfWork: 'Electronics & Embedded Systems',
      projectDesc: 'Design and development of an embedded collision detection device using IR and ultrasonic sensors interfaced with an ESP32 microcontroller, including firmware programming and field testing.',
      components: 'IR sensor, Ultrasonic sensor, ESP32, PCB',
      clientResponsibilities: 'Provide clear project requirements and timely feedback at each milestone. Ensure access to testing environment within 48 hours of delivery.',
      totalCost: '4500',
      advancePct: '50',
      gstPct: '18',
      paymentTerms: 'Advance before commencement. Balance upon delivery. Payments via bank transfer or UPI only.',
      deliveryMethod: 'Courier',
      timeline: '21',
      revisions: '2',
      warranty: '30 days from delivery',
      cancellation: 'Advance payment is non-refundable after work commences. Written notice required 48 hours prior to cancellation.',
      additionalNotes: ''
    };
  });

  const [scopeItems, setScopeItems] = useState(() => {
    try {
      const draft = localStorage.getItem('fd_draft');
      if (draft) return JSON.parse(draft).scopeItems;
    } catch (e) {}
    return [
      'Circuit schematic design and component selection',
      'Firmware programming on ESP32 (sensor interfacing)',
      'PCB layout and fabrication coordination',
      'Field testing, calibration, and performance validation',
      'Delivery with technical documentation'
    ];
  });

  const [toggles, setToggles] = useState({
    scope: true,
    components: true,
    payment: true,
    warranty: true,
    liability: true,
    cancellation: true,
    ip: true,
    nda: true,
    client: true,
    dispute: true,
    force: false,
    sig: true
  });

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

  // --- Effects ---
  useEffect(() => {
    // Check client mode and shared data
    const hash = window.location.hash;
    if (hash.includes('view=client')) {
      setIsClientMode(true);
      document.documentElement.classList.add('client-mode');
      
      const params = new URLSearchParams(hash.substring(hash.indexOf('?') + 1 || 1));
      const id = params.get('id') || params.get('data');
      
      if (id && id.startsWith('AGR-')) {
        fetchAgreementById(id);
      } else if (id) {
        try {
          const json = decodeURIComponent(escape(atob(id)));
          const data = JSON.parse(json);
          applySharedData(data);
        } catch (e) {}
      }
    } else {
      fetchAgreements();
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Load draft but prioritize DB status if available
      const draftStr = localStorage.getItem('fd_draft');
      if (draftStr) {
        try {
          const d = JSON.parse(draftStr);
          if (d.agreementId) {
            setAgreementId(d.agreementId);
            // We set these but will potentially overwrite status from DB in a moment
            setApprovalStatus(d.approvalStatus || 'pending');
            setSignedDate(d.signedDate || '');
            setFormData(d.formData);
            setScopeItems(d.scopeItems || []);
            setToggles(d.toggles || toggles);
            setCurrency(d.currency || '₹');
            setVersionNum(d.versionNum || 1);
            
            // Immediately check DB for the latest status of this agreement
            const syncStatus = async () => {
              const { data, error } = await supabase
                .from('agreements')
                .select('status, signed_date')
                .eq('agreement_id', d.agreementId)
                .single();
              if (!error && data) {
                setApprovalStatus(data.status);
                setSignedDate(data.signed_date);
              }
            };
            syncStatus();
          }
        } catch (e) {}
      }
    }

    // --- Real-time Subscription ---
    const subscription = supabase
      .channel('public:agreements')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'agreements'
      }, (payload) => {
        const updated = payload.new;
        if (updated.agreement_id === agreementId) {
          if (updated.status === 'accepted' && approvalStatus !== 'accepted') {
            addToast(`🎉 Client Accepted: ${updated.project_title}!`);
            if (!isClientMode) {
              // Trigger vibration for mobile
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
              }
              
              if (Notification.permission === 'granted') {
                new Notification('Agreement Accepted!', { 
                  body: `${updated.client_name} just signed your agreement for ${updated.project_title}.`,
                  icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135694.png',
                  badge: 'https://cdn-icons-png.flaticon.com/512/3135/3135694.png'
                });
              }
            }
          }
          setApprovalStatus(updated.status);
          setSignedDate(updated.signed_date);
          setVersionNum(updated.version);
        }
        if (!isClientMode) fetchAgreements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [agreementId, isClientMode]);

  // --- Auto-save Draft to Local Storage ---
  useEffect(() => {
    if (!isClientMode) {
      const draft = {
        formData,
        scopeItems,
        toggles,
        agreementId,
        currency,
        versionNum,
        approvalStatus,
        signedDate
      };
      localStorage.setItem('fd_draft', JSON.stringify(draft));
    }
  }, [formData, scopeItems, toggles, agreementId, currency, versionNum, approvalStatus, signedDate, isClientMode]);

  const fetchAgreements = async () => {
    const { data, error } = await supabase
      .from('agreements')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) {
      setSavedAgreements(data.map(transformFromDb));
    }
  };

  const fetchAgreementById = async (id) => {
    addToast('Fetching agreement...');
    const { data, error } = await supabase
      .from('agreements')
      .select('*')
      .eq('agreement_id', id)
      .single();
    
    if (!error && data) {
      loadAgreementFromData(data);
      addToast('✓ Agreement loaded from cloud');
    } else {
      addToast('✕ Agreement not found or connection error');
    }
  };

  const transformFromDb = (d) => ({
    id: d.agreement_id,
    date: new Date(d.created_at).toLocaleDateString('en-IN'),
    title: d.project_title,
    client: d.client_name,
    area: d.area_of_work,
    version: d.version,
    status: d.status,
    signedDate: d.signed_date,
    data: d // Store full object for easy re-application
  });

  useEffect(() => {
    if (sigMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      drawCtx.current = canvas.getContext('2d');
      drawCtx.current.strokeStyle = '#2d5a4e';
      drawCtx.current.lineWidth = 2;
      drawCtx.current.lineCap = 'round';
    }
  }, [sigMode, toggles.sig]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
  }, [theme]);

  // --- Handlers ---
  const applySharedData = (d) => {
    if (!d) return;
    // Handle both old compressed format and new database format
    setFormData({
      freelancerName: d.fl || d.freelancer_name || '',
      clientName: d.cl || d.client_name || '',
      clientEmail: d.ce || d.client_email || '',
      freelancerUpi: d.upi || d.freelancer_upi || '',
      projectTitle: d.pt || d.project_title || '',
      areaOfWork: d.area || d.area_of_work || '',
      projectDesc: d.pd || d.project_desc || '',
      components: d.comp || d.components || '',
      totalCost: d.cost || d.total_cost || '',
      advancePct: d.adv || d.advance_pct || '',
      gstPct: d.gst || d.gst_pct || '',
      timeline: d.tm || d.timeline || '',
      deliveryMethod: d.dm || d.delivery_method || '',
      revisions: d.rev || d.revisions || '',
      warranty: d.wr || d.warranty || '',
      cancellation: d.can || d.cancellation || '',
      paymentTerms: d.ptm || d.payment_terms || '',
      clientResponsibilities: d.cr || d.client_responsibilities || '',
      additionalNotes: d.note || d.additional_notes || ''
    });
    setScopeItems(d.scope || d.scope_items || []);
    if (d.togs) {
      setToggles({
        scope: d.togs.scope,
        components: d.togs.comp,
        payment: d.togs.pay,
        warranty: d.togs.war,
        liability: d.togs.lia,
        cancellation: d.togs.can,
        ip: d.togs.ip,
        nda: d.togs.nda,
        client: d.togs.cl,
        dispute: d.togs.dis,
        sig: d.togs.sig,
        force: d.togs.force || false
      });
    } else if (d.toggles) {
      setToggles(d.toggles);
    }
    setAgreementId(d.id || d.agreement_id || agreementId);
    setCurrency(d.cur || d.currency || '₹');
    setApprovalStatus(d.status || 'pending');
    setSignedDate(d.signedDate || d.signed_date || '');
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleToggleChange = (e) => {
    const { id, checked } = e.target;
    const key = id.replace('tog-', '');
    setToggles(prev => ({ ...prev, [key]: checked }));
  };

  const addScopeItem = (val = '') => {
    setScopeItems(prev => [...prev, val]);
  };

  const updateScopeItem = (index, val) => {
    const newItems = [...scopeItems];
    newItems[index] = val;
    setScopeItems(newItems);
  };

  const removeScopeItem = (index) => {
    setScopeItems(prev => prev.filter((_, i) => i !== index));
  };

  const addToast = (msg, duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const bumpVersion = (action) => {
    const newVer = versionNum + 1;
    setVersionNum(newVer);
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setVersionHistory(prev => [{ num: newVer, action, time }, ...prev]);
  };

  const saveAgreement = async () => {
    addToast('Saving to cloud...');
    const dbData = {
      agreement_id: agreementId,
      freelancer_name: formData.freelancerName,
      client_name: formData.clientName,
      client_email: formData.clientEmail,
      freelancer_upi: formData.freelancerUpi,
      project_title: formData.projectTitle,
      area_of_work: formData.areaOfWork,
      project_desc: formData.projectDesc,
      components: formData.components,
      total_cost: parseFloat(formData.totalCost),
      advance_pct: parseFloat(formData.advancePct),
      gst_pct: parseFloat(formData.gstPct),
      timeline: parseInt(formData.timeline),
      delivery_method: formData.deliveryMethod,
      revisions: parseInt(formData.revisions),
      warranty: formData.warranty,
      cancellation: formData.cancellation,
      payment_terms: formData.paymentTerms,
      client_responsibilities: formData.clientResponsibilities,
      additional_notes: formData.additionalNotes,
      scope_items: scopeItems,
      toggles: toggles,
      status: approvalStatus,
      signed_date: signedDate,
      currency: currency,
      version: versionNum,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('agreements')
      .upsert(dbData, { onConflict: 'agreement_id' });

    if (!error) {
      addToast('💾 Saved to Supabase');
      bumpVersion('Cloud Saved');
      localStorage.setItem('fd_last_active_id', agreementId);
      fetchAgreements();
    } else {
      addToast('✕ Save failed: ' + error.message);
      // Fallback to local storage
      localStorage.setItem(`fd_backup_${agreementId}`, JSON.stringify(dbData));
    }
  };

  const loadAgreement = (id) => {
    const a = savedAgreements.find(x => x.id === id);
    if (a && a.data) {
      loadAgreementFromData(a.data);
      addToast(`Loaded: ${a.data.project_title}`);
    }
  };

  const loadAgreementFromData = (d) => {
    setAgreementId(d.agreement_id);
    setApprovalStatus(d.status || 'pending');
    setSignedDate(d.signed_date || '');
    setFormData({
      freelancerName: d.freelancer_name || '',
      clientName: d.client_name || '',
      clientEmail: d.client_email || '',
      freelancerUpi: d.freelancer_upi || '',
      projectTitle: d.project_title || '',
      areaOfWork: d.area_of_work || '',
      projectDesc: d.project_desc || '',
      components: d.components || '',
      totalCost: d.total_cost || '',
      advancePct: d.advance_pct || '',
      gstPct: d.gst_pct || '',
      timeline: d.timeline || '',
      deliveryMethod: d.delivery_method || '',
      revisions: d.revisions || '',
      warranty: d.warranty || '',
      cancellation: d.cancellation || '',
      paymentTerms: d.payment_terms || '',
      clientResponsibilities: d.client_responsibilities || '',
      additionalNotes: d.additional_notes || ''
    });
    setScopeItems(d.scope_items || []);
    setToggles(d.toggles || toggles);
    setCurrency(d.currency || '₹');
    setVersionNum(d.version || 1);
    localStorage.setItem('fd_last_active_id', d.agreement_id);
  };


  const newAgreement = () => {
    setAgreementId(genId());
    setVersionNum(1);
    setApprovalStatus('pending');
    setFormData(prev => ({
      ...prev,
      clientName: '',
      projectTitle: '',
      projectDesc: '',
      additionalNotes: ''
    }));
    setScopeItems([]);
    setVersionHistory([{ num: 1, action: 'New draft', time: 'Just now' }]);
    addToast('New agreement created');
    setActiveTab('form');
  };

  const applyTemplate = (name) => {
    const t = TEMPLATES[name];
    if (!t) return;
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

  const clientAction = async (action) => {
    const now = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    setApprovalStatus(action);
    if (action === 'accepted') setSignedDate(now);
    
    addToast(action === 'accepted' ? '✓ Agreement accepted' : '✕ Agreement rejected');
    
    // Update Supabase
    const { error } = await supabase
      .from('agreements')
      .update({ 
        status: action, 
        signed_date: action === 'accepted' ? now : '',
        updated_at: new Date().toISOString()
      })
      .eq('agreement_id', agreementId);

    if (!error) {
      bumpVersion(action === 'accepted' ? 'Client accepted' : 'Client rejected');
    } else {
      addToast('Status sync failed: ' + error.message);
    }
  };

  const verifyOTP = () => {
    const digits = otpDigits.join('');
    if (digits === '482910') {
      setIsOtpModalOpen(false);
      setApprovalStatus('accepted');
      addToast('✓ OTP verified — agreement digitally signed & confirmed');
      bumpVersion('OTP verified & e-signed');
    } else {
      addToast('✕ Incorrect OTP. Demo code: 482910');
    }
  };

  const handleOtpInput = (index, value) => {
    if (value.length > 1) value = value[value.length - 1];
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    
    if (value && index < 5) {
      const nextInput = document.querySelectorAll('.otp-digit')[index + 1];
      if (nextInput) nextInput.focus();
    }
  };

  const generateShareableLink = () => {
    return `${window.location.origin}${window.location.pathname}#view=client?id=${agreementId}`;
  };

  const shareLink = () => {
    const link = generateShareableLink();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        addToast('🔗 Shareable Client Link copied to clipboard!');
        alert("Pro Tip: This link contains ALL the contract data. When the client opens it, they can read, accept, and pay directly.");
      });
    } else {
      alert('Share link: ' + link);
    }
  };

  const exportPDF = async () => {
    addToast('Preparing high-fidelity PDF...');
    try {
      const element = document.querySelector('.agreement-doc');
      const pt = formData.projectTitle || 'Project';
      const filename = `${agreementId}-${pt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}.pdf`;

      // Hide all .no-print elements
      const noPrintElements = element.querySelectorAll('.no-print');
      noPrintElements.forEach(el => el.style.display = 'none');

      const opt = {
        margin: [15, 10, 15, 10], // Slightly larger top/bottom margins
        filename: filename,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 3, // Higher scale for better character rendering
          useCORS: true, 
          letterRendering: false, // Set to false to prevent character splitting
          logging: false,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();

      // Restore elements
      noPrintElements.forEach(el => el.style.display = '');
      
      addToast('✓ PDF exported successfully');
      bumpVersion('PDF exported');
      return filename;
    } catch (e) {
      addToast('PDF export failed: ' + e.message);
      console.error(e);
      return null;
    }
  };

  const sendToClient = () => {
    const email = formData.clientEmail;
    if (!email) {
      addToast('✕ Please enter the client email first');
      setActiveTab('form');
      return;
    }
    const filename = exportPDF();
    const subject = encodeURIComponent(`Contract for Project: ${formData.projectTitle}`);
    const shareLinkStr = generateShareableLink();
    const body = encodeURIComponent(`Hi ${formData.clientName || 'Client'},\n\nPlease find the attached contract for our project "${formData.projectTitle}".\n\nYou can also review, digitally accept, and pay the advance directly via this interactive link:\n${shareLinkStr}\n\nLooking forward to working together!\n\nBest regards,\n${formData.freelancerName}`);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    
    setTimeout(() => {
      window.open(gmailUrl, '_blank');
      alert(`Instructions for sending:\n\n1. The PDF has been downloaded as "${filename}".\n2. In the Gmail tab, click the 'Attach' icon.\n3. Select the downloaded PDF.`);
    }, 1000);
  };

  const payViaUPI = () => {
    const upi = formData.freelancerUpi;
    const name = formData.freelancerName;
    const total = parseFloat(formData.totalCost) || 0;
    const advPct = parseFloat(formData.advancePct) || 0;
    const gstPct = parseFloat(formData.gstPct) || 0;
    const adv = total * advPct / 100;
    const gst = total * gstPct / 100;
    const grand = total + gst;
    
    let amountVal = 0;
    if (paymentMode === 'full') amountVal = grand;
    else if (paymentMode === 'advance') amountVal = adv + (gst * advPct / 100);
    else amountVal = grand - (adv + (gst * advPct / 100));

    const amount = amountVal.toFixed(2);
    const upiLink = `upi://pay?pa=${upi}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(paymentMode.toUpperCase() + ' for ' + formData.projectTitle)}`;
    
    window.location.href = upiLink;
    addToast(`Redirecting to UPI payment for ₹${amount}...`);
    
    setTimeout(() => {
      const confirmPay = confirm(`If you're on a mobile device, your UPI app should have opened. \n\nPayment Details:\nTo: ${name}\nUPI ID: ${upi}\nAmount: ₹${amount}\n\nWould you like to copy the UPI ID?`);
      if (confirmPay) {
        navigator.clipboard.writeText(upi).then(() => addToast('UPI ID copied to clipboard'));
      }
    }, 1000);
  };

  const printInvoice = () => {
    const w = window.open('', '_blank');
    const content = document.getElementById('invoiceContent').innerHTML;
    w.document.write(`<!DOCTYPE html><html><head><title>Invoice</title><style>body{font-family:sans-serif;padding:30px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}</style></head><body>${content}</body></html>`);
    w.document.close();
    w.print();
  };

  const deliveryDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + (parseInt(formData.timeline) || 21));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // --- Canvas Drawing ---
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    drawCtx.current.beginPath();
    drawCtx.current.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    drawCtx.current.lineTo(x, y);
    drawCtx.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (drawCtx.current) {
      drawCtx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // --- Calculations ---
  const total = parseFloat(formData.totalCost) || 0;
  const advPct = parseFloat(formData.advancePct) || 0;
  const gstPct = parseFloat(formData.gstPct) || 0;
  const adv = total * advPct / 100;
  const bal = total - adv;
  const gst = total * gstPct / 100;
  const grand = total + gst;

  const warnings = [];
  if (!formData.clientName.trim()) warnings.push({ type: 'danger', msg: 'Client name missing — agreement is legally unenforceable without it.' });
  if (advPct === 0) warnings.push({ type: 'danger', msg: 'No advance payment — high financial risk. Minimum 30-50% recommended.' });
  else if (advPct < 30) warnings.push({ type: 'warn', msg: `Advance of ${advPct}% is below recommended 30%. Consider increasing.` });
  if (total === 0) warnings.push({ type: 'warn', msg: 'Project cost is 0. Suggested range: ₹4,000–₹8,000 for embedded projects.' });
  if (!toggles.liability) warnings.push({ type: 'warn', msg: 'Liability clause disabled — strongly recommended for legal protection.' });

  // --- Render Helpers ---
  const sectionTitle = (num, title) => (
    <div className="doc-section-title">{num}. {title}</div>
  );

  return (
    <div className={theme === 'dark' ? 'dark-theme' : ''}>
      <div className="topbar">
        <div className="logo">FreelanceDoc <span>Agreement Generator</span></div>
        <div className="topbar-actions">
          <select className="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="₹">₹ INR</option>
            <option value="$">$ USD</option>
            <option value="€">€ EUR</option>
            <option value="£">£ GBP</option>
          </select>
          <button className="btn" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? '🌙 Dark' : '☀ Light'}
          </button>
          <button className="btn btn-gold no-print" onClick={() => setIsInvoiceModalOpen(true)}>📄 Invoice</button>
          <button className="btn no-print" onClick={() => window.print()}>🖨 Print</button>
          <button className="btn no-print" onClick={exportPDF}>⬇ PDF</button>
          <button className="btn btn-primary no-print" onClick={saveAgreement}>💾 Save</button>
        </div>
      </div>

      <div className="app-layout">
        <div className="sidebar">
          <div className="sidebar-tabs">
            <div className={`sidebar-tab ${activeTab === 'form' ? 'active' : ''}`} onClick={() => setActiveTab('form')}>Form</div>
            <div className={`sidebar-tab ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>Templates</div>
            <div className={`sidebar-tab ${activeTab === 'clauses' ? 'active' : ''}`} onClick={() => setActiveTab('clauses')}>Clauses</div>
            <div className={`sidebar-tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Saved</div>
          </div>

          {/* FORM PANEL */}
          <div className={`sidebar-panel ${activeTab === 'form' ? 'active' : ''}`}>
            <div className="section-heading">Parties</div>
            <div className="field-group"><label>Freelancer Name</label><input type="text" id="freelancerName" value={formData.freelancerName} onChange={handleInputChange} /></div>
            <div className="field-group"><label>Client Name / Company</label><input type="text" id="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="Client or Company Name" /></div>
            <div className="field-group"><label>Client Email</label><input type="email" id="clientEmail" value={formData.clientEmail} onChange={handleInputChange} placeholder="client@company.com" /></div>
            <div className="field-group"><label>Freelancer UPI ID (for payment)</label><input type="text" id="freelancerUpi" value={formData.freelancerUpi} onChange={handleInputChange} placeholder="name@upi" /></div>

            <div className="section-heading">Project</div>
            <div className="field-group"><label>Project Title</label><input type="text" id="projectTitle" value={formData.projectTitle} onChange={handleInputChange} /></div>
            <div className="field-group"><label>Area of Work</label>
              <select id="areaOfWork" value={formData.areaOfWork} onChange={handleInputChange}>
                <option>Electronics & Embedded Systems</option>
                <option>Software Development</option>
                <option>Artificial Intelligence / ML</option>
                <option>IoT & Automation</option>
                <option>Mechanical & Robotics</option>
                <option>Design & Creative</option>
                <option>Consulting</option>
              </select>
            </div>
            <div className="field-group"><label>Project Description</label><textarea id="projectDesc" value={formData.projectDesc} onChange={handleInputChange}></textarea></div>
            <div className="field-group"><label>Components Used</label><input type="text" id="components" value={formData.components} onChange={handleInputChange} /></div>
            <div className="field-group">
              <label>Scope of Work</label>
              <div className="scope-list">
                {scopeItems.map((item, idx) => (
                  <div key={idx} className="scope-item">
                    <input type="text" value={item} onChange={(e) => updateScopeItem(idx, e.target.value)} placeholder="Scope item..." />
                    <button className="rm-btn" onClick={() => removeScopeItem(idx)}>✕</button>
                  </div>
                ))}
              </div>
              <button className="add-scope-btn" onClick={() => addScopeItem()}>+ Add scope item</button>
            </div>
            <div className="field-group"><label>Client Responsibilities</label><textarea id="clientResponsibilities" value={formData.clientResponsibilities} onChange={handleInputChange}></textarea></div>

            <div className="section-heading">Payment</div>
            <div className="field-row">
              <div className="field-group"><label>Total Cost</label><input type="number" id="totalCost" value={formData.totalCost} onChange={handleInputChange} min="0" /></div>
              <div className="field-group"><label>Advance (%)</label><input type="number" id="advancePct" value={formData.advancePct} onChange={handleInputChange} min="0" max="100" /></div>
            </div>
            <div className="payment-calc">
              <div className="calc-row"><span>Total Cost</span><span>{currency}{total.toLocaleString('en-IN')}</span></div>
              <div className="calc-row"><span>Advance ({advPct}%)</span><span>{currency}{adv.toLocaleString('en-IN')}</span></div>
              <div className="calc-row"><span>GST Amount</span><span>{currency}{gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
              <div className="calc-row total"><span>Grand Total</span><span>{currency}{grand.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
            </div>
            <div className="field-group"><label>GST / Tax (%)</label><input type="number" id="gstPct" value={formData.gstPct} onChange={handleInputChange} min="0" max="100" /></div>
            <div className="field-group"><label>Payment Terms</label><textarea id="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange} style={{ minHeight: '56px' }}></textarea></div>

            <div className="section-heading">Delivery</div>
            <div className="field-row">
              <div className="field-group">
                <label>Delivery Method</label>
                <select id="deliveryMethod" value={formData.deliveryMethod} onChange={handleInputChange}>
                  <option>Courier</option><option>In-person handover</option><option>Online / Remote</option><option>Client pickup</option>
                </select>
              </div>
              <div className="field-group"><label>Timeline (days)</label><input type="number" id="timeline" value={formData.timeline} onChange={handleInputChange} min="1" /></div>
            </div>
            <div className="field-group"><label>Revisions Included</label><input type="number" id="revisions" value={formData.revisions} onChange={handleInputChange} min="0" /></div>

            <div className="section-heading">Legal</div>
            <div className="field-group"><label>Warranty / Support</label><input type="text" id="warranty" value={formData.warranty} onChange={handleInputChange} /></div>
            <div className="field-group"><label>Cancellation Policy</label><textarea id="cancellation" value={formData.cancellation} onChange={handleInputChange} style={{ minHeight: '56px' }}></textarea></div>
            <div className="field-group"><label>Additional Notes / Custom Clauses</label><textarea id="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} placeholder="Any extra clauses or special conditions..."></textarea></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {warnings.map((w, i) => (
                <div key={i} className={`warning-banner ${w.type}`}>⚠ {w.msg}</div>
              ))}
            </div>
          </div>

          {/* TEMPLATES PANEL */}
          <div className={`sidebar-panel ${activeTab === 'templates' ? 'active' : ''}`}>
            <div className="section-heading">Predefined Templates</div>
            <div className="template-grid">
              {Object.keys(TEMPLATES).map(name => (
                <div key={name} className="template-card" onClick={() => applyTemplate(name)}>
                  <div className="t-icon">
                    {name === 'electronics' && '⚡'}
                    {name === 'software' && '💻'}
                    {name === 'ai' && '🤖'}
                    {name === 'iot' && '📡'}
                    {name === 'design' && '🎨'}
                    {name === 'consulting' && '💼'}
                  </div>
                  <div className="t-name">{name.charAt(0).toUpperCase() + name.slice(1)}</div>
                </div>
              ))}
            </div>
            <div className="section-heading" style={{ marginTop: '6px' }}>Watermark</div>
            <div className="field-row">
              <div className="field-group"><label>Watermark Text</label><input type="text" value={watermark.text} onChange={(e) => setWatermark(prev => ({ ...prev, text: e.target.value }))} /></div>
              <div className="field-group">
                <label>Show Watermark</label>
                <div className="toggle-row" style={{ marginTop: '4px' }}>
                  <span>Enable</span>
                  <label className="toggle">
                    <input type="checkbox" checked={watermark.show} onChange={(e) => setWatermark(prev => ({ ...prev, show: e.target.checked }))} />
                    <div className="toggle-slider"></div>
                  </label>
                </div>
              </div>
            </div>
            <div className="section-heading">New Agreement</div>
            <button className="btn" onClick={newAgreement} style={{ width: '100%' }}>+ Create New Agreement</button>
          </div>

          {/* CLAUSES PANEL */}
          <div className={`sidebar-panel ${activeTab === 'clauses' ? 'active' : ''}`}>
            <div className="section-heading">Enable / Disable Sections</div>
            {Object.keys(toggles).map(key => (
              <div key={key} className="toggle-row">
                <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                <label className="toggle">
                  <input type="checkbox" id={`tog-${key}`} checked={toggles[key]} onChange={handleToggleChange} />
                  <div className="toggle-slider"></div>
                </label>
              </div>
            ))}
            <div className="section-heading">Signature Mode</div>
            <div className="field-group">
              <select value={sigMode} onChange={(e) => setSigMode(e.target.value)}>
                <option value="type">Type signature</option>
                <option value="draw">Draw signature</option>
                <option value="placeholder">Placeholder only</option>
              </select>
            </div>
            <div className="section-heading">Version History</div>
            <div className="version-list">
              {versionHistory.map((v, i) => (
                <div key={i} className="version-item">
                  <span className="v-num">v{v.num}</span>
                  <span className="v-date">{v.action} · {v.time}</span>
                  <span className="v-action" onClick={() => addToast(`v${v.num} viewed`)}>View</span>
                </div>
              ))}
            </div>
          </div>

          {/* SAVED PANEL */}
          <div className={`sidebar-panel ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <div className="section-heading">Saved Agreements</div>
            <div className="dash-grid">
              {savedAgreements.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>No saved agreements yet.<br />Click Save to store one.</div>
              ) : (
                savedAgreements.map(a => (
                  <div key={a.id} className={`dash-card ${a.id === agreementId ? 'active' : ''}`} onClick={() => loadAgreement(a.id)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="dash-card-title">{a.title}</div>
                      <div className={`tag ${(a.status || 'pending') === 'accepted' ? 'tag-elec' : (a.status || 'pending') === 'rejected' ? 'tag-ai' : 'tag-soft'}`} style={{ fontSize: '9px' }}>
                        {(a.status || 'PENDING').toUpperCase()}
                      </div>
                    </div>
                    <div className="dash-card-sub">{a.client}</div>
                    <div className="dash-card-meta">
                      <span className="tag tag-elec">{(a.area || '').split(' ')[0] || 'General'}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text3)' }}>v{a.version} · {a.date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="main-area">
          <div className="client-view-header">
            <div className="logo">FreelanceDoc</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="badge">Secure Client Portal</div>
              <button className="btn btn-primary no-print" onClick={exportPDF} style={{ fontSize: '11px', padding: '4px 10px' }}>⬇ Download PDF</button>
            </div>
          </div>
          
          <div className="preview-toolbar no-print">
            <div className="preview-toolbar-left">
              <div className="agreement-id-badge">{agreementId}</div>
              <div className="version-badge">v{versionNum} — {versionHistory[0]?.action || 'Draft'}</div>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>{dateStr}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={sendToClient}>✉ Send to Client</button>
              <button className="btn" onClick={shareLink}>🔗 Share</button>
              <button className="btn" onClick={() => setIsOtpModalOpen(true)}>🔐 OTP Sign</button>
              <button className="btn btn-primary" onClick={exportPDF}>⬇ Export PDF</button>
            </div>
          </div>

          <div className="preview-scroll">
            <div className="agreement-doc">
              {watermark.show && <div className="watermark">{watermark.text}</div>}
              <div className="doc-content">
                <div className="doc-header">
                  <div className="doc-title">Freelance Service Agreement</div>
                  <div className="doc-subtitle">{formData.areaOfWork} · {dateStr}</div>
                  <div className="doc-meta-grid">
                    <div className="doc-meta-item"><span className="meta-label">Agreement ID</span><span className="meta-value">{agreementId}</span></div>
                    <div className="doc-meta-item"><span className="meta-label">Effective Date</span><span className="meta-value">{dateStr}</span></div>
                    <div className="doc-meta-item"><span className="meta-label">Freelancer</span><span className="meta-value">{formData.freelancerName}</span></div>
                    <div className="doc-meta-item"><span className="meta-label">Client / Company</span><span className="meta-value">{formData.clientName || '—'}</span></div>
                  </div>
                </div>

                <div className="doc-section">
                  {sectionTitle(1, 'Project Overview')}
                  <p><strong>Project:</strong> {formData.projectTitle || '[Project Title]'}</p>
                  <p><strong>Domain:</strong> {formData.areaOfWork}</p>
                  <p>{formData.projectDesc}</p>
                  {formData.components && toggles.components && <p><strong>Components / Technologies:</strong> {formData.components}</p>}
                </div>

                {toggles.scope && scopeItems.length > 0 && (
                  <div className="doc-section">
                    {sectionTitle(2, 'Scope of Work')}
                    <p>The freelancer agrees to deliver the following specifically defined deliverables:</p>
                    <ul>{scopeItems.map((s, i) => <li key={i}>{s}</li>)}</ul>
                    <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text3)', marginTop: '8px' }}>Any work outside the items listed above constitutes additional scope and will be separately quoted and agreed upon in writing before commencement.</p>
                  </div>
                )}

                {toggles.client && formData.clientResponsibilities && (
                  <div className="doc-section">
                    {sectionTitle(3, 'Client Responsibilities')}
                    <p>{formData.clientResponsibilities}</p>
                    <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text3)' }}>Delays caused by client non-responsiveness shall not constitute a breach by the freelancer, and may result in timeline extension.</p>
                  </div>
                )}

                {toggles.payment && (
                  <div className="doc-section">
                    {sectionTitle(4, 'Payment Terms')}
                    <table className="payment-table">
                      <thead><tr><th>Milestone</th><th>Amount</th><th>Due</th></tr></thead>
                      <tbody>
                        <tr><td>Advance ({advPct}%) — Before project start</td><td>{currency}{adv.toLocaleString('en-IN')}</td><td>Prior to commencement</td></tr>
                        <tr><td>Balance ({100 - advPct}%) — Upon delivery</td><td>{currency}{bal.toLocaleString('en-IN')}</td><td>On final delivery</td></tr>
                        {gstPct > 0 && <tr><td>GST / Tax ({gstPct}%)</td><td style={{ textAlign: 'right' }}>{currency}{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td><td>—</td></tr>}
                        <tr><td><strong>Grand Total</strong></td><td colSpan="2"><strong>{currency}{grand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td></tr>
                      </tbody>
                    </table>
                    <p style={{ marginTop: '10px' }}>{formData.paymentTerms}</p>
                    <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text3)' }}>Late payments beyond 7 calendar days of the due date will attract a 2% per week penalty. Continued non-payment entitles the freelancer to withhold all deliverables and source files.</p>
                  </div>
                )}

                <div className="doc-section">
                  {sectionTitle(5, 'Delivery & Revision Terms')}
                  <p><strong>Delivery Method:</strong> {formData.deliveryMethod}</p>
                  <p><strong>Estimated Timeline:</strong> {formData.timeline} working days from commencement (target completion: {deliveryDate()})</p>
                  <p><strong>Revisions Included:</strong> {formData.revisions} round(s) at no additional charge. Additional revisions will be billed at an agreed hourly rate.</p>
                  <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text3)' }}>The timeline begins only after receipt of the advance payment and all required materials from the client.</p>
                </div>

                {toggles.warranty && (
                  <div className="doc-section">
                    {sectionTitle(6, 'Warranty & Post-Delivery Support')}
                    <p>All deliverables are warranted to function as specified in the scope of work for <strong>{formData.warranty}</strong> from the date of final delivery, subject to:</p>
                    <ul>
                      <li>Warranty covers defects in workmanship and functionality as defined in the agreed scope.</li>
                      <li>Void if hardware is modified, mishandled, or operated outside specified parameters.</li>
                      <li>Software bugs attributable to the freelancer's code will be corrected at no charge within the warranty period.</li>
                      <li>Physical damage due to external factors (power surges, drops, liquid damage) is excluded.</li>
                    </ul>
                  </div>
                )}

                {toggles.liability && (
                  <div className="doc-section">
                    {sectionTitle(7, 'Limitation of Liability')}
                    <p>The freelancer's total cumulative liability under this agreement shall in no event exceed the total project fee paid. The freelancer shall not be liable for any indirect, incidental, special, or consequential damages, including lost profits, business interruption, or data loss, arising from the use or inability to use the deliverables, even if advised of the possibility of such damages.</p>
                    <p>The client assumes full responsibility for the integration, deployment, and use of the deliverables in their intended environment.</p>
                  </div>
                )}

                {toggles.ip && (
                  <div className="doc-section">
                    {sectionTitle(8, 'Intellectual Property')}
                    <p>Full ownership and intellectual property rights of all deliverables are transferred to the client exclusively upon receipt of the final payment in full. Until such payment is received, all rights remain with the freelancer. The freelancer may reference this project in their portfolio unless confidentiality is requested in writing by the client.</p>
                  </div>
                )}

                {toggles.nda && (
                  <div className="doc-section">
                    {sectionTitle(9, 'Confidentiality')}
                    <p>Both parties agree to maintain strict confidentiality regarding all proprietary information, technical details, pricing, and business strategies disclosed during this engagement. This obligation shall survive termination of this agreement for a period of two (2) years.</p>
                  </div>
                )}

                {toggles.cancellation && formData.cancellation && (
                  <div className="doc-section">
                    {sectionTitle(10, 'Cancellation Policy')}
                    <p>{formData.cancellation}</p>
                  </div>
                )}

                {toggles.dispute && (
                  <div className="doc-section">
                    {sectionTitle(11, 'Dispute Resolution')}
                    <p>Both parties agree to resolve any disputes through good-faith negotiation within 15 days of written notice. If unresolved, disputes shall be referred to binding arbitration under applicable Indian law. Jurisdiction shall be the city of the freelancer's registered place of business.</p>
                  </div>
                )}

                {toggles.force && (
                  <div className="doc-section">
                    {sectionTitle(12, 'Force Majeure')}
                    <p>Neither party shall be liable for delays or non-performance due to circumstances beyond reasonable control, including natural disasters, pandemics, government actions, or infrastructure outages, provided the affected party notifies the other party in writing within 48 hours.</p>
                  </div>
                )}

                {formData.additionalNotes && (
                  <div className="doc-section">
                    {sectionTitle(13, 'Additional Clauses')}
                    <p>{formData.additionalNotes}</p>
                  </div>
                )}

                <div className="doc-section">
                  {sectionTitle(14, 'Final Acceptance')}
                  <p>By executing this agreement, both parties confirm they have read, understood, and agree to be legally bound by all terms herein. This agreement constitutes the entire understanding between the parties and supersedes all prior oral or written negotiations. Amendments require written consent from both parties.</p>
                </div>

                {toggles.sig && (
                  <div className="signature-row">
                    <div className="signature-block">
                      <div className="signature-label">Freelancer — {formData.freelancerName}</div>
                      <div className="signature-area">
                        {sigMode === 'type' && (
                          <>
                            <div className="signature-typed">{formData.freelancerName}</div>
                            <div className="sig-meta">Signed electronically · {dateStr}</div>
                          </>
                        )}
                        {sigMode === 'draw' && (
                          <>
                            <canvas 
                              className="signature-canvas" 
                              ref={canvasRef} 
                              width="260" 
                              height="65"
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                            ></canvas>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}><button className="btn" onClick={clearCanvas} style={{ fontSize: '11px', padding: '3px 8px' }}>Clear</button></div>
                            <div className="sig-meta">Draw above · {dateStr}</div>
                          </>
                        )}
                        {sigMode === 'placeholder' && (
                          <>
                            <div style={{ borderBottom: '1px solid var(--border)', minHeight: '45px', padding: '8px 0', fontSize: '12px', color: 'var(--text3)' }}>Signature: _______________</div>
                            <div className="sig-meta">Date: {dateStr}</div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="signature-block">
                      <div className="signature-label">Client — {formData.clientName || '[Client Name]'}</div>
                      <div className="signature-area">
                        {approvalStatus === 'accepted' ? (
                          <>
                            <div className="signature-typed">{formData.clientName || 'Client'}</div>
                            <div className="sig-meta">Digitally Signed & Accepted · {signedDate || dateStr}</div>
                          </>
                        ) : (
                          <>
                            {sigMode === 'type' && (
                              <>
                                <div className="signature-typed" style={{ color: 'var(--text3)' }}>{formData.clientName || '_______________'}</div>
                                <div className="sig-meta">Date: _______________</div>
                              </>
                            )}
                            {(sigMode === 'draw' || sigMode === 'placeholder') && (
                              <>
                                <div style={{ borderBottom: '1px solid var(--border)', minHeight: '45px', padding: '8px 0', fontSize: '12px', color: 'var(--text3)' }}>Signature: _______________</div>
                                <div className="sig-meta">Date: _______________</div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="approval-banner no-print">
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '2px' }}>Client Approval Status</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{agreementId} · {dateStr}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className={`approval-status ${approvalStatus}`}>{approvalStatus.toUpperCase()}</div>
                    {approvalStatus === 'pending' && isClientMode && (
                      <>
                        <button className="btn" style={{ fontSize: '12px', color: 'var(--accent)', borderColor: 'var(--accent)', padding: '5px 12px' }} onClick={() => clientAction('accepted')}>✓ Accept</button>
                        <button className="btn btn-danger" style={{ fontSize: '12px', padding: '5px 12px' }} onClick={() => clientAction('rejected')}>✕ Reject</button>
                      </>
                    )}
                    {approvalStatus === 'accepted' && isClientMode && (
                      <button className="btn btn-primary" style={{ fontSize: '12px', padding: '5px 12px', background: '#8b6914', borderColor: '#8b6914' }} onClick={payViaUPI}>💰 Pay Advance via UPI</button>
                    )}
                  </div>
                </div>

                {approvalStatus === 'accepted' && isClientMode && (
                  <div className="doc-section no-print" style={{ marginTop: '40px', padding: '32px', background: 'var(--gold-light)', border: '2px solid var(--gold)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--gold)', marginBottom: '8px' }}>Agreement Accepted</div>
                    <p style={{ color: 'var(--text2)', marginBottom: '20px' }}>Please select your payment option below to proceed.</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
                      <button className={`btn ${paymentMode === 'advance' ? 'btn-primary' : ''}`} onClick={() => setPaymentMode('advance')} style={{ flex: 1, ...(paymentMode === 'advance' ? { background: 'var(--gold)', borderColor: 'var(--gold)' } : {}) }}>First Half ({advPct}%)</button>
                      <button className={`btn ${paymentMode === 'balance' ? 'btn-primary' : ''}`} onClick={() => setPaymentMode('balance')} style={{ flex: 1, ...(paymentMode === 'balance' ? { background: 'var(--gold)', borderColor: 'var(--gold)' } : {}) }}>Second Half ({100 - advPct}%)</button>
                      <button className={`btn ${paymentMode === 'full' ? 'btn-primary' : ''}`} onClick={() => setPaymentMode('full')} style={{ flex: 1, ...(paymentMode === 'full' ? { background: 'var(--gold)', borderColor: 'var(--gold)' } : {}) }}>Full Payment (100%)</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'center', textAlign: 'left' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '20px', background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text3)', fontWeight: '700' }}>Payment Summary — {paymentMode.toUpperCase()}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Base Amount</span>
                          <span style={{ fontWeight: '700', color: 'var(--text)' }}>{currency}{
                            (paymentMode === 'full' ? total : 
                             paymentMode === 'advance' ? adv : 
                             (total - adv)).toLocaleString('en-IN')
                          }</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Taxes ({gstPct}%)</span>
                          <span style={{ fontWeight: '700', color: 'var(--text)' }}>{currency}{
                            (paymentMode === 'full' ? gst : 
                             paymentMode === 'advance' ? (gst * advPct / 100) : 
                             (gst * (100 - advPct) / 100)).toLocaleString('en-IN')
                          }</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border)', paddingTop: '10px', marginTop: '5px', fontSize: '18px' }}>
                          <span style={{ fontWeight: '600' }}>Total Payable</span>
                          <span style={{ fontWeight: '800', color: 'var(--accent)' }}>{currency}{
                            (paymentMode === 'full' ? grand : 
                             paymentMode === 'advance' ? (adv + (gst * advPct / 100)) : 
                             (grand - (adv + (gst * advPct / 100)))).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          }</span>
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: '10px', padding: '14px', background: 'var(--gold)', borderColor: 'var(--gold)' }} onClick={payViaUPI}>Pay {paymentMode.toUpperCase()} via UPI</button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'white', padding: '12px', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${formData.freelancerUpi}&pn=${encodeURIComponent(formData.freelancerName)}&am=${(
                              paymentMode === 'full' ? grand : 
                              paymentMode === 'advance' ? (adv + (gst * advPct / 100)) : 
                              (grand - (adv + (gst * advPct / 100)))
                            ).toFixed(2)}&cu=INR&tn=${encodeURIComponent(paymentMode.toUpperCase() + ' for ' + formData.projectTitle)}`)}`} 
                            alt="UPI QR" 
                            style={{ display: 'block' }} 
                          />
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center' }}>Scan to pay <strong>{paymentMode.toUpperCase()}</strong><br /><strong>{formData.freelancerUpi}</strong></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP MODAL */}
      <div className={`modal-overlay ${isOtpModalOpen ? 'open' : ''}`}>
        <div className="modal">
          <h3>OTP Client Confirmation</h3>
          <p>A 6-digit code would be sent to the client's email for e-sign confirmation. Demo code: <strong>482910</strong></p>
          <div className="otp-input">
            {otpDigits.map((digit, idx) => (
              <input 
                key={idx} 
                className="otp-digit" 
                maxLength="1" 
                type="text" 
                value={digit} 
                onChange={(e) => handleOtpInput(idx, e.target.value)} 
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn" onClick={() => setIsOtpModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
            <button className="btn btn-primary" onClick={verifyOTP} style={{ flex: 1 }}>Verify & Sign</button>
          </div>
        </div>
      </div>

      {/* INVOICE MODAL */}
      <div className={`modal-overlay ${isInvoiceModalOpen ? 'open' : ''}`}>
        <div className="modal" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3>Invoice</h3>
            <button className="btn" onClick={() => setIsInvoiceModalOpen(false)}>✕</button>
          </div>
          <div id="invoiceContent">
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', fontSize: '13px' }}>
              <div style={{ background: 'var(--accent)', color: 'white', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px' }}>INVOICE</div><div style={{ fontSize: '11px', opacity: 0.8 }}>INV-{agreementId.replace('AGR-', '')}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 600 }}>{formData.freelancerName}</div><div style={{ fontSize: '11px', opacity: 0.8 }}>{dateStr}</div></div>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid var(--border2)' }}>
                  <div><div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text3)', marginBottom: '3px' }}>Bill To</div><div style={{ fontWeight: 600 }}>{formData.clientName || 'Client'}</div><div style={{ color: 'var(--text3)', fontSize: '12px' }}>{formData.clientEmail || '—'}</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text3)', marginBottom: '3px' }}>Reference</div><div style={{ fontWeight: 600 }}>{agreementId}</div><div style={{ color: 'var(--text3)', fontSize: '12px' }}>Due on delivery</div></div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg3)' }}><th style={{ textAlign: 'left', padding: '7px 10px', fontSize: '11px', color: 'var(--text3)', border: '1px solid var(--border2)' }}>Description</th><th style={{ textAlign: 'right', padding: '7px 10px', fontSize: '11px', color: 'var(--text3)', border: '1px solid var(--border2)' }}>Amount</th></tr>
                  </thead>
                  <tbody>
                    <tr><td style={{ padding: '9px 10px', border: '1px solid var(--border2)' }}>{formData.projectTitle}</td><td style={{ textAlign: 'right', padding: '9px 10px', border: '1px solid var(--border2)' }}>{currency}{total.toLocaleString('en-IN')}</td></tr>
                    {gstPct > 0 && <tr><td style={{ padding: '7px 10px', border: '1px solid var(--border2)', color: 'var(--text3)' }}>GST ({gstPct}%)</td><td style={{ textAlign: 'right', padding: '7px 10px', border: '1px solid var(--border2)', color: 'var(--text3)' }}>{currency}{gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>}
                    <tr style={{ background: 'var(--accent-light)' }}><td style={{ padding: '9px 10px', border: '1px solid var(--border2)', fontWeight: 700, color: 'var(--accent)' }}>Total Due</td><td style={{ textAlign: 'right', padding: '9px 10px', border: '1px solid var(--border2)', fontWeight: 700, color: 'var(--accent)' }}>{currency}{grand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
                  </tbody>
                </table>
                <div style={{ padding: '9px 11px', background: 'var(--warn-light)', border: '1px solid var(--warn)', borderRadius: 'var(--radius)', fontSize: '12px', color: 'var(--warn)' }}>Advance of {currency}{adv.toLocaleString('en-IN')} ({advPct}%) due before project commencement. Balance on final delivery.</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button className="btn" onClick={() => setIsInvoiceModalOpen(false)} style={{ flex: 1 }}>Close</button>
            <button className="btn btn-primary" onClick={printInvoice} style={{ flex: 1 }}>Print Invoice</button>
          </div>
        </div>
      </div>

      {/* TOASTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
