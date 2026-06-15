import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../api/axios'
import toast from 'react-hot-toast'

// ── Helpers ──────────────────────────────────────────────────
const fmt = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const formatDate = (str) => {
  if (!str) return '—'
  const d = str.includes('T') ? new Date(str) : new Date(str + 'T00:00:00')
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

const formatDateShort = (str) => {
  if (!str) return '—'
  const d = str.includes('T') ? new Date(str) : new Date(str + 'T00:00:00')
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const invoiceNo = (id) => (id ? 'INV-' + id.slice(-8).toUpperCase() : '—')

// ── Component ────────────────────────────────────────────────
export default function Invoice() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/invoices/all')
      .then(res => {
        // Sort newest first
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.issued_at) - new Date(a.issued_at)
        )
        setInvoices(sorted)
        if (sorted.length > 0) setSelected(sorted[0])
      })
      .catch(() => toast.error('Failed to load invoices'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = invoices.filter(inv =>
    inv.guest_name.toLowerCase().includes(search.toLowerCase()) ||
    inv.room_number.toLowerCase().includes(search.toLowerCase()) ||
    invoiceNo(inv.id).toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0)

  return (
    <Layout>
      <div className="flex h-[calc(100vh-6rem)] print:h-auto print:block -mx-8 -my-6">

        {/* ── LEFT PANEL ── */}
        <div className="print:hidden w-[380px] border-r border-surface-variant/30 flex flex-col bg-white flex-shrink-0">

          {/* Header */}
          <div className="p-6 border-b border-surface-variant/20 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-[22px] font-extrabold text-on-surface tracking-tight">Invoices</h2>
                <p className="text-[12px] text-on-surface-variant/50 mt-0.5 uppercase tracking-widest font-bold">
                  {invoices.length} records
                </p>
              </div>
              <button
                onClick={() => navigate('/bookings')}
                className="flex items-center gap-1 bg-primary px-3 py-2 rounded-xl text-white text-[12px] font-bold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Booking
              </button>
            </div>

            {/* Revenue summary */}
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-[11px] font-bold text-primary/60 uppercase tracking-widest">Total Revenue</p>
                <p className="text-[20px] font-extrabold text-primary tracking-tight">₹{fmt(totalRevenue)}</p>
              </div>
              <span className="material-symbols-outlined text-primary/30 text-[36px]">payments</span>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search guest, room, invoice..."
                className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/20 rounded-xl text-[13px] text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/50 gap-3">
                <span className="material-symbols-outlined text-[40px] animate-spin">progress_activity</span>
                <p className="text-[13px] font-medium">Loading…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant/40 gap-3">
                <span className="material-symbols-outlined text-[48px]">receipt_long</span>
                <p className="text-[13px] font-bold text-center">
                  {search ? 'No results found' : 'No invoices yet'}
                </p>
                <p className="text-[11px] text-center text-on-surface-variant/30">
                  {!search && 'Invoices appear after guest checkout.'}
                </p>
              </div>
            ) : (
              filtered.map(inv => {
                const active = selected?.id === inv.id
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelected(inv)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                      active
                        ? 'bg-primary/5 border-primary/30'
                        : 'bg-white border-surface-variant/20 hover:border-primary/20 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`text-[15px] font-bold tracking-tight ${active ? 'text-primary' : 'text-on-surface'}`}>
                          {inv.guest_name}
                        </p>
                        <p className="text-[12px] text-on-surface-variant/60 font-medium mt-0.5">
                          Room {inv.room_number} · {inv.room_type} · {inv.total_nights}N
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-outline/40 uppercase tracking-widest shrink-0 ml-2">
                        {invoiceNo(inv.id)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[18px] font-extrabold text-on-surface">₹{fmt(inv.total_amount)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-on-surface-variant/40 font-medium">
                          {formatDateShort(inv.issued_at)}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">
                          Paid
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 bg-[#f0f4f8] p-8 overflow-y-auto custom-scrollbar flex flex-col items-center print:p-0 print:bg-white print:overflow-visible">

          {!selected && !loading ? (
            <div className="print:hidden flex flex-col items-center justify-center h-full text-on-surface-variant/40 gap-4">
              <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px]">receipt_long</span>
              </div>
              <p className="text-[16px] font-semibold">Select an invoice to preview</p>
            </div>
          ) : selected ? (
            <div className="w-full max-w-[800px]">

              {/* Toolbar */}
              <div className="print:hidden flex justify-between items-center mb-6">
                <div>
                  <p className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">Invoice Preview</p>
                  <h2 className="text-[20px] font-extrabold text-on-surface tracking-tight">
                    {selected.guest_name} — {invoiceNo(selected.id)}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toast('PDF export coming soon.')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-surface-variant/30 rounded-xl text-[13px] font-bold text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    PDF
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-[13px] font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">local_printshop</span>
                    Print
                  </button>
                </div>
              </div>

              {/* ── Invoice Document ── */}
              <div
                id="invoice-print"
                className="bg-white rounded-3xl shadow-xl shadow-black/5 overflow-hidden border border-white print:rounded-none print:shadow-none"
              >
                {/* Top accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-primary via-blue-400 to-primary/60" />

                <div className="p-12 print:p-10 space-y-10">

                  {/* ── Invoice Header ── */}
                  <div className="flex justify-between items-start">
                    {/* Hotel info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            corporate_fare
                          </span>
                        </div>
                        <div>
                          <h2 className="text-[22px] font-black text-on-surface tracking-tighter uppercase leading-none">
                            Hotel PMS
                          </h2>
                          <p className="text-[11px] font-bold text-primary tracking-widest mt-0.5">
                            Excellence Suite
                          </p>
                        </div>
                      </div>
                      <div className="text-[13px] text-on-surface-variant/70 leading-relaxed space-y-0.5">
                        <p>Nagpur, Maharashtra — 440001</p>
                        <p>📞 +91 83299 19671</p>
                        <p>✉ accounts@hotelpms.com</p>
                        <p>🌐 hotel-pms-red.vercel.app</p>
                      </div>
                    </div>

                    {/* Invoice meta */}
                    <div className="text-right space-y-3">
                      <div>
                        <p className="text-[52px] font-black text-primary/8 tracking-tighter leading-none select-none">
                          INVOICE
                        </p>
                      </div>
                      <div className="space-y-1.5 text-[13px]">
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Invoice No.</span>
                          <span className="font-black text-on-surface text-[14px]">{invoiceNo(selected.id)}</span>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Issued On</span>
                          <span className="font-bold text-on-surface">{formatDate(selected.issued_at)}</span>
                        </div>
                        <div className="flex items-center justify-end gap-3">
                          <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Booking Ref</span>
                          <span className="font-bold text-on-surface font-mono text-[12px]">
                            {selected.booking_id?.slice(-10).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-end mt-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-black rounded-full border border-emerald-200 uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            PAID IN FULL
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Bill To + Stay Details ── */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Bill To */}
                    <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/30 p-6 space-y-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Bill To</p>
                      <div className="space-y-1.5">
                        <p className="text-[20px] font-extrabold text-on-surface tracking-tight leading-tight">
                          {selected.guest_name}
                        </p>
                        {selected.guest_email && (
                          <p className="text-[13px] text-on-surface-variant font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40">mail</span>
                            {selected.guest_email}
                          </p>
                        )}
                        {selected.guest_phone && (
                          <p className="text-[13px] text-on-surface-variant font-medium flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40">phone</span>
                            {selected.guest_phone}
                          </p>
                        )}
                        <p className="text-[13px] text-on-surface-variant font-medium flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40">group</span>
                          {selected.num_guests || 1} Guest{(selected.num_guests || 1) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Stay Details */}
                    <div className="bg-surface-container-lowest rounded-2xl border border-surface-variant/30 p-6 space-y-4">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Stay Details</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Check-In</p>
                          <p className="text-[14px] font-bold text-on-surface">{formatDateShort(selected.check_in_date)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Check-Out</p>
                          <p className="text-[14px] font-bold text-on-surface">{formatDateShort(selected.check_out_date)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Duration</p>
                          <p className="text-[14px] font-bold text-on-surface">
                            {selected.total_nights} Night{selected.total_nights !== 1 ? 's' : ''}
                            <span className="text-[12px] text-on-surface-variant/50 font-medium ml-1">
                              / {selected.total_nights + 1} Days
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Room</p>
                          <p className="text-[14px] font-bold text-on-surface">
                            #{selected.room_number}
                            <span className="text-[12px] text-on-surface-variant/50 font-medium ml-1">{selected.room_type}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Line Items ── */}
                  <div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-on-surface/10">
                          <th className="text-left pb-4 text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">
                            Description
                          </th>
                          <th className="text-center pb-4 text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">
                            Unit
                          </th>
                          <th className="text-center pb-4 text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">
                            Qty
                          </th>
                          <th className="text-right pb-4 text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">
                            Rate
                          </th>
                          <th className="text-right pb-4 text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Room accommodation line */}
                        <tr className="border-b border-surface-variant/20">
                          <td className="py-6">
                            <p className="text-[15px] font-extrabold text-on-surface">
                              {selected.room_type} Room Accommodation
                            </p>
                            <p className="text-[12px] text-on-surface-variant/60 mt-1">
                              Room #{selected.room_number} · {formatDateShort(selected.check_in_date)} → {formatDateShort(selected.check_out_date)}
                            </p>
                          </td>
                          <td className="py-6 text-center text-[13px] font-bold text-on-surface-variant">
                            Night
                          </td>
                          <td className="py-6 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary font-black text-[14px] rounded-lg">
                              {selected.total_nights}
                            </span>
                          </td>
                          <td className="py-6 text-right text-[14px] font-bold text-on-surface-variant">
                            ₹{fmt(selected.price_per_night)}
                          </td>
                          <td className="py-6 text-right text-[15px] font-extrabold text-on-surface">
                            ₹{fmt(selected.room_charges)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* ── Totals ── */}
                  <div className="flex justify-end">
                    <div className="w-[300px] space-y-3">
                      {/* Subtotal */}
                      <div className="flex justify-between items-center py-2 border-b border-surface-variant/20">
                        <span className="text-[13px] font-bold text-on-surface-variant">Subtotal</span>
                        <span className="text-[14px] font-bold text-on-surface">₹{fmt(selected.room_charges)}</span>
                      </div>

                      {/* Tax breakdown */}
                      <div className="flex justify-between items-center py-2 border-b border-surface-variant/20">
                        <div>
                          <span className="text-[13px] font-bold text-on-surface-variant">GST (18%)</span>
                          <p className="text-[10px] text-on-surface-variant/40 mt-0.5">CGST 9% + SGST 9%</p>
                        </div>
                        <span className="text-[14px] font-bold text-on-surface">₹{fmt(selected.tax)}</span>
                      </div>

                      {/* Grand Total */}
                      <div className="bg-primary rounded-2xl p-5 text-white">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-black uppercase tracking-[0.25em] opacity-70">
                            Total Payable
                          </span>
                          <span className="text-[11px] font-bold opacity-50">INR</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                          <span className="text-[13px] font-medium opacity-60">Amount Due</span>
                          <span className="text-[36px] font-black tracking-tighter">
                            ₹{fmt(selected.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Stay Summary Bar ── */}
                  <div className="grid grid-cols-4 gap-4 bg-surface-container-lowest rounded-2xl border border-surface-variant/20 p-5">
                    {[
                      { label: 'Room Rate', value: `₹${fmt(selected.price_per_night)}/night`, icon: 'bed' },
                      { label: 'Nights Stayed', value: `${selected.total_nights} Night${selected.total_nights !== 1 ? 's' : ''}`, icon: 'nights_stay' },
                      { label: 'Room Charges', value: `₹${fmt(selected.room_charges)}`, icon: 'hotel' },
                      { label: 'Tax (18% GST)', value: `₹${fmt(selected.tax)}`, icon: 'receipt' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="text-center space-y-1">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                          <span className="material-symbols-outlined text-primary text-[16px]">{icon}</span>
                        </div>
                        <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">{label}</p>
                        <p className="text-[13px] font-extrabold text-on-surface">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* ── Footer ── */}
                  <div className="grid grid-cols-5 gap-8 items-end pt-4 border-t border-surface-variant/20">
                    <div className="col-span-3 space-y-3">
                      <p className="text-[10px] font-black text-on-surface uppercase tracking-[0.2em]">
                        Terms & Conditions
                      </p>
                      <p className="text-[12px] text-on-surface-variant/60 leading-relaxed">
                        This is a system-generated invoice and does not require a physical signature.
                        Payment is deemed complete upon checkout. For disputes, contact us within 7 days
                        of invoice date. GST included as per applicable rates.
                      </p>
                      <p className="text-[11px] text-on-surface-variant/40 font-medium">
                        Thank you for choosing Hotel PMS. We hope to see you again!
                      </p>
                    </div>
                    <div className="col-span-2 text-right space-y-2">
                      <div className="h-14 flex items-end justify-end pr-4">
                        <p className="font-serif italic text-[22px] text-primary/30 select-none">
                          Authorized
                        </p>
                      </div>
                      <div className="inline-block border-t-2 border-on-surface/20 pt-2 pl-8">
                        <p className="text-[10px] font-black text-on-surface/50 uppercase tracking-[0.3em]">
                          Authorized Signatory
                        </p>
                        <p className="text-[11px] font-bold text-on-surface/40 mt-0.5">Hotel PMS</p>
                      </div>
                    </div>
                  </div>

                  {/* Document stamp */}
                  <div className="flex items-center justify-between pt-4 border-t border-surface-variant/10">
                    <span className="text-[10px] font-black text-outline/30 uppercase tracking-widest">
                      {invoiceNo(selected.id)} · System Generated · Hotel PMS
                    </span>
                    <span className="text-[10px] font-black text-outline/30 uppercase tracking-widest">
                      {formatDate(selected.issued_at)}
                    </span>
                  </div>

                </div>
              </div>
              {/* end invoice doc */}

            </div>
          ) : null}
        </div>

      </div>
    </Layout>
  )
}
