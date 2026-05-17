'use client'

import { useState, useCallback } from 'react'
import { Plus, Shield, UserCheck, UserX, Key, Trash2 } from 'lucide-react'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { getUsers, saveUsers, generateId, refreshSessionPermissions } from '@/lib/auth'
import { PERMISSION_LABELS, ALL_PERMISSIONS } from '@/lib/permissions'
import type { AdminUser, PermissionKey } from '@/lib/types'
import Modal from '@/components/admin/shared/Modal'
import SlideOver from '@/components/admin/shared/SlideOver'
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog'
import { ToastProvider, useToast } from '@/components/admin/shared/Toast'
import { useAuth } from '@/contexts/AuthContext'

function PermissionToggle({ keyName, checked, onChange }: { keyName: PermissionKey; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
      <span className="text-sm font-medium text-gray-700">{PERMISSION_LABELS[keyName]}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </label>
  )
}

function DelegationContent() {
  const { toast } = useToast()
  const { session, isOwner, refreshSession } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>(() => getUsers().filter(u => u.role !== 'owner'))
  const [showAdd, setShowAdd] = useState(false)
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [resetTarget, setResetTarget] = useState<AdminUser | null>(null)

  // Add form
  const [fName, setFName] = useState('')
  const [fUsername, setFUsername] = useState('')
  const [fPassword, setFPassword] = useState('')
  const [fConfirm, setFConfirm] = useState('')
  const [fPerms, setFPerms] = useState<PermissionKey[]>([])
  const [fNotes, setFNotes] = useState('')
  const [fErrors, setFErrors] = useState<Record<string, string>>({})
  const [successInfo, setSuccessInfo] = useState<{ username: string; password: string } | null>(null)

  // Edit perms
  const [editPerms, setEditPerms] = useState<PermissionKey[]>([])

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <p className="font-black text-gray-700 text-lg">Akses Terbatas</p>
        <p className="text-gray-400 text-sm mt-1">
          Halaman ini hanya bisa diakses oleh pemilik usaha.
        </p>
      </div>
    )
  }

  const allUsers = getUsers()

  function validateAdd(): boolean {
    const e: Record<string, string> = {}
    if (!fName.trim()) e.name = 'Nama wajib diisi'
    if (!fUsername.trim()) e.username = 'Username wajib diisi'
    else if (!/^[a-z0-9_]{3,}$/.test(fUsername.trim())) e.username = 'Username: lowercase, min 3 karakter, tanpa spasi'
    else if (allUsers.some(u => u.username === fUsername.trim())) e.username = 'Username sudah digunakan'
    if (!fPassword) e.password = 'Password wajib diisi'
    else if (fPassword.length < 8) e.password = 'Password minimal 8 karakter'
    if (fPassword !== fConfirm) e.confirm = 'Password tidak cocok'
    setFErrors(e)
    return Object.keys(e).length === 0
  }

  const addAdmin = useCallback(() => {
    if (!validateAdd()) return
    const newUser: AdminUser = {
      id: generateId(),
      name: fName.trim(),
      username: fUsername.trim(),
      passwordHash: btoa(fPassword),
      role: 'admin',
      permissions: fPerms,
      isActive: true,
      createdAt: new Date().toISOString(),
      notes: fNotes.trim(),
    }
    const updated = [...allUsers, newUser]
    saveUsers(updated)
    setUsers(updated.filter(u => u.role !== 'owner'))
    setSuccessInfo({ username: fUsername.trim(), password: fPassword })
    setShowAdd(false)
    setFName(''); setFUsername(''); setFPassword(''); setFConfirm(''); setFPerms([]); setFNotes(''); setFErrors({})
  }, [fName, fUsername, fPassword, fConfirm, fPerms, fNotes, allUsers])

  const toggleActive = useCallback((user: AdminUser) => {
    const updated = allUsers.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u)
    saveUsers(updated)
    setUsers(updated.filter(u => u.role !== 'owner'))
    toast(user.isActive ? 'Akun dinonaktifkan' : 'Akun diaktifkan')
  }, [allUsers, toast])

  const deleteAdmin = useCallback((user: AdminUser) => {
    const updated = allUsers.filter(u => u.id !== user.id)
    saveUsers(updated)
    setUsers(updated.filter(u => u.role !== 'owner'))
    setDeleteTarget(null)
    toast('Akun admin dihapus', 'info')
  }, [allUsers, toast])

  const resetPassword = useCallback((user: AdminUser) => {
    const newPw = Math.random().toString(36).slice(2, 10)
    const updated = allUsers.map(u => u.id === user.id ? { ...u, passwordHash: btoa(newPw) } : u)
    saveUsers(updated)
    setResetTarget(null)
    setSuccessInfo({ username: user.username, password: newPw })
    toast('Password berhasil direset')
  }, [allUsers, toast])

  const saveEditPerms = useCallback(() => {
    if (!editUser) return
    const updated = allUsers.map(u => u.id === editUser.id ? { ...u, permissions: editPerms } : u)
    saveUsers(updated)
    setUsers(updated.filter(u => u.role !== 'owner'))
    if (session?.userId === editUser.id) {
      refreshSessionPermissions(editUser.id)
      refreshSession()
    }
    setEditUser(null)
    toast('Izin akses berhasil diperbarui')
  }, [editUser, editPerms, allUsers, session, refreshSession, toast])

  function openEdit(user: AdminUser) {
    setEditUser(user)
    setEditPerms([...user.permissions])
  }

  function togglePerm(key: PermissionKey, arr: PermissionKey[], setArr: (v: PermissionKey[]) => void) {
    if (arr.includes(key)) setArr(arr.filter(k => k !== key))
    else setArr([...arr, key])
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-gray-900">Delegasi Admin</h1>
          <p className="text-sm text-gray-500 mt-0.5">Kelola sub-admin dan izin akses mereka</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors"
        >
          <Plus size={15} />
          Tambah Sub-Admin
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Admin</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-3 hidden md:table-cell">Dibuat</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-3">Izin Aktif</th>
                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-3 py-3">Status</th>
                <th className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="font-semibold text-gray-500">Belum ada sub-admin</p>
                    <p className="text-gray-400 text-xs mt-1">Tambah sub-admin untuk mendelegasikan pekerjaan</p>
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-bold text-gray-800">{u.name}</p>
                      <p className="text-xs text-gray-400 font-mono">@{u.username}</p>
                      {u.notes && <p className="text-xs text-gray-400 mt-0.5">{u.notes}</p>}
                    </td>
                    <td className="px-3 py-3 text-gray-500 text-xs hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.permissions.length === 0 ? (
                          <span className="text-xs text-gray-400">Tidak ada izin</span>
                        ) : (
                          u.permissions.map(p => (
                            <span key={p} className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                              {PERMISSION_LABELS[p].split(' ').slice(0, 2).join(' ')}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {u.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(u)} title="Edit izin" aria-label="Edit izin" className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Shield size={15} /></button>
                        <button onClick={() => setResetTarget(u)} title="Reset password" aria-label="Reset password" className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"><Key size={15} /></button>
                        <button onClick={() => toggleActive(u)} title={u.isActive ? 'Nonaktifkan' : 'Aktifkan'} aria-label={u.isActive ? 'Nonaktifkan akun' : 'Aktifkan akun'} className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                          {u.isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button onClick={() => setDeleteTarget(u)} title="Hapus" aria-label="Hapus akun" className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Tambah Sub-Admin Baru" maxWidth="max-w-lg">
        <div className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="fName" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
            <input id="fName" type="text" value={fName} onChange={e => setFName(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama admin baru" />
            {fErrors.name && <p className="text-red-500 text-xs mt-1">{fErrors.name}</p>}
          </div>
          <div>
            <label htmlFor="fUsername" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Username</label>
            <input id="fUsername" type="text" value={fUsername} onChange={e => setFUsername(e.target.value.toLowerCase())} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="admin2" />
            {fErrors.username && <p className="text-red-500 text-xs mt-1">{fErrors.username}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="fPassword" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
              <input id="fPassword" type="password" value={fPassword} onChange={e => setFPassword(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="min 8 karakter" />
              {fErrors.password && <p className="text-red-500 text-xs mt-1">{fErrors.password}</p>}
            </div>
            <div>
              <label htmlFor="fConfirm" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Konfirmasi</label>
              <input id="fConfirm" type="password" value={fConfirm} onChange={e => setFConfirm(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ulangi password" />
              {fErrors.confirm && <p className="text-red-500 text-xs mt-1">{fErrors.confirm}</p>}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Izin Akses</p>
            <div className="space-y-2">
              {ALL_PERMISSIONS.map(key => (
                <PermissionToggle key={key} keyName={key} checked={fPerms.includes(key)} onChange={() => togglePerm(key, fPerms, setFPerms)} />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="fNotes" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Catatan (opsional)</label>
            <textarea id="fNotes" value={fNotes} onChange={e => setFNotes(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Deskripsi peran admin ini..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={addAdmin} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors">Simpan</button>
          </div>
        </div>
      </Modal>

      {/* Edit Permissions SlideOver */}
      <SlideOver open={!!editUser} onClose={() => setEditUser(null)} title={`Edit Izin: ${editUser?.name}`}>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-500">Atur izin akses untuk <strong>{editUser?.name}</strong> (@{editUser?.username})</p>
          <div className="space-y-2">
            {ALL_PERMISSIONS.map(key => (
              <PermissionToggle key={key} keyName={key} checked={editPerms.includes(key)} onChange={() => togglePerm(key, editPerms, setEditPerms)} />
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setEditUser(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">Batal</button>
            <button onClick={saveEditPerms} className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors">Simpan Izin</button>
          </div>
        </div>
      </SlideOver>

      {/* Success modal (show credentials) */}
      <Modal open={!!successInfo} onClose={() => setSuccessInfo(null)} title="Akun Berhasil Dibuat">
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-gray-600">Berikut informasi akun sub-admin. Kirimkan ke yang bersangkutan:</p>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 font-mono text-sm space-y-2">
            <div className="flex justify-between"><span className="text-blue-500">Username:</span><span className="font-black text-blue-800">{successInfo?.username}</span></div>
            <div className="flex justify-between"><span className="text-blue-500">Password:</span><span className="font-black text-blue-800">{successInfo?.password}</span></div>
          </div>
          <p className="text-xs text-gray-400">Simpan info ini dengan aman. Password tidak dapat dilihat lagi setelah ditutup.</p>
          <button onClick={() => setSuccessInfo(null)} className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-colors">Tutup</button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Hapus Akun Admin"
        message={`Hapus akun @${deleteTarget?.username}? Tindakan ini permanen.`}
        confirmLabel="Ya, Hapus"
        danger
        onConfirm={() => deleteTarget && deleteAdmin(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Reset Password Confirm */}
      <ConfirmDialog
        open={!!resetTarget}
        title="Reset Password"
        message={`Reset password @${resetTarget?.username}? Password baru akan digenerate otomatis.`}
        confirmLabel="Ya, Reset"
        onConfirm={() => resetTarget && resetPassword(resetTarget)}
        onCancel={() => setResetTarget(null)}
      />
    </div>
  )
}

export default function DelegationPage() {
  return (
    <ToastProvider>
      <DelegationContent />
    </ToastProvider>
  )
}
