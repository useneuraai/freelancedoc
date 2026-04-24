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
            <div className="doc-title">SERVICE AGREEMENT</div>
            <div className="doc-subtitle">Agreement ID: {agreementId} · {dateStr}</div>
          </div>

          <div className="doc-meta-grid">
            <div className="doc-meta-item">
              <div className="meta-label">Service Provider</div>
              <div className="meta-value">{formData.freelancerName || '[Your Name]'}</div>
            </div>
            <div className="doc-meta-item">
              <div className="meta-label">Client</div>
              <div className="meta-value">{formData.clientName || '[Client Name]'}</div>
            </div>
          </div>

          <div className="doc-section">
            <div className="doc-section-title">1. Project Summary</div>
            <p>The Client hereby engages the Service Provider to perform the following services: <strong>{formData.projectTitle || '[Project Title]'}</strong>.</p>
            <p>{formData.projectDesc}</p>
          </div>

          {toggles.components && formData.components && (
            <div className="doc-section">
              <div className="doc-section-title">2. Components & Technologies</div>
              <p>{formData.components}</p>
            </div>
          )}

          {toggles.scope && formData.scopeItems && formData.scopeItems.length > 0 && (
            <div className="doc-section">
              <div className="doc-section-title">{toggles.components ? '3' : '2'}. Scope of Work</div>
              <ul>
                {formData.scopeItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {toggles.payment && (
            <div className="doc-section">
              <div className="doc-section-title">Payment Terms</div>
              <p>The total cost for the services is <strong>{currency}{total.toLocaleString('en-IN')}</strong> {gstPct > 0 ? `(+ ${gstPct}% GST)` : ''}.</p>
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Milestone</th>
                    <th>Percentage</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Advance Payment</td>
                    <td>{advPct}%</td>
                    <td>{currency}{adv.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Final Balance</td>
                    <td>{100 - advPct}%</td>
                    <td>{currency}{(total - adv).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td>Total Payable</td>
                    <td>100%</td>
                    <td>{currency}{grand.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: '11px', marginTop: '8px' }}>{formData.paymentTerms || 'Payment shall be made via UPI or bank transfer as per the details provided.'}</p>
            </div>
          )}

          <div className="doc-section">
            <div className="doc-section-title">Timeline & Delivery</div>
            <p>Projected Timeline: <strong>{formData.timeline} business days</strong> from advance receipt.</p>
            <p>Delivery Method: {formData.deliveryMethod}</p>
            <p>Revisions: {formData.revisions} rounds included.</p>
          </div>

          {toggles.client && (
            <div className="doc-section">
              <div className="doc-section-title">Client Responsibilities</div>
              <p>{formData.clientResponsibilities || 'The Client shall provide necessary feedback, approvals, and assets required for the project in a timely manner.'}</p>
            </div>
          )}

          {toggles.warranty && (
            <div className="doc-section">
              <div className="doc-section-title">Warranty & Support</div>
              <p>{formData.warranty || '30 days of technical support following final delivery.'}</p>
            </div>
          )}

          {toggles.ip && (
            <div className="doc-section">
              <div className="doc-section-title">Intellectual Property</div>
              <p>Upon full payment, the ownership of the final deliverables shall be transferred to the Client. The Service Provider retains the right to include the work in their portfolio.</p>
            </div>
          )}

          {toggles.liability && (
            <div className="doc-section">
              <div className="doc-section-title">Limitation of Liability</div>
              <p>The Service Provider's total liability under this agreement is limited to the total amount paid by the Client.</p>
            </div>
          )}

          {toggles.nda && (
            <div className="doc-section">
              <div className="doc-section-title">Confidentiality (NDA)</div>
              <p>Both parties agree to maintain the confidentiality of any proprietary information shared during the course of this project.</p>
            </div>
          )}

          {toggles.cancellation && (
            <div className="doc-section">
              <div className="doc-section-title">Termination & Cancellation</div>
              <p>{formData.cancellation || 'Either party may terminate the Agreement with 7 days written notice. Client shall pay for work completed up to the date of termination.'}</p>
            </div>
          )}

          {toggles.dispute && (
            <div className="doc-section">
              <div className="doc-section-title">Governing Law & Dispute Resolution</div>
              <p>This Agreement shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in the Service Provider's location.</p>
            </div>
          )}

          {toggles.force && (
            <div className="doc-section">
              <div className="doc-section-title">Force Majeure</div>
              <p>Neither party shall be liable for failure to perform its obligations if such failure results from circumstances beyond their reasonable control (e.g., natural disasters, pandemics, government restrictions).</p>
            </div>
          )}

          {formData.additionalNotes && (
            <div className="doc-section">
              <div className="doc-section-title">Additional Provisions</div>
              <p>{formData.additionalNotes}</p>
            </div>
          )}

          <div className="signature-row">
            <div className="signature-block">
              <div className="signature-label">Service Provider</div>
              <div className="signature-area">
                <div className="signature-typed">{formData.freelancerName}</div>
                <div className="sig-meta">Date: {dateStr}</div>
              </div>
            </div>
            <div className="signature-block">
              <div className="signature-label">Client Approval</div>
              <div className="signature-area">
                {approvalStatus === 'accepted' ? (
                  <div style={{ color: 'var(--accent)', fontWeight: 700 }}>
                    <div style={{ fontSize: '18px' }}>✓ ACCEPTED & SIGNED</div>
                    <div className="sig-meta">Signed on {signedDate || dateStr}</div>
                  </div>
                ) : (
                  <>
                    {sigMode === 'type' && <div className="signature-typed" style={{ opacity: 0.3 }}>{formData.clientName || 'Sign here'}</div>}
                    {sigMode === 'draw' && <div style={{ height: '40px', borderBottom: '1px dashed var(--border)', marginBottom: '5px' }}></div>}
                    <div className="sig-meta">Pending electronic signature</div>
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
