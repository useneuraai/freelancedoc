import React from 'react';
import { TEMPLATES } from '../lib/constants';

const Sidebar = ({
  activeTab,
  setActiveTab,
  formData,
  handleInputChange,
  scopeItems,
  updateScopeItem,
  removeScopeItem,
  addScopeItem,
  currency,
  total,
  adv,
  gst,
  grand,
  advPct,
  gstPct,
  warnings,
  applyTemplate,
  watermark,
  setWatermark,
  newAgreement,
  toggles,
  handleToggleChange,
  sigMode,
  setSigMode,
  versionHistory,
  savedAgreements,
  fetchAgreementById,
  user
}) => {
  return (
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
        <div className="section-heading" style={{ marginTop: '6px' }}>History</div>
        <div className="version-list">
          {versionHistory.map((v, i) => (
            <div key={i} className="version-item">
              <span className="v-num">v{v.num}</span>
              <span className="v-desc">{v.action}</span>
              <span className="v-time">{v.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DASHBOARD PANEL */}
      <div className={`sidebar-panel ${activeTab === 'dashboard' ? 'active' : ''}`}>
        <div className="section-heading">
          {user?.isAnonymous ? 'Saved Agreements (Offline)' : 'Saved Agreements (Cloud)'}
        </div>
        <div className="saved-list">
          {savedAgreements.length === 0 ? (
            user?.isAnonymous ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔌</div>
                <p>No offline agreements found.</p>
                <p style={{ fontSize: '11px', marginTop: '8px' }}>Click "Save" to store your drafts in this browser.</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>☁</div>
                <p>No cloud agreements found.</p>
                <p style={{ fontSize: '11px', marginTop: '8px' }}>Log in and save to see them here.</p>
              </div>
            )
          ) : (
            savedAgreements.map(arg => (
              <div key={arg.id} className="saved-item" onClick={() => fetchAgreementById(arg.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 600 }}>{arg.client}</div>
                  <div className={`badge ${arg.status === 'accepted' ? 'success' : ''}`}>{arg.status}</div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '4px' }}>{arg.title}</div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '8px' }}>{arg.id} · {arg.date}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
