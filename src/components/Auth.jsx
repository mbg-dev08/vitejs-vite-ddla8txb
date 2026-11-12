import React, { useState } from 'react';
import { API_URL } from '../App';

export default function Auth({ onLoginSuccess }) {
  const [role, setRole] = useState('');
  const [username, setUsername] = useState(''); // Berfungsi sebagai NISN atau Kode Guru
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // State untuk force ganti password perdana
  const [needsNewPassword, setNeedsNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  const NOMOR_WA_GURU = '6281234567890'; // Ganti dengan nomor WA sekolah/admin

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        redirect: 'follow', // Memaksa browser mengikuti pengalihan Google
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // Kunci wajib untuk menembus CORS Google
        },
        body: JSON.stringify({ action: 'login', role, username, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        if (data.require_new_password) {
          setTempUserData({ ...data, password_lama: password });
          setNeedsNewPassword(true);
        } else {
          onLoginSuccess(data);
        }
      } else {
        alert(data.message || 'Gagal login. Periksa kembali data Anda.');
      }
    } catch (err) {
      alert('EROR ASLI: ' + err.message);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 4) return alert('Password minimal 4 karakter!');
    
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'change_password', role: tempUserData.role, nisn: tempUserData.nisn, newPassword }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Password berhasil diperbarui! Selamat datang di J-SIKAP.');
        onLoginSuccess(tempUserData);
      } else {
        alert('Gagal memperbarui password.');
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi saat mengganti password.');
    }
    setLoading(false);
  };

  const handleLupaPassword = () => {
    const text = `Halo Bapak/Ibu Guru, saya lupa password aplikasi J-SIKAP. Mohon direset ke password standar.%0A%0ARole:%20${role || '[Siswa/Orang Tua]'}%0ANISN:%20${username || '[Isi NISN]'}`;
    window.open(`https://wa.me/${NOMOR_WA_GURU}?text=${text}`, '_blank');
  };

  // Tampilan Form Ganti Password
  if (needsNewPassword) {
    return (
      <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4">
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-200">
          <strong>Keamanan Akun:</strong> Anda masih menggunakan sandi standar. Silakan buat sandi baru (minimal 4 karakter).
        </div>
        <input
          type="text"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Ketik Sandi Baru Anda"
          className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white outline-none w-full text-center text-xl tracking-widest font-bold"
          required
        />
        <button type="submit" disabled={loading} className="bg-green-500 text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-colors shadow-lg">
          {loading ? 'Menyimpan...' : 'SIMPAN & MASUK'}
        </button>
      </form>
    );
  }

  // Tampilan Pilih Role
  if (!role) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-center font-bold text-slate-500 mb-2">Masuk Sebagai Apa?</h2>
        {['Siswa', 'Orang Tua', 'Guru'].map((r) => (
          <button key={r} onClick={() => setRole(r)} className="bg-blue-50 text-blue-700 border-2 border-blue-100 font-bold py-4 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
            {r}
          </button>
        ))}
      </div>
    );
  }

  // Tampilan Form Login Dinamis
  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg mb-2">
        <span className="text-sm font-semibold text-blue-800 ml-2">Mode: {role}</span>
        <button type="button" onClick={() => setRole('')} className="text-xs bg-white px-3 py-1 rounded-md text-slate-500 hover:bg-slate-200">Ganti</button>
      </div>

      <input
        type="text"
        inputMode="numeric"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={role === 'Guru' ? "Kode Guru" : "Masukkan NISN"}
        className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none w-full text-lg"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={role === 'Orang Tua' ? "PIN Wali" : "Password"}
        className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-500 outline-none w-full text-lg"
        required
      />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg mt-2 text-lg">
        {loading ? 'Memeriksa...' : 'MASUK'}
      </button>
      
      {role !== 'Guru' && (
        <button type="button" onClick={handleLupaPassword} className="text-sm text-slate-400 hover:text-blue-600 mt-2">
          Lupa Sandi? Hubungi Guru
        </button>
      )}
    </form>
  );
}