import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Fixed sidebar — hidden on print via print:hidden in Sidebar.jsx */}
      <Sidebar />

      {/* Main content offset by sidebar width */}
      <main className="ml-[280px] w-[calc(100%-280px)] min-h-screen flex flex-col overflow-auto px-8 py-6">
        {children}
      </main>
    </div>
  )
}
