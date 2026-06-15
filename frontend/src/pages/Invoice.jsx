import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Invoice() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/invoices/all')
        setInvoices(res.data)
        if (res.data.length > 0) setSelected(res.data[0])
      } catch (err) {
        console.error(err)
        toast.error('Failed to load invoices')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    // issued_at is a full ISO datetime; check_in/check_out are date-only strings
    const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '—'
    const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    })
  }

  const invoiceNumber = (id) => {
    if (!id) return '—'
    return '#' + id.slice(-8).toUpperCase()
  }

  return (
    <Layout>
      {/* ── Invoices Content: two-panel layout inside the shared Layout shell ── */}
      <div className="flex h-[calc(100vh-6rem)] print:h-auto print:block -mx-8 -my-6">

        {/* ── Left Panel: Invoice List (print:hidden) ── */}
        <div className="print:hidden w-[420px] border-r border-surface-variant/30 flex flex-col bg-white flex-shrink-0">
          <div className="p-xl space-y-md">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[28px] font-extrabold text-on-surface tracking-tight leading-tight">
                  Invoices
                </h2>
                <p className="text-[13px] font-medium text-on-surface-variant/60 tracking-wide mt-1 uppercase">
                  {invoices.length} TRANSACTION{invoices.length !== 1 ? 'S' : ''}
                </p>
              </div>
              {/* Create Booking shortcut */}
              <button
                onClick={() => navigate('/bookings')}
                className="flex items-center gap-sm bg-primary px-4 py-2 rounded-xl text-white text-[13px] font-bold tracking-wide transition-all active:scale-95 shadow-lg shadow-primary/25 hover:-translate-y-[1px]"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Booking
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-xl pt-0 space-y-lg">
            {loading ? (
              <div className="p-6 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[40px] animate-spin">
                  progress_activity
                </span>
                <p className="mt-2 text-[14px] font-medium">Loading invoices…</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="p-xl border-2 border-dashed border-outline-variant/30 rounded-3xl flex flex-col items-center justify-center gap-md text-outline">
                <span className="material-symbols-outlined text-[40px]">receipt_long</span>
                <p className="text-[14px] font-bold tracking-wide text-center">
                  No invoices yet
                </p>
                <p className="text-[12px] text-center text-on-surface-variant/50">
                  Invoices are generated when guests check out.
                </p>
              </div>
            ) : (
              invoices.map((inv) => {
                const isActive = selected?.id === inv.id
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelected(inv)}
                    className={`relative p-6 rounded-3xl cursor-pointer transition-all group ${
                      isActive
                        ? 'bg-primary/[0.03] border-2 border-primary/40 hover:bg-primary/[0.05]'
                        : 'bg-surface-container-lowest border-2 border-surface-variant/20 hover:border-primary/20 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3
                          className={`text-[18px] font-bold transition-colors group-hover:text-primary ${
                            isActive ? 'text-primary' : 'text-on-surface'
                          }`}
                        >
                          {inv.guest_name}
                        </h3>
                        <p className="text-[13px] text-on-surface-variant font-medium mt-1">
                          Room {inv.room_number} • {inv.room_type}
                        </p>
                      </div>
                      <span className="text-[10px] font-extrabold text-outline/40 uppercase tracking-widest">
                        {invoiceNumber(inv.id)}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-outline font-bold uppercase tracking-wider mb-1">
                          Total Amount
                        </span>
                        <span className="text-[24px] text-on-surface font-extrabold tracking-tight">
                          ₹{Number(inv.total_amount).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <span className="px-4 py-1.5 bg-on-tertiary-container text-tertiary font-bold rounded-full text-[11px] uppercase tracking-widest border border-tertiary/10">
                        Paid
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── Right Panel: Invoice Detail ── */}
        <div className="flex-1 bg-surface-container-low p-2xl overflow-y-auto custom-scrollbar flex flex-col items-center print:p-0 print:bg-white print:overflow-visible">

          {!selected && !loading ? (
            /* Empty state */
            <div className="print:hidden flex flex-col items-center justify-center h-full text-outline space-y-md">
              <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px]">receipt_long</span>
              </div>
              <p className="text-[18px] font-bold text-on-surface-variant">
                Select an invoice to preview
              </p>
            </div>
          ) : selected ? (
            <div className="w-full max-w-[850px]">

              {/* ── Contextual Header (print:hidden) ── */}
              <div className="print:hidden flex justify-between items-end mb-xl">
                <div className="space-y-1">
                  <span className="text-[12px] font-bold text-primary uppercase tracking-[0.2em]">
                    Preview Mode
                  </span>
                  <h2 className="text-[24px] font-extrabold text-on-surface tracking-tight">
                    {selected.room_type} — {invoiceNumber(selected.id)}
                  </h2>
                </div>
              </div>

              {/* ── Toolbar (print:hidden) ── */}
              <div className="print:hidden flex gap-sm mb-2xl p-2 bg-white/60 rounded-[24px] border border-white/80">
                <button className="flex-1 px-lg py-3 hover:bg-white rounded-[18px] text-[13px] font-bold text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-sm"
                  onClick={() => toast('PDF export coming soon.')}>
                  <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                  PDF
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 px-lg py-3 hover:bg-white rounded-[18px] text-[13px] font-bold text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">local_printshop</span>
                  PRINT
                </button>
                <button className="flex-1 px-lg py-3 hover:bg-white rounded-[18px] text-[13px] font-bold text-on-surface-variant hover:text-primary transition-all flex items-center justify-center gap-sm"
                  onClick={() => toast('Email delivery coming soon.')}>
                  <span className="material-symbols-outlined text-[20px]">send</span>
                  EMAIL
                </button>
              </div>

              {/* ── The Actual Invoice Document ── */}
              <div
                id="invoice-print"
                className="bg-white premium-shadow min-h-[1100px] p-[64px] rounded-[40px] relative overflow-hidden border border-white print:rounded-none print:shadow-none print:p-[40px] print:min-h-0"
              >
                {/* Design Accent bar */}
                <div className="absolute top-0 left-0 w-full h-[6px] bg-primary"></div>

                {/* ── Invoice Header Group ── */}
                <div className="flex justify-between items-start mb-[64px]">
                  <div className="space-y-6">
                    <div className="flex items-center gap-lg">
                      <div className="w-16 h-16 bg-surface-container-low rounded-3xl flex items-center justify-center border border-surface-variant/30">
                        <span
                          className="material-symbols-outlined text-primary text-[36px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          corporate_fare
                        </span>
                      </div>
                      <div>
                        <h2 className="text-[28px] font-black text-on-surface tracking-tighter uppercase leading-none">
                          HOTEL PMS
                        </h2>
                        <p className="text-[12px] font-bold text-primary tracking-[0.1em] mt-1">
                          LUXURY MANAGEMENT SYSTEM
                        </p>
                      </div>
                    </div>
                    <div className="text-[14px] text-on-surface-variant/80 font-medium leading-relaxed">
                      Nagpur, Maharashtra — 440001<br />
                      Support: +91 83299 19671<br />
                      Email: accounts@hotelpms.com
                    </div>
                  </div>

                  <div className="text-right space-y-4">
                    <div className="text-[48px] font-black text-primary/10 tracking-tighter leading-none select-none">
                      INVOICE
                    </div>
                    <div className="space-y-2">
                      <p className="text-[13px] text-on-surface-variant">
                        <span className="font-bold text-on-surface uppercase tracking-widest mr-2 text-[11px]">
                          Number:
                        </span>
                        {invoiceNumber(selected.id)}
                      </p>
                      <p className="text-[13px] text-on-surface-variant">
                        <span className="font-bold text-on-surface uppercase tracking-widest mr-2 text-[11px]">
                          Issued:
                        </span>
                        {formatDate(selected.issued_at)}
                      </p>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/5 text-primary rounded-full border border-primary/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        <span className="text-[11px] font-black uppercase tracking-[0.15em]">
                          Issued
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Info Grid: Bill-to + Itinerary ── */}
                <div className="grid grid-cols-2 gap-2xl mb-[64px]">
                  {/* Recipient */}
                  <div className="p-xl bg-surface-container-lowest rounded-[32px] border border-surface-variant/40">
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4">
                      Recipient Information
                    </p>
                    <h3 className="text-[22px] font-extrabold text-on-surface tracking-tight">
                      {selected.guest_name}
                    </h3>
                    <p className="text-[14px] text-on-surface-variant font-medium mt-1">
                      Verified Guest Profile
                    </p>
                  </div>

                  {/* Itinerary */}
                  <div className="p-xl bg-surface-container-lowest rounded-[32px] border border-surface-variant/40">
                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4">
                      Itinerary Summary
                    </p>
                    <div className="grid grid-cols-2 gap-lg">
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-outline uppercase tracking-widest">
                          Arrival
                        </p>
                        <p className="text-[16px] font-bold text-on-surface tracking-tight">
                          {formatDateShort(selected.check_in_date)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-outline uppercase tracking-widest">
                          Departure
                        </p>
                        <p className="text-[16px] font-bold text-on-surface tracking-tight">
                          {formatDateShort(selected.check_out_date)}
                        </p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <p className="text-[11px] font-bold text-outline uppercase tracking-widest">
                          Length of Stay
                        </p>
                        <p className="text-[16px] font-bold text-on-surface tracking-tight">
                          {selected.total_nights}{' '}
                          Night{selected.total_nights !== 1 ? 's' : ''} /{' '}
                          {selected.total_nights + 1} Days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Line Items Table ── */}
                <div className="mb-[64px]">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b-2 border-on-surface text-[11px] font-black uppercase tracking-[0.2em] text-on-surface">
                        <th className="pb-6 pl-2">Service Description</th>
                        <th className="pb-6 text-center">Unit</th>
                        <th className="pb-6 text-center">Qty</th>
                        <th className="pb-6 text-right">Price</th>
                        <th className="pb-6 text-right pr-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant/50">
                      <tr className="group">
                        <td className="py-8 pl-2">
                          <p className="text-[16px] font-extrabold text-on-surface tracking-tight">
                            {selected.room_type} Room Accommodation
                          </p>
                          <p className="text-[13px] text-on-surface-variant font-medium mt-1">
                            Room #{selected.room_number}
                          </p>
                        </td>
                        <td className="py-8 text-center text-[15px] font-bold text-on-surface-variant">
                          Night
                        </td>
                        <td className="py-8 text-center text-[15px] font-bold text-on-surface">
                          {String(selected.total_nights).padStart(2, '0')}
                        </td>
                        <td className="py-8 text-right text-[15px] font-bold text-on-surface-variant">
                          ₹{Number(selected.price_per_night).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-8 text-right pr-2 text-[16px] font-extrabold text-on-surface">
                          ₹{Number(selected.room_charges).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ── Summary / Totals ── */}
                <div className="flex justify-end pt-8 border-t-2 border-surface-container">
                  <div className="w-[320px] space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[14px] font-bold text-on-surface-variant">
                        <span className="uppercase tracking-widest text-[11px]">
                          Subtotal Balance
                        </span>
                        <span>
                          ₹{Number(selected.room_charges).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[14px] font-bold text-on-surface-variant">
                        <span className="uppercase tracking-widest text-[11px]">
                          GST / Taxes (18%)
                        </span>
                        <span>
                          ₹{Number(selected.tax).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="bg-primary p-8 rounded-[28px] text-white shadow-xl shadow-primary/20">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[12px] font-black uppercase tracking-[0.3em] opacity-80">
                          Final Total
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-[18px] font-bold opacity-70 italic">INR</span>
                        <span className="text-[42px] font-black tracking-tighter">
                          {Number(selected.total_amount).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Footer: Terms + Signature ── */}
                <div className="mt-[80px] grid grid-cols-5 gap-xl items-end">
                  <div className="col-span-3">
                    <p className="text-[11px] font-black text-on-surface uppercase tracking-[0.2em] mb-4">
                      Terms of Settlement
                    </p>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed font-medium">
                      This is a computer-generated document. Please ensure all outstanding dues
                      are cleared within 24 hours of checking out. Bank transfers should include
                      the Invoice Number as reference. Late payments are subject to a 2% monthly
                      surcharge.
                    </p>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="h-[60px] flex items-end justify-end mb-4 pr-4">
                      <p className="font-serif italic text-[24px] text-primary/40 pointer-events-none select-none">
                        Authorized
                      </p>
                    </div>
                    <div className="inline-block border-t border-on-surface pt-2">
                      <p className="text-[10px] font-black text-on-surface uppercase tracking-[0.3em]">
                        AUTHORIZED SIGNATORY
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Document Footer ── */}
                <div className="mt-xl flex justify-center pb-2xl">
                  <span className="text-[11px] font-black text-outline uppercase tracking-widest">
                    Document 1 of 1 • System Generated
                  </span>
                </div>
              </div>
              {/* End invoice-print */}

            </div>
          ) : null}
        </div>
        {/* End Right Panel */}

      </div>
    </Layout>
  )
}
