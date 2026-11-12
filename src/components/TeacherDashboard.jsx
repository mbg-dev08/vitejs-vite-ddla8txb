import React, { useState, useEffect } from 'react';
import { API_URL } from '../App';

export default function TeacherDashboard({ user, onLogout }) {
  // Set default tanggal hari ini 
  const today = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(today);
  const [dataRekap, setDataRekap] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRekap = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'get_rekap_kelas', kelas: user.kelas, tanggal }),
      });
      const data = await res.json();
      
      if (data.success) {
        setDataRekap(data.data);
      } else {
        alert('Gagal mengambil data kelas');
      }
    } catch (err) {
      alert('Koneksi terputus. Periksa jaringan Anda.');
    }
    setLoading(false);
  };

  // Tarik data otomatis setiap kali komponen dirender atau tanggal diganti
  useEffect(() => {
    fetchRekap();
  }, [tanggal]);

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Header Guru */}
      <div className="flex justify-between items-center bg-blue-800 text-white p-4 rounded-2xl shadow-md">
        <div>
          <span className="block text-xs font-bold text-blue-200 uppercase tracking-wider">Ruang Wali Kelas {user.kelas}</span>
          <span className="font-extrabold text-xl">{user.nama}</span>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all shadow-sm">
          Keluar
        </button>
      </div>

      {/* Filter Tanggal */}
      <div className="bg-slate-50 p-4 rounded-2xl border-2 border-slate-200 flex flex-col gap-2">
        <label className="font-bold text-slate-600 text-sm">Cek Jurnal Tanggal:</label>
        <div className="flex gap-2">
          <input 
            type="date" 
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="p-3 rounded-xl border-2 border-slate-300 w-full font-bold text-slate-700 outline-none focus:border-blue-500"
          />
          <button onClick={fetchRekap} className="bg-blue-100 text-blue-700 px-4 rounded-xl font-bold hover:bg-blue-200 transition-colors">
            ↻
          </button>
        </div>
      </div>

      {/* Tabel Rekapitulasi */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-100 p-3 border-b-2 border-slate-200 flex justify-between items-center">
          <span className="font-bold text-slate-700">Telah Mengisi</span>
          <span className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            {dataRekap.length} Siswa
          </span>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-bold animate-pulse">Menarik data...</div>
        ) : dataRekap.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium">Belum ada jurnal yang masuk pada tanggal ini.</div>
        ) : (
          <ul className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {dataRekap.map((siswa, idx) => (
              <li key={idx} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">{siswa.nama}</span>
                  <span className="text-xs text-slate-400 font-mono">NISN: {siswa.nisn}</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100">
                  <span className="text-amber-500 font-black text-lg">{siswa.totalBintang}</span>
                  <span className="text-amber-400 text-xl drop-shadow-sm">★</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}