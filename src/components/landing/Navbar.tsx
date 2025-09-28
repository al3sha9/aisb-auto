export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm w-full flex items-center justify-between px-6 py-3">
      <div className="font-bold text-xl tracking-tight">AISB Selection</div>
      <a href="/admin/dashboard" className="text-gray-700 font-medium hover:text-primary transition">Dashboard</a>
    </nav>
  );
}
