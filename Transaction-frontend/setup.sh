#!/usr/bin/env bash
set -euo pipefail
APP_DIR="tx-frontend"
echo "Creating Vite React+TS project..."
npm create vite@latest "$APP_DIR" -- --template react-ts <<EOF
y
EOF
cd "$APP_DIR"
echo "Installing dependencies..."
npm i axios zustand react-router-dom@6 @tanstack/react-query date-fns
echo "Creating folders..."
mkdir -p src/api src/store src/components src/pages/user src/pages/admin src/utils src/constants src/styles
echo "Writing src/main.tsx..."
cat > src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import router from './router'
import './styles/globals.css'
import Toast from './components/Toast'
const queryClient = new QueryClient({
defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } }
})
ReactDOM.createRoot(document.getElementById('root')!).render(
<React.StrictMode>



</React.StrictMode>
)
EOF
echo "Writing src/router.tsx..."
cat > src/router.tsx << 'EOF'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import UserLayout from './pages/user/UserLayout'
import Home from './pages/user/Home'
import Accounts from './pages/user/Accounts'
import UserTransactions from './pages/user/Transactions'
import Buy from './pages/user/Buy'
import Sell from './pages/user/Sell'
import AdminLayout from './pages/admin/AdminLayout'
import AdminTransactions from './pages/admin/Transactions'
import Pending from './pages/admin/Pending'
import { getAuth, hasRole, isAuthed } from './store/authStore'
const Protected = ({ children }: { children: JSX.Element }) => {
const auth = getAuth()
if (!auth || !auth.token || auth.exp * 1000 < Date.now()) {
return
}
return children
}
const RoleRoute = ({ role, children }:{ role:'ROLE_USER'|'ROLE_ADMIN', children: JSX.Element }) => {
if (!isAuthed() || !hasRole(role)) return
return children
}
export default createBrowserRouter([
{ path: '/', element:  },
{ path: '/login', element:  },
{ path: '/signup', element:  },
{ path: '/profile', element:  },
{
path: '/app/user',
element: ,
children: [
{ index: true, element:  },
{ path: 'home', element:  },
{ path: 'accounts', element:  },
{ path: 'transactions', element:  },
{ path: 'buy', element:  },
{ path: 'sell', element:  },
]
},
{
path: '/app/admin',
element: ,
children: [
{ index: true, element:  },
{ path: 'transactions', element:  },
{ path: 'pending', element:  },
]
},
])
EOF
echo "Writing src/App.tsx..."
cat > src/App.tsx << 'EOF'
import { useEffect } from 'react'
import { initAuthFromStorage } from './store/authStore'
import { Outlet } from 'react-router-dom'
export default function App(){
useEffect(()=>{ initAuthFromStorage() },[])
return
}
EOF
echo "Writing API layer..."
cat > src/api/types.ts << 'EOF'
export type Role = 'ROLE_USER' | 'ROLE_ADMIN'
export type AccountType = 'BANK' | 'UPI'
export type TxType = 'BUY' | 'SELL'
export type TxStatus = 'PENDING' | 'COMPLETED' | 'REJECTED'
export interface AuthResponse {
message: string
userId: number
token: string
}
export interface UserProfileResponse {
id: number
name: string
email: string
phone: string
token: number
}
export interface BankAccountResponse {
id: number
accountHolderName: string
accountNumber: string
ifscCode: string
accountType: 'BANK'
}
export interface UpiAccountResponse {
id: number
upiId: string
accountType: 'UPI'
}
export interface TransactionOutput {
id: number
paymentId: string
amount: number
tokens: number
rate: number
type: TxType
status: TxStatus
createdAt: string
}
EOF
cat > src/api/client.ts << 'EOF'
import axios from 'axios'
import { useAuthStore, logoutSilently } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
const client = axios.create({
baseURL: 'http://localhost:8080',
timeout: 15000,
})
client.interceptors.request.use((config) => {
const { token } = useAuthStore.getState()
if (token) config.headers.Authorization = Bearer ${token}
return config
})
client.interceptors.response.use(
(res) => res,
(error) => {
const { showToast } = useUIStore.getState()
const status = error?.response?.status
const message = error?.response?.data?.message || error?.response?.data || 'Something went wrong'
if (status === 401) {
logoutSilently()
showToast('Session expired. Please login again.', 'error')
} else {
showToast(String(message), 'error')
}
return Promise.reject(error)
}
)
export default client
EOF
cat > src/api/auth.ts << 'EOF'
import client from './client'
import { AuthResponse } from './types'
export const signup = (data: { name:string; email:string; phoneNumber:string; password:string }) =>
client.post<AuthResponse>('/auth/signup', data).then(r => r.data)
export const login = (data: { phoneNumber:string; password:string }) =>
client.post<AuthResponse>('/auth/login', data).then(r => r.data)
EOF
cat > src/api/user.ts << 'EOF'
import client from './client'
import { UserProfileResponse } from './types'
export const getTokens = (userId: number) =>
client.get<number>(/api/user/${userId}/tokens).then(r => r.data)
export const getRate = () =>
client.get<number>('/api/user/rate').then(r => r.data)
export const getProfile = (userId:number) =>
client.get<UserProfileResponse>(/api/user/profile, { params: { userId } }).then(r => r.data)
export const updateProfile = (userId:number, data: { name?:string; email?:string }) =>
client.patch<UserProfileResponse>(/api/user/profile, data, { params: { userId } }).then(r => r.data)
EOF
cat > src/api/accounts.ts << 'EOF'
import client from './client'
import { AccountType, BankAccountResponse, UpiAccountResponse } from './types'
export const addUpi = (userId:number, payload:{ upiId:string }) =>
client.post(/api/accounts/upi/${userId}, payload).then(r => r.data)
export const addBank = (userId:number, payload:{ accountHolderName:string; accountNumber:string; ifscCode:string }) =>
client.post(/api/accounts/bank/${userId}, payload).then(r => r.data)
export const deleteUpi = (upiId:number, userId:number) =>
client.delete(/api/accounts/upi/${upiId}/${userId}).then(r => r.data)
export const deleteBank = (bankId:number, userId:number) =>
client.delete(/api/accounts/bank/${bankId}/${userId}).then(r => r.data)
export const setPrimary = (userId:number, primaryId:number|string, accountType:AccountType) =>
client.put(/api/accounts/set-primary/${userId}, null, { params: { primaryId, accountType } }).then(r => r.data)
export const getPrimary = (userId:number) =>
client.get<{ id:number; accountType:AccountType } | null>(/api/accounts/primary/${userId}).then(r => r.data)
export const getBanks = (userId:number) =>
client.get<BankAccountResponse[]>(/api/accounts/banks/${userId}).then(r => r.data)
export const getUpis = (userId:number) =>
client.get<UpiAccountResponse[]>(/api/accounts/upi/${userId}).then(r => r.data)
EOF
cat > src/api/transactions.ts << 'EOF'
import client from './client'
import { TransactionOutput } from './types'
export const buyTokens = (userId:number, payload: { amount:number; rate:number }) =>
client.post(/api/transactions/buy/${userId}, payload).then(r => r.data)
export const sellTokens = (userId:number, payload: { tokens:number }) =>
client.post(/api/transactions/sell/${userId}, payload).then(r => r.data)
export const getUserTransactions = (userId:number) =>
client.get<TransactionOutput[]>(/api/transactions/user/${userId}).then(r => r.data)
EOF
cat > src/api/admin.ts << 'EOF'
import client from './client'
import { TransactionOutput } from './types'
export const updateRate = (rate:number) =>
client.put('/api/admin/rate', null, { params: { rate } }).then(r => r.data)
export const getAllTransactions = () =>
client.get<TransactionOutput[]>('/api/admin/transactions').then(r => r.data)
export const approveBuy = (id:number) =>
client.put(/api/admin/approveBuy/${id}).then(r => r.data)
export const approveSell = (id:number, paymentId:string) =>
client.put(/api/admin/approveSell/${id}, null, { params: { paymentId } }).then(r => r.data)
export const failTransaction = (id:number) =>
client.put(/api/admin/fail/${id}).then(r => r.data)
EOF
echo "Writing stores..."
cat > src/store/authStore.ts << 'EOF'
import { create } from 'zustand'
import { decodeJwt } from '../utils/jwt'
import type { Role } from '../api/types'
type AuthState = {
token: string | null
userId: number | null
role: Role | null
exp: number
setAuth: (token:string, userId:number) => void
clear: () => void
}
export const useAuthStore = create<AuthState>((set) => ({
token: null, userId: null, role: null, exp: 0,
setAuth: (token, userId) => {
const payload = decodeJwt(token)
const role = Array.isArray(payload?.role) ? payload.role : null
const exp = payload?.exp || Math.floor(Date.now()/1000) + 3600
const auth = { token, userId, role, exp }
localStorage.setItem('auth', JSON.stringify(auth))
set(auth)
},
clear: () => {
localStorage.removeItem('auth')
set({ token:null, userId:null, role:null, exp:0 })
}
}))
export const initAuthFromStorage = () => {
const raw = localStorage.getItem('auth')
if (!raw) return
try {
const parsed = JSON.parse(raw)
if (parsed?.exp * 1000 < Date.now()) {
localStorage.removeItem('auth')
return
}
useAuthStore.setState(parsed)
} catch {}
}
export const logoutSilently = () => useAuthStore.getState().clear()
export const getAuth = () => useAuthStore.getState()
export const isAuthed = () => {
const { token, exp } = useAuthStore.getState()
return Boolean(token && exp * 1000 > Date.now())
}
export const hasRole = (role:Role) => useAuthStore.getState().role === role
EOF
cat > src/store/uiStore.ts << 'EOF'
import { create } from 'zustand'
type ToastType = 'info' | 'success' | 'error'
type Toast = { id: number; message: string; type: ToastType }
export const useUIStore = create<{
toasts: Toast[]
showToast: (message:string, type?:ToastType)=>void
removeToast: (id:number)=>void
}>((set, get) => ({
toasts: [],
showToast: (message, type='info') => {
const id = Date.now()+Math.random()
set({ toasts: [...get().toasts, { id, message, type }] })
setTimeout(() => get().removeToast(id), 4000)
},
removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) })
}))
EOF
echo "Writing utils..."
cat > src/utils/jwt.ts << 'EOF'
export const decodeJwt = (token?: string) => {
if (!token) return null
try {
const [, payload] = token.split('.')
const json = atob(payload)
return JSON.parse(json)
} catch {
return null
}
}
EOF
cat > src/utils/validators.ts << 'EOF'
export const isEmail = (v:string) => /[\s@]+@[\s@]+.[\s@]+/.test(v)
export const isPositiveInt = (v:string|number) => {
const n = typeof v === 'string' ? Number(v) : v
return Number.isInteger(n) && n > 0
}
export const isPositiveNumber = (v:string|number) => {
const n = typeof v === 'string' ? Number(v) : v
return !isNaN(n) && n > 0
}
EOF
cat > src/utils/format.ts << 'EOF'
export const formatAmount = (n:number) => n.toFixed(2)
export const mapStatus = (s:'PENDING'|'COMPLETED'|'REJECTED') =>
s === 'COMPLETED' ? 'Successful' : s === 'PENDING' ? 'Pending' : 'Failed'
EOF
cat > src/utils/time.ts << 'EOF'
import { format } from 'date-fns'
export const formatIST = (iso:string) => {
try { return format(new Date(iso), 'dd MMM yyyy, HH:mm') } catch { return iso }
}
EOF
cat > src/utils/sanitize.ts << 'EOF'
export const basicSanitize = (s:string) => {
if (!s) return s
const bad = /(;|--|/*|*/|drop|insert|update|delete)/i
return bad.test(s) ? '' : s.trim()
}
EOF
echo "Writing constants..."
cat > src/constants/app.ts << 'EOF'
export const APP_NAME = 'TransactPro'
export const SLOGAN = 'Simple. Secure. Transparent.'
EOF
cat > src/constants/theme.ts << 'EOF'
export const colors = {
primary: '#1F4B99',
success: '#2BB673',
danger: '#D64545',
text: '#111827',
secondary: '#6B7280',
border: '#E5E7EB',
bg: '#F9FAFB',
white: '#FFFFFF'
}
EOF
cat > src/constants/bankDetails.ts << 'EOF'
export const ADMIN_BANK = {
bankName: 'State Bank of India',
accountHolderName: 'Admin Account',
accountNumber: '1234567890',
ifscCode: 'SBIN0000123',
note: 'Use this account to pay for Buy requests. Enter tokens and proceed.'
}
EOF
echo "Writing components..."
cat > src/components/Button.tsx << 'EOF'
import { colors } from '../constants/theme'
export default function Button({ children, onClick, type='button', variant='primary', disabled=false }:{
children: React.ReactNode, onClick?:()=>void, type?:'button'|'submit', variant?:'primary'|'secondary'|'danger', disabled?:boolean
}) {
const bg = variant==='primary'?colors.primary:variant==='danger'?colors.danger:'#6B7280'
return (
<button type={type} disabled={disabled} onClick={onClick}
style={{
backgroundColor: disabled ? '#94A3B8' : bg, color: 'white', padding:'10px 14px', borderRadius:8,
border:'none', fontWeight:600, cursor: disabled?'not-allowed':'pointer'
}}
>{children}</button>
)
}
EOF
cat > src/components/Input.tsx << 'EOF'
export default function Input({ label, value, onChange, type='text', placeholder='', required=false }:{
label:string, value:string, onChange:(v:string)=>void, type?:string, placeholder?:string, required?:boolean
}) {
return (
<label style={{ display:'block', marginBottom:12 }}>
<div style={{ marginBottom:6, fontSize:14, color:'#374151' }}>{label}</div>
<input
value={value}
onChange={e=>onChange(e.target.value)}
type={type}
placeholder={placeholder}
required={required}
style={{ width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #E5E7EB' }}
/>
</label>
)
}
EOF
cat > src/components/Tabs.tsx << 'EOF'
export default function Tabs({ tabs, value, onChange }:{
tabs: { key:string, label:string }[]
value: string
onChange: (k:string)=>void
}) {
return (
<div style={{ display:'flex', gap:8, borderBottom:'1px solid #E5E7EB', marginBottom:16 }}>
{tabs.map(t=>(
<button key={t.key} onClick={()=>onChange(t.key)}
style={{
padding:'8px 12px', border:'none', borderBottom: value===t.key?'3px solid #1F4B99':'3px solid transparent',
background:'transparent', cursor:'pointer', fontWeight:600
}}>{t.label}</button>
))}
</div>
)
}
EOF
cat > src/components/Table.tsx << 'EOF'
export default function Table({ headers, rows }:{
headers: string[]
rows: React.ReactNode[][]
}) {
return (
<table style={{ width:'100%', borderCollapse:'collapse' }}>

</table>
)
}
EOF
cat > src/components/Pagination.tsx << 'EOF'
export default function Pagination({ page, total, perPage, onChange }:{
page:number, total:number, perPage:number, onChange:(p:number)=>void
}) {
const pages = Math.max(1, Math.ceil(total / perPage))
return (
<div style={{ display:'flex', gap:8, alignItems:'center', justifyContent:'flex-end', marginTop:12 }}>
<button disabled={page<=1} onClick={()=>onChange(page-1)}>Prev</button> Page {page} of {pages} =pages} onClick={()=>onChange(page+1)}>Next
</div>
)
}
EOF
cat > src/components/Modal.tsx << 'EOF'
export default function Modal({ open, title, children, onClose }:{
open:boolean, title:string, children:React.ReactNode, onClose:()=>void
}) {
if (!open) return null
return (
<div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
<div style={{ background:'white', padding:20, borderRadius:10, width: 'min(520px, 90vw)' }}>
<div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
<h3 style={{ margin:0 }}>{title}</h3>
<button onClick={onClose} style={{ border:'none', background:'transparent', fontSize:20 }}>×</button>
</div>
{children}
</div>
</div>
)
}
EOF
cat > src/components/Card.tsx << 'EOF'
export default function Card({ children }:{ children:React.ReactNode }) {
return <div style={{ background:'white', border:'1px solid #E5E7EB', borderRadius:10, padding:16 }}>{children}</div>
}
EOF
cat > src/components/EmptyState.tsx << 'EOF'
export default function EmptyState({ title, desc }:{ title:string; desc?:string }) {
return (
<div style={{ padding:24, textAlign:'center', color:'#6B7280' }}>
<div style={{ fontWeight:600 }}>{title}</div>
{desc && <div style={{ marginTop:6 }}>{desc}</div>}
</div>
)
}
EOF
cat > src/components/Toast.tsx << 'EOF'
import { useUIStore } from '../store/uiStore'
import { colors } from '../constants/theme'
export default function Toast(){
const { toasts, removeToast } = useUIStore()
if (!toasts.length) return null
return (
<div style={{ position:'fixed', top:16, right:16, display:'flex', flexDirection:'column', gap:8, zIndex:100 }}>
{toasts.map(t=>(
<div key={t.id} onClick={()=>removeToast(t.id)}
style={{
background: t.type==='error'?colors.danger:t.type==='success'?colors.success:colors.primary,
color:'white', padding:'10px 14px', borderRadius:8, cursor:'pointer', minWidth:260
}}>{t.message}</div>
))}
</div>
)
}
EOF
cat > src/components/ProfileMenu.tsx << 'EOF'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
export default function ProfileMenu(){
const [open,setOpen]=useState(false)
const { clear } = useAuthStore()
const nav = useNavigate()
return (
<div style={{ position:'relative' }}>
<button onClick={()=>setOpen(!open)} style={{ border:'none', background:'transparent', fontWeight:600, cursor:'pointer' }}>Profile ▾</button>
{open && (
<div style={{ position:'absolute', right:0, top:'100%', background:'white', border:'1px solid #E5E7EB', borderRadius:8, overflow:'hidden' }}>
<button onClick={()=>{ setOpen(false); nav('/profile') }} style={{ display:'block', padding:'8px 12px', width:160, border:'none', background:'white', cursor:'pointer', textAlign:'left' }}>Profile</button>
<button onClick={()=>{ clear(); nav('/'); }} style={{ display:'block', padding:'8px 12px', width:160, border:'none', background:'white', cursor:'pointer', textAlign:'left' }}>Logout</button>
</div>
)}
</div>
)
}
EOF
cat > src/components/TopBar.tsx << 'EOF'
import { APP_NAME } from '../constants/app'
import ProfileMenu from './ProfileMenu'
import { colors } from '../constants/theme'
export default function TopBar(){
return (
<div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background: 'white', borderBottom:1px solid ${colors.border} }}>
<div style={{ fontWeight:800, color: colors.primary, userSelect:'none' }}>{APP_NAME}</div>

</div>
)
}
EOF
echo "Writing pages..."
cat > src/pages/Landing.tsx << 'EOF'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { APP_NAME, SLOGAN } from '../constants/app'
export default function Landing(){
const nav = useNavigate()
return (
<div style={{ minHeight:'100vh', display:'grid', placeItems:'center', background:'#F9FAFB' }}>
<div style={{ textAlign:'center' }}>
<h1 style={{ marginBottom:8 }}>{APP_NAME}</h1>
<p style={{ marginBottom:24, color:'#6B7280' }}>{SLOGAN}</p>
<div style={{ display:'flex', gap:12, justifyContent:'center' }}>
<Button onClick={()=>nav('/login')}>Login</Button>
<Button variant="secondary" onClick={()=>nav('/signup')}>Sign up</Button>
</div>
</div>
</div>
)
}
EOF
cat > src/pages/Login.tsx << 'EOF'
import { useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'
import { login } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { decodeJwt } from '../utils/jwt'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
export default function Login(){
const [phone,setPhone]=useState('')
const [password,setPassword]=useState('')
const [loading,setLoading]=useState(false)
const { setAuth } = useAuthStore()
const nav = useNavigate()
const { showToast } = useUIStore()
const submit = async(e:React.FormEvent)=>{
e.preventDefault()
if (!/^\d{10}$/.test(phone) || !password) { showToast('Enter valid phone and password','error'); return }
setLoading(true)
try{
const res = await login({ phoneNumber: phone, password })
setAuth(res.token, res.userId)
const payload = decodeJwt(res.token)
const role = Array.isArray(payload?.role) ? payload.role : null
showToast('Welcome back!','success')
if (role === 'ROLE_ADMIN') nav('/app/admin/transactions')
else nav('/app/user/home')
} finally { setLoading(false) }
}
return (
<div style={{ maxWidth:420, margin:'80px auto' }}>

Login


 {loading?'Logging in...':'Login'}
</div>
)
}
EOF
cat > src/pages/Signup.tsx << 'EOF'
import { useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'
import { signup } from '../api/auth'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../store/uiStore'
import { isEmail, isPhone10 } from '../utils/validators'
export default function Signup(){
const [name,setName]=useState('')
const [email,setEmail]=useState('')
const [phone,setPhone]=useState('')
const [password,setPassword]=useState('')
const [loading,setLoading]=useState(false)
const { setAuth } = useAuthStore()
const nav = useNavigate()
const { showToast } = useUIStore()
const submit = async(e:React.FormEvent)=>{
e.preventDefault()
if (!name.trim() || !isEmail(email) || !isPhone10(phone) || password.length<6){
showToast('Please provide valid name, email, phone, and password','error'); return
}
setLoading(true)
try{
const res = await signup({ name, email, phoneNumber: phone, password })
setAuth(res.token, res.userId)
showToast('Account created','success')
nav('/app/user/home')
} finally { setLoading(false) }
}
return (
<div style={{ maxWidth:480, margin:'60px auto' }}>

Sign up




 {loading?'Creating...':'Create account'}
</div>
)
}
EOF
cat > src/pages/Profile.tsx << 'EOF'
import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '../api/user'
import Input from '../components/Input'
import Button from '../components/Button'
import Card from '../components/Card'
import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { isEmail } from '../utils/validators'
export default function Profile(){
const { userId } = useAuthStore()
const { showToast } = useUIStore()
const [loading,setLoading]=useState(true)
const [name,setName]=useState('')
const [email,setEmail]=useState('')
const [phone,setPhone]=useState('')
const [token,setToken]=useState(0)
useEffect(()=>{ (async()=>{
if (!userId) return
setLoading(true)
try{
const p = await getProfile(userId)
setName(p.name); setEmail(p.email); setPhone(p.phone); setToken(p.token||0)
} finally { setLoading(false) }
})() },[userId])
const save = async()=>{
if (!isEmail(email) || !name.trim()) { showToast('Enter valid name and email','error'); return }
if (!userId) return
await updateProfile(userId, { name, email })
showToast('Profile updated','success')
}
if (loading) return <div style={{ padding:24 }}>Loading...</div>
return (
<div style={{ maxWidth:600, margin:'24px auto' }}>

<h3 style={{ marginTop:0 }}>Profile</h3>
<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>


<Input label="Phone" value={phone} onChange={()=>{}} />
<Input label="Token Balance" value={String(token)} onChange={()=>{}} />
</div>
<div style={{ marginTop:16 }}>
Save changes
</div>
</div>
)
}
EOF
cat > src/pages/user/UserLayout.tsx << 'EOF'
import { Outlet, NavLink } from 'react-router-dom'
import TopBar from '../../components/TopBar'
export default function UserLayout(){
return (



<div style={{ maxWidth:1100, margin:'0 auto', padding:16 }}>
<div style={{ display:'flex', gap:12, marginBottom:16 }}>
Home Accounts Transactions


</div>
</div>
)
}
EOF
cat > src/pages/user/Home.tsx << 'EOF'
import { useQuery } from '@tanstack/react-query'
import { getTokens, getRate } from '../../api/user'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { useNavigate } from 'react-router-dom'
export default function Home(){
const { userId } = useAuthStore()
const nav = useNavigate()
const { data: tokens } = useQuery(['tokens', userId], ()=>getTokens(userId!), { enabled: !!userId })
const { data: rate } = useQuery(['rate'], getRate)
return (
<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

<div style={{ fontSize:14, color:'#6B7280' }}>Your Tokens</div>
<div style={{ fontSize:28, fontWeight:800 }}>{tokens ?? '—'}</div>
<div style={{ fontSize:14, color:'#6B7280' }}>Current Token Rate</div>
<div style={{ fontSize:28, fontWeight:800 }}>{rate ?? '—'}</div>
<div style={{ gridColumn:'1 / span 2', display:'flex', gap:12 }}>
<Button onClick={()=>nav('/app/user/buy')}>Buy Tokens</Button>
<Button variant="secondary" onClick={()=>nav('/app/user/sell')}>Sell Tokens</Button>
</div>
</div>
)
}
EOF
cat > src/pages/user/Accounts.tsx << 'EOF'
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { addBank, addUpi, deleteBank, deleteUpi, getBanks, getPrimary, getUpis, setPrimary } from '../../api/accounts'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import { useAuthStore } from '../../store/authStore'
import { basicSanitize } from '../../utils/sanitize'
import { AccountType } from '../../api/types'
import EmptyState from '../../components/EmptyState'
export default function Accounts(){
const { userId } = useAuthStore()
const qc = useQueryClient()
const banksQ = useQuery(['banks', userId], ()=>getBanks(userId!), { enabled: !!userId })
const upisQ = useQuery(['upis', userId], ()=>getUpis(userId!), { enabled: !!userId })
const primaryQ = useQuery(['primary', userId], ()=>getPrimary(userId!), { enabled: !!userId })
const [showAddBank, setShowAddBank] = useState(false)
const [showAddUpi, setShowAddUpi] = useState(false)
const items = useMemo(()=> {
const b = banksQ.data?.map(a=>({ ...a, type:'BANK' as AccountType })) ?? []
const u = upisQ.data?.map(a=>({ ...a, type:'UPI' as AccountType })) ?? []
return [...b, ...u]
}, [banksQ.data, upisQ.data])
const totalCount = items.length
const primaryId = (primaryQ.data as any)?.id
const primaryType = (primaryQ.data as any)?.accountType as AccountType | undefined
const onSetPrimary = async(id:number, type:AccountType)=>{
await setPrimary(userId!, id, type)
await qc.invalidateQueries({ queryKey:['primary', userId] })
}
const onDelete = async(item:any)=>{
if (totalCount <= 1) return
if (item.type === 'BANK') await deleteBank(item.id, userId!)
else await deleteUpi(item.id, userId!)
await Promise.all([
qc.invalidateQueries({ queryKey:['banks', userId]}),
qc.invalidateQueries({ queryKey:['upis', userId]}),
qc.invalidateQueries({ queryKey:['primary', userId]}),
])
}
return (


<div style={{ display:'flex', gap:12, marginBottom:12 }}>
<Button onClick={()=>setShowAddUpi(true)}>Add UPI</Button>
<Button variant="secondary" onClick={()=>setShowAddBank(true)}>Add Bank</Button>
  <Card>
    {items.length===0 ? <EmptyState title="No accounts yet" desc="Add a UPI or bank account to get started." /> : (
      <div>
        {items.map(it=>(
          <div key={`${it.type}-${it.id}`} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #F3F4F6' }}>
            <div>
              <div style={{ fontWeight:700 }}>{it.type==='BANK' ? it.accountHolderName : it.upiId}</div>
              <div style={{ color:'#6B7280', fontSize:13 }}>
                {it.type==='BANK' ? \`A/C \${it.accountNumber} -  IFSC \${it.ifscCode}\` : 'UPI'}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {primaryId===it.id && primaryType===it.type ? <span style={{ fontSize:12, padding:'2px 8px', border:'1px solid #E5E7EB', borderRadius:16 }}>Primary</span>
                : <Button variant="secondary" onClick={()=>onSetPrimary(it.id, it.type)}>Set Primary</Button>}
              <Button variant="danger" disabled={totalCount<=1} onClick={()=>onDelete(it)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>

  <AddUpiModal open={showAddUpi} onClose={()=>setShowAddUpi(false)} userId={userId!} />
  <AddBankModal open={showAddBank} onClose={()=>setShowAddBank(false)} userId={userId!} />
</div>

)
}
function AddUpiModal({ open, onClose, userId }:{ open:boolean; onClose:()=>void; userId:number }){
const [upi,setUpi]=useState('')
const qc = useQueryClient()
const save = async()=>{
const v = basicSanitize(upi)
if (!v) return onClose()
await addUpi(userId, { upiId: v })
await qc.invalidateQueries({ queryKey:['upis', userId] })
onClose()
}
return (


<div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
Cancel Save
</div>
)
}
function AddBankModal({ open, onClose, userId }:{ open:boolean; onClose:()=>void; userId:number }){
const [name,setName]=useState('')
const [acc,setAcc]=useState('')
const [ifsc,setIfsc]=useState('')
const qc = useQueryClient()
const save = async()=>{
const payload = {
accountHolderName: basicSanitize(name),
accountNumber: basicSanitize(acc),
ifscCode: basicSanitize(ifsc),
}
if (!payload.accountHolderName || !payload.accountNumber || !payload.ifscCode) return onClose()
await addBank(userId, payload)
await qc.invalidateQueries({ queryKey:['banks', userId] })
onClose()
}
return (




<div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
Cancel Save
</div>
)
}
EOF
cat > src/pages/user/Transactions.tsx << 'EOF'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getUserTransactions } from '../../api/transactions'
import { useAuthStore } from '../../store/authStore'
import Tabs from '../../components/Tabs'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import { mapStatus } from '../../utils/format'
import { formatIST } from '../../utils/time'
import EmptyState from '../../components/EmptyState'
export default function UserTransactions(){
const { userId } = useAuthStore()
const { data: txs = [] } = useQuery(['userTx', userId], ()=>getUserTransactions(userId!), { enabled: !!userId })
const [statusTab, setStatusTab] = useState<'Successful'|'Pending'|'Failed'>('Pending')
const [page,setPage]=useState(1)
const perPage = 10
const filtered = useMemo(()=>{
return txs.filter(t=>{
const m = mapStatus(t.status as any)
return m === statusTab
})
},[txs, statusTab])
const pageRows = filtered.slice((page-1)perPage, pageperPage)
return (
<div>
<Tabs tabs={[
{ key:'Pending', label:'Pending' },
{ key:'Successful', label:'Successful' },
{ key:'Failed', label:'Failed' },
]} value={statusTab} onChange={(k)=>{ setStatusTab(k as any); setPage(1) }} />
  {filtered.length===0 ? <EmptyState title="No transactions" /> : (
    <>
      <Table headers={['Payment ID', 'Type', 'Status', 'Tokens', 'Amount', 'Rate', 'Created at']}
        rows={pageRows.map(t=>[
          t.paymentId || '—',
          t.type,
          mapStatus(t.status),
          String(t.tokens),
          String(t.amount.toFixed(2)),
          String(t.rate),
          formatIST(t.createdAt),
        ])}
      />
      <Pagination page={page} total={filtered.length} perPage={perPage} onChange={setPage} />
    </>
  )}
</div>

)
}
EOF
cat > src/pages/user/Buy.tsx << 'EOF'
import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { ADMIN_BANK } from '../../constants/bankDetails'
import { getRate } from '../../api/user'
import { buyTokens } from '../../api/transactions'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { isPositiveInt } from '../../utils/validators'
import { useUIStore } from '../../store/uiStore'
export default function Buy(){
const [tokens,setTokens]=useState('')
const [rate,setRate]=useState<number|undefined>(undefined)
const { userId } = useAuthStore()
const nav = useNavigate()
const { showToast } = useUIStore()
useEffect(()=>{ getRate().then(setRate) },[])
const amount = rate && isPositiveInt(tokens) ? Number(tokens) * rate : 0
const submit = async()=>{
if (!rate || !isPositiveInt(tokens)) { showToast('Enter a valid positive integer for tokens','error'); return }
await buyTokens(userId!, { amount: Number((amount).toFixed(2)), rate })
showToast('Buy request created','success')
nav('/app/user/transactions')
}
return (
<div style={{ display:'grid', gap:16, maxWidth:720 }}>

<h3 style={{ marginTop:0 }}>Admin Bank Details</h3>
{ADMIN_BANK.accountHolderName}
{ADMIN_BANK.bankName}
A/C: {ADMIN_BANK.accountNumber}
IFSC: {ADMIN_BANK.ifscCode}

{ADMIN_BANK.note && <div style={{ color:'#6B7280', marginTop:8 }}>{ADMIN_BANK.note}</div>}

<h3 style={{ marginTop:0 }}>Buy Tokens</h3>
<div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
<Input label="Current Rate" value={rate?String(rate):''} onChange={()=>{}} />

<Input label="Amount to pay" value={amount?amount.toFixed(2):''} onChange={()=>{}} />
</div>
<div style={{ marginTop:12, display:'flex', gap:8 }}>
Done
<Button variant="secondary" onClick={()=>nav('/app/user/home')}>Cancel</Button>
</div>
</div>
)
}
EOF
cat > src/pages/user/Sell.tsx << 'EOF'
import { useEffect, useState } from 'react'
import Card from '../../components/Card'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { getTokens } from '../../api/user'
import { sellTokens } from '../../api/transactions'
import { getPrimary } from '../../api/accounts'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import { isPositiveInt } from '../../utils/validators'
import { useUIStore } from '../../store/uiStore'
export default function Sell(){
const [tokens,setTokens]=useState('')
const [balance,setBalance]=useState<number>(0)
const [hasPrimary,setHasPrimary]=useState(false)
const { userId } = useAuthStore()
const nav = useNavigate()
const { showToast } = useUIStore()
useEffect(()=>{
if (!userId) return
getTokens(userId).then(setBalance)
getPrimary(userId).then(p=> setHasPrimary(Boolean(p && (p as any).id)))
},[userId])
const submit = async()=>{
if (!isPositiveInt(tokens)) { showToast('Enter a valid positive integer for tokens','error'); return }
if (Number(tokens) > balance) { showToast('Cannot sell more tokens than balance','error'); return }
if (!hasPrimary) { showToast('Set a primary account before selling','error'); return }
await sellTokens(userId!, { tokens: Number(tokens) })
showToast('Sell request created','success')
nav('/app/user/transactions')
}
return (
<div style={{ display:'grid', gap:16, maxWidth:720 }}>

<h3 style={{ marginTop:0 }}>Sell Tokens</h3>
<div style={{ color:'#6B7280', marginBottom:8 }}>Balance: {balance}</div>

<div style={{ display:'flex', gap:8 }}>
Done
<Button variant="secondary" onClick={()=>nav('/app/user/home')}>Cancel</Button>
</div>
</div>
)
}
EOF
cat > src/pages/admin/AdminLayout.tsx << 'EOF'
import { Outlet, NavLink } from 'react-router-dom'
import TopBar from '../../components/TopBar'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRate } from '../../api/user'
import { updateRate } from '../../api/admin'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useUIStore } from '../../store/uiStore'
import React from 'react'
export default function AdminLayout(){
const { data: rate } = useQuery(['rate'], getRate)
const qc = useQueryClient()
const { showToast } = useUIStore()
const [r,setR] = React.useState(rate ? String(rate) : '')
React.useEffect(()=>{ if (rate!==undefined) setR(String(rate)) },[rate])
const save = async()=>{
const n = Number(r)
if (isNaN(n) || n<=0) { showToast('Enter valid rate','error'); return }
await updateRate(n)
await qc.invalidateQueries({ queryKey:['rate'] })
showToast('Rate updated','success')
}
return (



<div style={{ maxWidth:1100, margin:'0 auto', padding:16 }}>
<div style={{ display:'flex', gap:12, alignItems:'flex-end', marginBottom:12 }}>
<div style={{ minWidth:200 }}>

Update rate
</div>
<div style={{ display:'flex', gap:12, marginBottom:16 }}>
Transactions Pending
</div>

</div>
</div>
)
}
EOF
cat > src/pages/admin/Transactions.tsx << 'EOF'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAllTransactions } from '../../api/admin'
import Tabs from '../../components/Tabs'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import { mapStatus } from '../../utils/format'
import { formatIST } from '../../utils/time'
import EmptyState from '../../components/EmptyState'
export default function AdminTransactions(){
const { data: txs = [] } = useQuery(['adminTx'], getAllTransactions)
const [typeTab,setTypeTab]=useState<'BUY'|'SELL'>('BUY')
const [page,setPage]=useState(1)
const perPage=20
const filtered = useMemo(()=>{
return txs.filter(t => t.type=typeTab && (t.status='COMPLETED' || t.status==='REJECTED'))
},[txs,typeTab])
const pageRows = filtered.slice((page-1)perPage, pageperPage)
return (


<Tabs tabs={[ {key:'BUY',label:'Buy'}, {key:'SELL',label:'Sell'} ]} value={typeTab} onChange={(k)=>{setTypeTab(k as any); setPage(1)}} />
{filtered.length===0 ?  : (
<>
<Table headers={['Payment ID','Status','Tokens','Amount','Rate','Created at']}
rows={pageRows.map(t=>[
t.paymentId || '—', mapStatus(t.status), String(t.tokens), t.amount.toFixed(2), String(t.rate), formatIST(t.createdAt)
])}
/>

</>
)}


)
}
EOF
cat > src/pages/admin/Pending.tsx << 'EOF'
import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { approveBuy, approveSell, failTransaction, getAllTransactions } from '../../api/admin'
import Tabs from '../../components/Tabs'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Button from '../../components/Button'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import EmptyState from '../../components/EmptyState'
import { useUIStore } from '../../store/uiStore'
export default function Pending(){
const { data: txs = [] } = useQuery(['adminTx'], getAllTransactions)
const [typeTab,setTypeTab]=useState<'BUY'|'SELL'>('BUY')
const [page,setPage]=useState(1)
const perPage=20
const [sellModal,setSellModal]=useState<{open:boolean; id:number|null}>({open:false,id:null})
const [paymentId,setPaymentId]=useState('')
const qc = useQueryClient()
const { showToast } = useUIStore()
const pending = useMemo(()=> txs.filter(t=>t.status==='PENDING' && t.type===typeTab), [txs,typeTab])
const pageRows = pending.slice((page-1)perPage, pageperPage)
const onApproveBuy = async(id:number)=>{
await approveBuy(id)
await qc.invalidateQueries({ queryKey:['adminTx'] })
showToast('Transaction approved','success')
}
const onApproveSell = async()=>{
if (!sellModal.id) return
await approveSell(sellModal.id, paymentId)
setSellModal({ open:false, id:null }); setPaymentId('')
await qc.invalidateQueries({ queryKey:['adminTx'] })
showToast('Transaction approved','success')
}
const onFail = async(id:number)=>{
await failTransaction(id)
await qc.invalidateQueries({ queryKey:['adminTx'] })
showToast('Transaction marked failed','success')
}
return (


<Tabs tabs={[ {key:'BUY',label:'Buy'}, {key:'SELL',label:'Sell'} ]} value={typeTab} onChange={(k)=>{setTypeTab(k as any); setPage(1)}} />
{pending.length=







0 ?  : (<><Table headers={['Payment ID','Tokens','Amount','Rate','Actions']}rows={pageRows.map(t=>[t.paymentId || '—',String(t.tokens),t.amount.toFixed(2),String(t.rate),<div key={t.id
} style={{ display:'flex', gap:8 }}>{t.type='BUY' ? (
<Button onClick={()=>onApproveBuy(t.id)}>Approve</Button>
) : (
<Button onClick={()=>setSellModal({ open:true, id:t.id })}>Approve</Button>
)}
<Button variant="danger" onClick={()=>onFail(t.id)}>Fail</Button>

])}
/>

</>
)}
  <Modal open={sellModal.open} onClose={()=>setSellModal({ open:false,id:null })} title="Enter Payment ID">
    <Input label="Payment ID (bank reference)" value={paymentId} onChange={setPaymentId} />
    <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
      <Button variant="secondary" onClick={()=>setSellModal({ open:false,id:null })}>Cancel</Button>
      <Button onClick={onApproveSell}>Approve</Button>
    </div>
  </Modal>
</div>

)
}
EOF
echo "Writing styles..."
cat > src/styles/globals.css << 'EOF'
html, body, #root { height: 100%; }
body { margin:0; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color:#111827; background:#F9FAFB; }
a { color:#1F4B99; text-decoration:none; }
a.active { font-weight:700; }
button { font: inherit; }
input { font: inherit; }
EOF
echo "All files written. You can now run:"
echo " cd $APP_DIR"
echo " npm run dev"
echo "Done."
