import { colors } from '../constants/theme'
export default function Button({ children, onClick, type='button', variant='primary', disabled=false, fullWidth=false }:{
  children: React.ReactNode, onClick?:()=>void, type?:'button'|'submit', variant?:'primary'|'secondary'|'danger', disabled?:boolean, fullWidth?:boolean
}) {
  const bg = variant==='primary'?colors.primary:variant==='danger'?colors.danger:'#6B7280'
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        backgroundColor: disabled ? '#94A3B8' : bg,
        color: 'white',
        padding: '10px 14px',
        borderRadius: 8,
        border: 'none',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minHeight: 40,
        width: fullWidth ? '100%' : undefined,
      }}
    >
      {children}
    </button>
  )
}
