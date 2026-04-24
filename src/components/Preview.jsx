import React from 'react';

const Preview = ({
  formData,
  toggles,
  watermark,
  approvalStatus,
  agreementId,
  dateStr,
  currency,
  total,
  adv,
  gst,
  grand,
  advPct,
  gstPct,
  sigMode,
  canvasRef,
  startDrawing,
  draw,
  stopDrawing,
  clearCanvas,
  signedDate,
  isClientMode,
  clientAction,
  paymentMode,
  setPaymentMode,
  payViaUPI,
  sectionTitle
}) => {
  return (
    <div className="main-area">
      <div className="preview-scroll">
        <div className="agreement-doc" id="agreementDoc">
          {watermark.show && <div className="watermark">{watermark.text}</div>}
          
          <div className="doc-header">
            <div>
              <div className="doc-title">SERVICE AGREEMENT</div>
              <div className="doc-meta">Agreement ID: {agreementId}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Dated</div>
              <div style={{ fontWeight: 600 }}>{dateStr}</div>
            </div>
          </div>

          <div className="doc-intro">
            This Service Agreement ("Agreement") is made and entered into on <strong>{dateStr}</strong> by and between:
          </div>

          <div className="parties-grid">
            <div className="party-card">
              <div className="party-label">THE SERVICE PROVIDER</div>
              <div className="party-name">{formData.freelancerName || '[Your Name]'}</div>
              <div className="party-sub">Independent Freelancer</div>
            </div>
            <div className="party-card">
              <div className="party-label">THE CLIENT</div>
              <div className="party-name">{formData.clientName || '[Client Name]'}</div>
              <div className="party-sub">{formData.clientEmail || '—'}</div>
            </div>
          </div>

          {sectionTitle(1, 'PROJECT SUMMARY')}
          <p>The Client hereby engages the Service Provider to perform the following services: <strong>{formData.projectTitle || '[Project Title]'}</strong>. 
          The work falls under the category of <strong>{formData.areaOfWork}</strong>.</p>
          <p style={{ marginTop: '10px' }}>{formData.projectDesc}</p>

          {toggles.components && formData.components && (
            <>
              {sectionTitle(2, 'KEY COMPONENTS / TECHNOLOGIES')}
              <p>The project will utilize the following components and technologies: {formData.components}.</p>
            </>
          )}

          {toggles.scope && (
            <>
              {sectionTitle(toggles.components ? 3 : 2, 'DETAILED SCOPE OF WORK')}
              <ul className="scope-list-doc">
                {formData.scopeItems?.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </>
          )}

          {toggles.client && (
            <>
              {sectionTitle(4, 'CLIENT RESPONSIBILITIES')}
              <p>{formData.clientResponsibilities || 'Client shall provide necessary feedback, approvals, and any specific assets required for the project in a timely manner.'}</p>
            </>
          )}

          {toggles.payment && (
            <>
              {sectionTitle(5, 'PAYMENT TERMS')}
              <p>The total project cost is <strong>{currency}{total.toLocaleString('en-IN')}</strong> {gstPct > 0 ? `(plus ${gstPct}% GST of ${currency}${gst.toLocaleString('en-IN')})` : ''}, 
              amounting to a grand total of <strong>{currency}{grand.toLocaleString('en-IN')}</strong>.</p>
              
              <div className="payment-table">
                <div className="payment-row">
                  <span>Advance Payment ({advPct}%)</span>
                  <strong>{currency}{adv.toLocaleString('en-IN')}</strong>
                </div>
                <div className="payment-row">
                  <span>Balance Payment ({100 - advPct}%)</span>
                  <strong>{currency}{(total - adv).toLocaleString('en-IN')}</strong>
                </div>
              </div>
              <p style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text2)' }}>{formData.paymentTerms || 'Advance payment is required before project commencement. Balance payment is due upon successful project delivery.'}</p>
            </>
          )}

          {sectionTitle(6, 'TIMELINE & DELIVERY')}
          <p>The project is estimated to be completed within <strong>{formData.timeline || '___'} business days</strong> from the date of receipt of the advance payment.</p>
          <p>Delivery Method: {formData.deliveryMethod}.</p>
          <p>Revisions: The Service Provider includes <strong>{formData.revisions || '0'} rounds of revisions</strong>. Further changes may be subject to additional charges.</p>

          {toggles.ip && (
            <>
              {sectionTitle(7, 'INTELLECTUAL PROPERTY')}
              <p>Upon full and final payment, the ownership and intellectual property rights of the final deliverables shall be transferred to the Client. The Service Provider retains the right to showcase the work in their portfolio.</p>
            </>
          )}

          {toggles.nda && (
            <>
              {sectionTitle(8, 'CONFIDENTIALITY')}
              <p>Both parties agree to maintain the confidentiality of any proprietary information shared during the course of this project.</p>
            </>
          )}

          {toggles.warranty && (
            <>
              {sectionTitle(9, 'WARRANTY & SUPPORT')}
              <p>{formData.warranty || 'The Service Provider provides a standard 30-day bug-fix warranty from the date of delivery.'}</p>
            </>
          )}

          {toggles.liability && (
            <>
              {sectionTitle(10, 'LIMITATION OF LIABILITY')}
              <p>The Service Provider shall not be liable for any indirect, incidental, or consequential damages. Total liability is limited to the amount paid under this Agreement.</p>
            </>
          )}

          {toggles.cancellation && (
            <>
              {sectionTitle(11, 'TERMINATION')}
              <p>{formData.cancellation || 'Either party may terminate the Agreement with 7 days written notice. The Client shall pay for work completed up to the date of termination. Advance payments are non-refundable.'}</p>
            </>
          )}

          {toggles.dispute && (
            <>
              {sectionTitle(12, 'GOVERNING LAW')}
              <p>This Agreement shall be governed by and construed in accordance with the laws applicable in India. Any disputes shall be subject to the exclusive jurisdiction of the courts in the Service Provider's location.</p>
            </>
          )}

          {formData.additionalNotes && (
            <>
              {sectionTitle(13, 'ADDITIONAL PROVISIONS')}
              <p>{formData.additionalNotes}</p>
            </>
          )}

          <div className="doc-footer">
            <p>This is a digitally generated service agreement. By signing below or accepting electronically, both parties agree to the terms and conditions outlined above.</p>
          </div>

          <div className="signature-section">
            <div className="sig-box">
              <div className="sig-label">FOR THE SERVICE PROVIDER</div>
              <div className="sig-space">
                <div className="signature-typed">{formData.freelancerName}</div>
                <div className="sig-meta">Independent Freelancer</div>
                <div className="sig-meta">Date: {dateStr}</div>
              </div>
            </div>
            <div className="sig-box">
              <div className="sig-label">FOR THE CLIENT</div>
              <div className="sig-space">
                {approvalStatus === 'accepted' ? (
                  <div className="accepted-badge">
                    <div className="badge-main">ACCEPTED & SIGNED</div>
                    <div className="badge-sub">Signed electronically · {signedDate || dateStr}</div>
                  </div>
                ) : (
                  <>
                    {sigMode === 'type' && (
                      <>
                        <div className="signature-typed" style={{ color: 'var(--text3)' }}>{formData.clientName || '_______________'}</div>
                        <div className="sig-meta">Date: _______________</div>
                      </>
                    )}
                    {sigMode === 'draw' && (
                      <div style={{ position: 'relative' }}>
                        <canvas 
                          ref={canvasRef} 
                          width="300" 
                          height="100" 
                          style={{ borderBottom: '1px solid var(--border)', cursor: 'crosshair', touchAction: 'none' }}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                        <button className="rm-btn" onClick={clearCanvas} style={{ position: 'absolute', right: 0, top: 0, scale: '0.7' }}>✕</button>
                        <div className="sig-meta">Date: _______________</div>
                      </div>
                    )}
                    {sigMode === 'placeholder' && (
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
        </div>

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
                     (grand - (adv + (gst * advPct / 100)))).toLocaleString('en-IN')
                  }</span>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', display: 'inline-block', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '12px' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${formData.freelancerUpi}&pn=${formData.freelancerName}&am=${(paymentMode === 'full' ? grand : paymentMode === 'advance' ? (adv + (gst * advPct / 100)) : (grand - (adv + (gst * advPct / 100))))}&cu=INR`)}`} alt="UPI QR" />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text3)' }}>Scan to pay via any UPI App</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Preview;
