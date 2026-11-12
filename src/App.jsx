import React, { useState } from 'react';
import Auth from './components/Auth';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';
// import ParentDashboard from './components/ParentDashboard'; // Kita buka nanti

// GANTI DENGAN URL DEPLOYMENT GOOGLE APPS SCRIPT ANDA YANG TERBARU DARI GMAIL PRIBADI
export const API_URL = 'https://script.google.com/macros/s/AKfycbzzZ38krre6bprH283AvY4dbP6nAHZVEsIobpuGJduyiQ4ET9h3L9-6VmSYdQJjPNbSJQ/exec';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => setUser(null);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header Aplikasi */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white text-center">
          <h1 className="text-3xl font-black tracking-tight drop-shadow-md">J-SIKAP</h1>
          <p className="text-blue-100 mt-1 text-sm font-medium">Jurnal Siswa Kalijaga Permai</p>
        </div>
        
        <div className="p-6">
          {!user ? (
            <Auth onLoginSuccess={setUser} />
          ) : (
            <>
              {user.role === 'Siswa' && <StudentDashboard user={user} onLogout={handleLogout} />}
              
              {user.role === 'Guru' && <TeacherDashboard user={user} onLogout={handleLogout} />}
              
              {user.role === 'Orang Tua' && (
                 <div className="text-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-500 font-bold mb-4">Dashboard Orang Tua (Sedang dibangun...)</p>
                   <button onClick={handleLogout} className="text-blue-600 font-bold hover:underline">
                     Keluar
                   </button>
                 </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}