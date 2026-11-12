import React, { useState, useEffect } from 'react';
import { API_URL } from '../App';

export default function StudentDashboard({ user, onLogout }) {
  const [habits, setHabits] = useState({ bangunPagi: false, ibadah: false, membaca: false, tidurAwal: false, membantu: false });
  const [loading, setLoading] = useState(false);
  
  // State untuk mengunci (lock) dashboard jika hari ini sudah isi
  const [isDoneToday, setIsDoneToday] = useState(false);
  const [savedBintang, setSavedBintang] = useState(0);

  useEffect(() => {
    // Mengecek apakah siswa sudah mengisi jurnal hari ini saat pertama kali dashboard dibuka
    const checkStatus = async () => {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'check_jurnal', nisn: user.nisn }),
        });
        const data = await res.json();
        if (data.success && data.sudah_isi) {
          setIsDoneToday(true);
          setSavedBintang(data.totalBintang);
          setHabits(data.detail); // Tampilkan hasil pilihan mereka tadi
        }
      } catch (err) {
        console.error("Gagal mengecek status jurnal");
      }
    };
    checkStatus();
  }, [user.nisn]);

  const toggleHabit = (key) => {
    if (isDoneToday) return; // Kunci toggle jika sudah selesai
    setHabits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const totalBintang = isDoneToday ? savedBintang : Object.values(habits).filter(Boolean).length;

  const handleSubmit = async () => {
    if (totalBintang === 0) return alert('Pilih minimal 1 misi yang kamu selesaikan hari ini!');
    
    setLoading(true);
    const payload = { nisn: user.nisn, nama: user.nama, kelas: user.kelas, habits, totalBintang };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'submit_jurnal', ...payload })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsDoneToday(true);
        setSavedBintang(totalBintang);
        // Kita tidak auto-logout agar siswa bisa menikmati layar "Sukses" dan melihat bintangnya
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Gagal mengirim jurnal. Periksa koneksi internet.');
    }
    setLoading(false);
  };

  const labels = {
    bangunPagi: "🌞 Bangun Pagi Tepat Waktu",
    ibadah: "🕌 Rajin Beribadah",
    membaca: "📖 Membaca Buku/Pelajaran",
    membantu: "🤝 Membantu Orang Tua",
    tidurAwal: "🌙 Tidur Tidak Begadang"
  };

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border-2 border-blue-100">
        <div>
          <span className="block text-xs font-bold text-blue-400 uppercase tracking-wider">Pendekar J-SIKAP</span>
          <span className="font-extrabold text-blue-900 text-xl">{user.nama}</span>
        </div>
        <button onClick={onLogout} className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
          Keluar
        </button>
      </div>

      <div className="flex flex-col items-center py-4 bg-amber-50 rounded-2xl border-2 border-amber-100">
        <span className="text-amber-800 font-bold mb-2">Bintang Hari Ini:</span>
        <div className="flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-5xl transition-all duration-500 transform ${i < totalBintang ? 'text-amber-400 scale-110 drop-shadow-md' : 'text-amber-100 scale-100'}`}>
              ★
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {Object.keys(habits).map((key) => (
          <button 
            key={key} 
            type="button"
            onClick={() => toggleHabit(key)}
            disabled={isDoneToday}
            className={`flex items-center justify-between p-4 border-2 rounded-2xl text-left transition-all ${
              habits[key] 
                ? 'border-green-400 bg-green-50 shadow-sm' 
                : 'border-slate-100 bg-slate-50 hover:border-blue-200'
            } ${isDoneToday && !habits[key] ? 'opacity-50 grayscale' : ''}`}
          >
            <span className={`font-bold text-lg ${habits[key] ? 'text-green-800' : 'text-slate-600'}`}>
              {labels[key]}
            </span>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 ${
              habits[key] ? 'border-green-500 bg-green-500' : 'border-slate-300 bg-white'
            }`}>
              {habits[key] && <span className="text-white text-xl font-bold">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {isDoneToday ? (
        <div className="mt-2 bg-green-500 text-white text-center font-bold py-4 rounded-2xl shadow-lg border-b-4 border-green-700">
          🎉 MISI HARI INI SELESAI! 🎉
        </div>
      ) : (
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="mt-2 w-full bg-blue-600 text-white font-extrabold py-5 rounded-2xl hover:bg-blue-700 disabled:bg-slate-400 transition-all shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 text-lg"
        >
          {loading ? 'MENGIRIM...' : 'KIRIM JURNAL HARI INI'}
        </button>
      )}
    </div>
  );
}