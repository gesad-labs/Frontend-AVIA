import { useState, useCallback } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside'
import styles from './HistoryPage.module.css'

/**
 * Seletor de múltipla escolha com checkboxes.
 *  - opcoes:  [{ value, label }]
 *  - valores: array de values selecionados (vazio = "sem filtro")
 */
export default function MultiSelect({ label, opcoes, valores, onChange, textoVazio = 'Todos' }) {
  const [aberto, setAberto] = useState(false)
  const fechar = useCallback(() => setAberto(false), [])
  const ref = useClickOutside(fechar)

  const selecionados = new Set(valores)
  const resumo =
    valores.length === 0 ? textoVazio
    : valores.length === 1 ? (opcoes.find(o => o.value === valores[0])?.label ?? valores[0])
    : `${valores.length} selecionados`

  function alternar(value) {
    onChange(selecionados.has(value) ? valores.filter(v => v !== value) : [...valores, value])
  }

  return (
    <div className={styles.field} ref={ref}>
      <span className={styles.fieldLabel}>{label}</span>
      <button
        type="button"
        className={`${styles.control} ${valores.length > 0 ? styles.controlActive : ''}`}
        onClick={() => setAberto(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={aberto}
      >
        <span className={styles.controlText}>{resumo}</span>
        <span className={styles.caret} aria-hidden="true">▾</span>
      </button>

      {aberto && (
        <div className={styles.dropdown} role="listbox" aria-multiselectable="true" aria-label={label}>
          {opcoes.length === 0 ? (
            <p className={styles.dropdownEmpty}>Nenhuma opção disponível.</p>
          ) : (
            opcoes.map(o => (
              <label key={o.value} className={styles.option}>
                <input
                  type="checkbox"
                  checked={selecionados.has(o.value)}
                  onChange={() => alternar(o.value)}
                />
                <span>{o.label}</span>
              </label>
            ))
          )}
          {valores.length > 0 && (
            <button type="button" className={styles.dropdownClear} onClick={() => onChange([])}>
              Limpar seleção
            </button>
          )}
        </div>
      )}
    </div>
  )
}