'use client'

import { useState, useCallback } from 'react'
import { Plus, Shield, UserCheck, UserX, Key, Trash2 } from 'lucide-react'
import { getUsers, saveUsers, generateId, refreshSessionPermissions } from '@/lib/auth'
import { PERMISSION_LABELS, ALL_PERMISSIONS } from '@/lib/permissions'
import type { AdminUser, PermissionKey } from '@/lib/types'
import Modal from '@/components/admin/shared/Modal'
import SlideOver from '@/components/admin/shared/SlideOver'
import ConfirmDialog from '@/components/admin/shared/ConfirmDialog'
import { ToastProvider, useToast } from '@/components/admin/shared/Toast'
import { useAuth } from '@/contexts/AuthContext'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #ddd9d3',
  borderRadius: '10px',
  background: '#ffffff',
  color: '#100e0b',
  fontSize: '0.875rem',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
}

const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#4f46e5'
    e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#ddd9d3'
    e.target.style.boxShadow = 'none'
  },
}

function PermissionToggle({
  keyName, checked, onChange,
}: {
  keyName: PermissionKey; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label
      className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors"
      style={{
        border: checked ? '1px solid rgba(79,70,229,0.25)' : '1px solid #e8e4de',
        background: checked ? 'rgba(79,70,229,0.04)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!checked) (e.currentTarget as HTMLElement).style.background = '#faf9f7'
      }}
      onMouseLeave={e => {
        if (!checked) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <span className="text-sm font-medium" style={{ color: '#100e0b' }}>
        {PERMISSION_LABELS[keyName]}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
        style={{ background: checked ? '#4f46e5' : '#ddd9d3' }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
        />
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

  const [fName, setFName] = useState('')
  const [fUsername, setFUsername] = useState('')
  const [fPassword, setFPassword] = useState('')
  const [fConfirm, setFConfirm] = useState('')
  const [fPerms, setFPerms] = useState<PermissionKey[]>([])
  const [fNotes, setFNotes] = useState('')
  const [fErrors, setFErrors] = useState<Record<string, string>>({})
  const [successInfo, setSuccessInfo] = useState<{ username: string; password: string } | null>(null)
  const [editPerms, setEditPerms] = useState<PermissionKey[]>([])

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-5xl mb-4">🔒</p>
        <p className="font-extrabold text-lg" style={{ color: '#100e0b' }}>Akses Terbatas</p>
        <p className="text-sm mt-1" style={{ color: '#9c9690' }}>
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

  const FieldLabel = ({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) => (
    <label
      htmlFor={htmlFor}
      className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
      style={{ color: '#9c9690' }}
    >
      {children}
    </label>
  )

  return (
    <div className="space-y-5 font-jakarta">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#100e0b' }}>
            Delegasi Admin
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#9c9690' }}>
            Kelola sub-admin dan izin akses mereka
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold transition-all"
          style={{ background: '#4f46e5' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#4338ca'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(79,70,229,0.35)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#4f46e5'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <Plus size={14} />
          Tambah Sub-Admin
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#ffffff', border: '1px solid #e8e4de', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#faf9f7', borderBottom: '1px solid #f0ede8' }}>
                {['Admin', 'Dibuat', 'Izin Aktif', 'Status', 'Aksi'].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3 ${i === 0 ? 'text-left px-5' : i === 1 ? 'text-left px-3 hidden md:table-cell' : i === 2 ? 'text-left px-3' : 'text-center px-3'} ${i === 4 ? 'px-5' : ''}`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9c9690' }}>
                      {h}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <p className="text-4xl mb-3">👥</p>
                    <p className="font-semibold" style={{ color: '#6b6560' }}>Belum ada sub-admin</p>
                    <p className="text-xs mt-1" style={{ color: '#9c9690' }}>
                      Tambah sub-admin untuk mendelegasikan pekerjaan
                    </p>
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr
                    key={u.id}
                    className="table-row-hover transition-colors"
                    style={{ borderBottom: '1px solid #faf9f7' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <td className="px-5 py-3">
                      <p className="font-bold" style={{ color: '#100e0b' }}>{u.name}</p>
                      <p className="text-xs font-mono mt-0.5" style={{ color: '#9c9690' }}>@{u.username}</p>
                      {u.notes && <p className="text-xs mt-0.5" style={{ color: '#9c9690' }}>{u.notes}</p>}
                    </td>
                    <td className="px-3 py-3 text-xs hidden md:table-cell" style={{ color: '#9c9690' }}>
                      {new Date(u.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.permissions.length === 0 ? (
                          <span className="text-xs" style={{ color: '#9c9690' }}>Tidak ada izin</span>
                        ) : (
                          u.permissions.map(p => (
                            <span
                              key={p}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(79,70,229,0.08)', color: '#4f46e5' }}
                            >
                              {PERMISSION_LABELS[p].split(' ').slice(0, 2).join(' ')}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                        style={u.isActive
                          ? { background: 'rgba(22,163,74,0.10)', color: '#15803d' }
                          : { background: '#f0ede8', color: '#9c9690' }
                        }
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: u.isActive ? '#16a34a' : '#c8c3bc' }}
                        />
                        {u.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {[
                          { icon: <Shield size={14} />, label: 'Edit izin', color: '#4f46e5', bg: 'rgba(79,70,229,0.08)', onClick: () => openEdit(u) },
                          { icon: <Key size={14} />, label: 'Reset password', color: '#d97706', bg: 'rgba(217,119,6,0.08)', onClick: () => setResetTarget(u) },
                          {
                            icon: u.isActive ? <UserX size={14} /> : <UserCheck size={14} />,
                            label: u.isActive ? 'Nonaktifkan' : 'Aktifkan',
                            color: '#16a34a',
                            bg: 'rgba(22,163,74,0.08)',
                            onClick: () => toggleActive(u),
                          },
                          { icon: <Trash2 size={14} />, label: 'Hapus', color: '#dc2626', bg: 'rgba(220,38,38,0.08)', onClick: () => setDeleteTarget(u) },
                        ].map((action, idx) => (
                          <button
                            key={idx}
                            onClick={action.onClick}
                            title={action.label}
                            aria-label={action.label}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: '#9c9690' }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = action.bg
                              e.currentTarget.style.color = action.color
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = '#9c9690'
                            }}
                          >
                            {action.icon}
                          </button>
                        ))}
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
          {[
            { id: 'fName', label: 'Nama Lengkap', value: fName, onChange: setFName, placeholder: 'Nama admin baru', error: fErrors.name, type: 'text' },
            { id: 'fUsername', label: 'Username', value: fUsername, onChange: (v: string) => setFUsername(v.toLowerCase()), placeholder: 'admin2', error: fErrors.username, type: 'text' },
          ].map(f => (
            <div key={f.id}>
              <FieldLabel htmlFor={f.id}>{f.label}</FieldLabel>
              <input
                id={f.id}
                type={f.type}
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                placeholder={f.placeholder}
                style={inputStyle}
                {...focusHandlers}
              />
              {f.error && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{f.error}</p>}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'fPassword', label: 'Password', value: fPassword, onChange: setFPassword, placeholder: 'min 8 karakter', error: fErrors.password },
              { id: 'fConfirm', label: 'Konfirmasi', value: fConfirm, onChange: setFConfirm, placeholder: 'ulangi password', error: fErrors.confirm },
            ].map(f => (
              <div key={f.id}>
                <FieldLabel htmlFor={f.id}>{f.label}</FieldLabel>
                <input
                  id={f.id}
                  type="password"
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  placeholder={f.placeholder}
                  style={inputStyle}
                  {...focusHandlers}
                />
                {f.error && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>{f.error}</p>}
              </div>
            ))}
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#9c9690' }}>
              Izin Akses
            </p>
            <div className="space-y-2">
              {ALL_PERMISSIONS.map(key => (
                <PermissionToggle
                  key={key}
                  keyName={key}
                  checked={fPerms.includes(key)}
                  onChange={() => togglePerm(key, fPerms, setFPerms)}
                />
              ))}
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="fNotes">Catatan (opsional)</FieldLabel>
            <textarea
              id="fNotes"
              value={fNotes}
              onChange={e => setFNotes(e.target.value)}
              rows={2}
              placeholder="Deskripsi peran admin ini..."
              style={{ ...inputStyle, resize: 'none' }}
              onFocus={e => {
                e.target.style.borderColor = '#4f46e5'
                e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.08)'
              }}
              onBlur={e => {
                e.target.style.borderColor = '#ddd9d3'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowAdd(false)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'transparent', border: '1px solid #e8e4de', color: '#6b6560' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f7f6f3' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Batal
            </button>
            <button
              onClick={addAdmin}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
              style={{ background: '#4f46e5' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#4338ca'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#4f46e5'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Permissions SlideOver */}
      <SlideOver open={!!editUser} onClose={() => setEditUser(null)} title={`Edit Izin: ${editUser?.name}`}>
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm" style={{ color: '#6b6560' }}>
            Atur izin akses untuk <strong style={{ color: '#100e0b' }}>{editUser?.name}</strong>{' '}
            <span className="font-mono" style={{ color: '#9c9690' }}>(@{editUser?.username})</span>
          </p>
          <div className="space-y-2">
            {ALL_PERMISSIONS.map(key => (
              <PermissionToggle
                key={key}
                keyName={key}
                checked={editPerms.includes(key)}
                onChange={() => togglePerm(key, editPerms, setEditPerms)}
              />
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setEditUser(null)}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'transparent', border: '1px solid #e8e4de', color: '#6b6560' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f7f6f3' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Batal
            </button>
            <button
              onClick={saveEditPerms}
              className="flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
              style={{ background: '#4f46e5' }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#4338ca'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#4f46e5'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              Simpan Izin
            </button>
          </div>
        </div>
      </SlideOver>

      {/* Success modal (credentials) */}
      <Modal open={!!successInfo} onClose={() => setSuccessInfo(null)} title="Akun Berhasil Dibuat" accentColor="#16a34a">
        <div className="px-6 py-5 space-y-4">
          <p className="text-sm" style={{ color: '#6b6560' }}>
            Berikut informasi akun sub-admin. Kirimkan ke yang bersangkutan:
          </p>
          <div
            className="rounded-xl p-4 font-mono text-sm space-y-2"
            style={{ background: '#f0fdf4', border: '1px solid rgba(22,163,74,0.20)' }}
          >
            <div className="flex justify-between">
              <span style={{ color: '#16a34a' }}>Username:</span>
              <span className="font-black" style={{ color: '#15803d' }}>{successInfo?.username}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#16a34a' }}>Password:</span>
              <span className="font-black" style={{ color: '#15803d' }}>{successInfo?.password}</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: '#9c9690' }}>
            Simpan info ini dengan aman. Password tidak dapat dilihat lagi setelah ditutup.
          </p>
          <button
            onClick={() => setSuccessInfo(null)}
            className="w-full px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all"
            style={{ background: '#4f46e5' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#4338ca' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#4f46e5' }}
          >
            Tutup
          </button>
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
