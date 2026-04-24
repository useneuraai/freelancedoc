import React from 'react';

const Modals = ({
  isInvoiceModalOpen,
  setIsInvoiceModalOpen,
  agreementId,
  formData,
  dateStr,
  currency,
  total,
  gstPct,
  gst,
  grand,
  adv,
  advPct,
  printInvoice,
  toasts
}) => {
  return (
    <>
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
    </>
  );
};

export default Modals;
