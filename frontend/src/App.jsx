import { useEffect, useMemo, useState } from 'react'
import { api } from './api'
import EditIngredientModal from './EditIngredientModal'

const emptyIngredient = { name: '', quantity: '', minimumStock: '', unit: 'KG', categoryId: '' }
const emptyMovement = { ingredientId: '', type: 'OUT', quantity: '', reason: 'CONSUMPTION', note: '' }

const demoCategories = [
  { id: 'demo-secos', name: 'Secos', description: 'Harinas y endulzantes' },
  { id: 'demo-lacteos', name: 'Lácteos', description: 'Refrigerados' },
  { id: 'demo-decoracion', name: 'Decoración', description: 'Coberturas y detalles' },
]

const demoIngredients = [
  { id: 'demo-harina', name: 'Harina de trigo', quantity: 12, minimumStock: 3, unit: 'KG', categoryId: 'demo-secos' },
  { id: 'demo-azucar', name: 'Azúcar refinada', quantity: 4, minimumStock: 3, unit: 'KG', categoryId: 'demo-secos' },
  { id: 'demo-mantequilla', name: 'Mantequilla', quantity: 1, minimumStock: 2, unit: 'KG', categoryId: 'demo-lacteos' },
  { id: 'demo-huevos', name: 'Huevos', quantity: 24, minimumStock: 12, unit: 'UNIT', categoryId: 'demo-lacteos' },
  { id: 'demo-chispas', name: 'Chispas de chocolate', quantity: 0.8, minimumStock: 0.5, unit: 'KG', categoryId: 'demo-decoracion' },
]

const unitLabels = { GR: 'g', KG: 'kg', ML: 'ml', L: 'l', UNIT: 'unidades' }
const reasonLabels = {
  PURCHASE: 'Compra', CONSUMPTION: 'Uso en producción', EXPIRED: 'Vencido',
  DONATION: 'Donación', LOSS: 'Pérdida', INVENTORY_CORRECTION: 'Corrección', OTHER: 'Otro',
}

function formatQuantity(value, unit) {
  return `${Number(value).toLocaleString('es-CO', { maximumFractionDigits: 2 })} ${unitLabels[unit] ?? unit}`
}

function App() {
  const [ingredients, setIngredients] = useState([])
  const [categories, setCategories] = useState([])
  const [movements, setMovements] = useState([])
  const [activeView, setActiveView] = useState('inicio')
  const [ingredientForm, setIngredientForm] = useState(emptyIngredient)
  const [movementForm, setMovementForm] = useState(emptyMovement)
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)

  const categoryById = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories])
  const lowStock = useMemo(() => ingredients.filter((item) => Number(item.quantity) <= Number(item.minimumStock)), [ingredients])

  async function loadData() {
    setLoading(true)
    try {
      const [ingredientData, categoryData, movementData] = await Promise.all([
        api.listIngredients(), api.listCategories(), api.listMovements(),
      ])
      setIngredients(ingredientData)
      setCategories(categoryData)
      setMovements(movementData)
    } catch (error) {
      setIngredients(demoIngredients)
      setCategories(demoCategories)
      setMovements([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function notify(type, text) {
    setMessage({ type, text })
    window.setTimeout(() => setMessage(null), 4000)
  }

  async function submitIngredient(event) {
    event.preventDefault()
    const payload = {
      ...ingredientForm,
      quantity: Number(ingredientForm.quantity),
      minimumStock: Number(ingredientForm.minimumStock),
    }
    try {
      if (editingId) {
        const { quantity, ...update } = payload
        await api.updateIngredient(editingId, update)
        notify('success', 'Ingrediente actualizado.')
      } else {
        await api.createIngredient(payload)
        notify('success', 'Ingrediente guardado.')
      }
      setIngredientForm(emptyIngredient)
      setEditingId(null)
      await loadData()
    } catch (error) {
      notify('error', error.message)
    }
  }

  function editIngredient(ingredient) {
    setIngredientForm({
      name: ingredient.name,
      quantity: ingredient.quantity,
      minimumStock: ingredient.minimumStock,
      unit: ingredient.unit,
      categoryId: ingredient.categoryId,
    })
    setEditingId(ingredient.id)
  }

  async function submitMovement(event) {
    event.preventDefault()
    try {
      await api.createMovement({ ...movementForm, quantity: Number(movementForm.quantity) })
      setMovementForm(emptyMovement)
      notify('success', 'Movimiento registrado y existencias actualizadas.')
      await loadData()
    } catch (error) {
      notify('error', error.message)
    }
  }

  async function submitCategory(event) {
    event.preventDefault()
    try {
      await api.createCategory(categoryForm)
      setCategoryForm({ name: '', description: '' })
      notify('success', 'Categoría creada.')
      await loadData()
    } catch (error) {
      notify('error', error.message)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">✦</span><span>Aromas</span></div>
        <p className="brand-subtitle">Inventario de repostería</p>
        <nav>
          {[['inicio', 'Resumen'], ['ingredientes', 'Ingredientes'], ['movimientos', 'Registrar movimiento'], ['historial', 'Historial']].map(([id, label]) => (
            <button key={id} className={activeView === id ? 'nav-item active' : 'nav-item'} onClick={() => setActiveView(id)}>{label}</button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        {message && <div className={`toast ${message.type}`}>{message.text}</div>}
        {loading ? <div className="loading">Cargando inventario…</div> : <>
          {activeView === 'inicio' && <Dashboard ingredients={ingredients} lowStock={lowStock} categoryById={categoryById} onNavigate={setActiveView} />}
          {activeView === 'ingredientes' && <IngredientsView {...{ ingredients, categories, categoryById, ingredientForm, setIngredientForm, submitIngredient, editIngredient, categoryForm, setCategoryForm, submitCategory }} />}
          {activeView === 'movimientos' && <MovementView ingredients={ingredients} movementForm={movementForm} setMovementForm={setMovementForm} submitMovement={submitMovement} />}
          {activeView === 'historial' && <HistoryView movements={movements} ingredients={ingredients} />}
        </>}
      </main>
      {editingId && <EditIngredientModal
        categories={categories}
        ingredientForm={ingredientForm}
        setIngredientForm={setIngredientForm}
        onSubmit={submitIngredient}
        onCancel={() => { setEditingId(null); setIngredientForm(emptyIngredient) }}
      />}
    </div>
  )
}

function getStockStatus(item) {
  const quantity = Number(item.quantity)
  const minimum = Number(item.minimumStock)
  if (quantity <= minimum) return { label: 'Por reponer', tone: 'low' }
  if (quantity <= minimum * 2) return { label: 'Stock medio', tone: 'medium' }
  return { label: 'Stock alto', tone: 'high' }
}

function Dashboard({ ingredients, lowStock, categoryById, onNavigate }) {
  const [filters, setFilters] = useState({ name: '', categoryId: '', status: '' })
  const categories = Object.values(categoryById)
  const filteredIngredients = ingredients.filter((item) => {
    const matchesName = item.name.toLocaleLowerCase().includes(filters.name.trim().toLocaleLowerCase())
    const matchesCategory = !filters.categoryId || item.categoryId === filters.categoryId
    const matchesStatus = !filters.status || getStockStatus(item).tone === filters.status
    return matchesName && matchesCategory && matchesStatus
  })

  return <>
    <header className="page-heading"><div><h1>Inventario</h1><p>Ingredientes registrados</p></div><button className="primary-button" onClick={() => onNavigate('movimientos')}>+ Registrar movimiento</button></header>
    <section className="stat-grid">
      <Stat label="Ingredientes" value={ingredients.length} helper="registrados" />
      <Stat label="Stock bajo" value={lowStock.length} helper={lowStock.length ? 'requieren atención' : 'todo está en orden'} warning={lowStock.length > 0} />
      <Stat label="Categorías" value={Object.keys(categoryById).length} helper="para organizarte" />
    </section>
    <section className="panel"><div className="section-heading"><div><h2>Estado de ingredientes</h2><p>Consulta existencias, categoría y prioridad de compra.</p></div></div>
      {ingredients.length === 0 ? <EmptyState icon="⌁" text="Agrega tu primer ingrediente para comenzar." /> : <><div className="dashboard-filters"><label>Nombre<input value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} placeholder="Buscar ingrediente" /></label><label>Categoría<select value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}><option value="">Todas</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Estado<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option><option value="high">Stock alto</option><option value="medium">Stock medio</option><option value="low">Por reponer</option></select></label>{(filters.name || filters.categoryId || filters.status) && <button className="text-button clear-filters" type="button" onClick={() => setFilters({ name: '', categoryId: '', status: '' })}>Limpiar filtros</button>}</div>
      {filteredIngredients.length === 0 ? <EmptyState icon="⌕" text="No hay ingredientes que coincidan con esos filtros." /> : <div className="table-wrap dashboard-table"><table><thead><tr><th>Ingrediente</th><th>Categoría</th><th>Disponible</th><th>Estado</th></tr></thead><tbody>{filteredIngredients.map((item) => { const status = getStockStatus(item); return <tr key={item.id}><td><strong>{item.name}</strong></td><td>{categoryById[item.categoryId]?.name ?? 'Sin categoría'}</td><td>{formatQuantity(item.quantity, item.unit)}</td><td><span className={`status-pill ${status.tone}`}>{status.label}</span></td></tr> })}</tbody></table></div>}</>}
    </section>
  </>
}

function IngredientsView(props) {
  const { ingredients, categories, categoryById, ingredientForm, setIngredientForm, submitIngredient, editIngredient, categoryForm, setCategoryForm, submitCategory } = props
  return <>
    <header className="page-heading"><div><p className="eyebrow">Catálogo</p><h1>Ingredientes</h1><p>Define lo que compras y el mínimo que quieres conservar.</p></div></header>
    <div className="two-column">
      <section className="panel form-panel"><h2>Nuevo ingrediente</h2><form onSubmit={submitIngredient}>
        <Field label="Nombre"><input required value={ingredientForm.name} onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })} placeholder="Ej. Harina de trigo" /></Field>
        <div className="form-row"><Field label="Cantidad inicial"><input required min="0" step="0.01" type="number" value={ingredientForm.quantity} onChange={(e) => setIngredientForm({ ...ingredientForm, quantity: e.target.value })} /></Field><Field label="Stock mínimo"><input required min="0" step="0.01" type="number" value={ingredientForm.minimumStock} onChange={(e) => setIngredientForm({ ...ingredientForm, minimumStock: e.target.value })} /></Field></div>
        <div className="form-row"><Field label="Unidad"><select value={ingredientForm.unit} onChange={(e) => setIngredientForm({ ...ingredientForm, unit: e.target.value })}>{Object.entries(unitLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field><Field label="Categoría"><select required value={ingredientForm.categoryId} onChange={(e) => setIngredientForm({ ...ingredientForm, categoryId: e.target.value })}><option value="">Selecciona…</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></Field></div>
        <div className="form-actions"><button className="primary-button" type="submit">Guardar ingrediente</button></div>
      </form></section>
      <section className="panel form-panel"><h2>Nueva categoría</h2><p className="helper">Ejemplos: secos, lácteos, decoración o empaques.</p><form onSubmit={submitCategory}><Field label="Nombre"><input required value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} /></Field><Field label="Descripción"><input required value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} /></Field><button className="secondary-button" type="submit">Crear categoría</button></form></section>
    </div>
    <section className="panel table-panel"><div className="section-heading"><div><h2>Todos los ingredientes</h2><p>{ingredients.length} registrados</p></div></div><IngredientTable ingredients={ingredients} categoryById={categoryById} onEdit={editIngredient} /></section>
  </>
}

function MovementView({ ingredients, movementForm, setMovementForm, submitMovement }) {
  return <><header className="page-heading"><div><p className="eyebrow">Inventario</p><h1>Registrar movimiento</h1><p>Una salida descuenta existencias; un ajuste establece la cantidad exacta.</p></div></header><section className="panel form-panel wide-form"><form onSubmit={submitMovement}><div className="form-row"><Field label="Ingrediente"><select required value={movementForm.ingredientId} onChange={(e) => setMovementForm({ ...movementForm, ingredientId: e.target.value })}><option value="">Selecciona…</option>{ingredients.map((item) => <option key={item.id} value={item.id}>{item.name} — {formatQuantity(item.quantity, item.unit)}</option>)}</select></Field><Field label="Tipo"><select value={movementForm.type} onChange={(e) => setMovementForm({ ...movementForm, type: e.target.value })}><option value="IN">Entrada</option><option value="OUT">Salida</option><option value="ADJUSTMENT">Ajuste de inventario</option></select></Field></div><div className="form-row"><Field label={movementForm.type === 'ADJUSTMENT' ? 'Nueva cantidad' : 'Cantidad'}><input required min="0" step="0.01" type="number" value={movementForm.quantity} onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })} /></Field><Field label="Motivo"><select value={movementForm.reason} onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}>{Object.entries(reasonLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field></div><Field label="Nota (opcional)"><textarea maxLength="500" value={movementForm.note} onChange={(e) => setMovementForm({ ...movementForm, note: e.target.value })} placeholder="Ej. Compra a proveedor, preparación de torta…" /></Field><button className="primary-button" type="submit">Registrar movimiento</button></form></section></>
}

function HistoryView({ movements, ingredients }) {
  const [filters, setFilters] = useState({ name: '', type: '', date: '' })
  const ingredientById = Object.fromEntries(ingredients.map((item) => [item.id, item]))
  const filteredMovements = movements.filter((movement) => {
    const ingredientName = ingredientById[movement.ingredientId]?.name ?? ''
    const matchesName = ingredientName.toLocaleLowerCase().includes(filters.name.trim().toLocaleLowerCase())
    const matchesType = !filters.type || movement.type === filters.type
    const matchesDate = !filters.date || movement.date?.slice(0, 10) === filters.date
    return matchesName && matchesType && matchesDate
  })

  return <><header className="page-heading"><div><p className="eyebrow">Trazabilidad</p><h1>Historial</h1><p>Últimos cambios realizados en tu inventario.</p></div></header><section className="panel history-filter-card"><div className="history-filters"><label>Nombre<input value={filters.name} onChange={(event) => setFilters({ ...filters, name: event.target.value })} placeholder="Buscar ingrediente" /></label><label>Tipo<select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}><option value="">Todos</option><option value="IN">Agregación</option><option value="OUT">Sustracción</option><option value="ADJUSTMENT">Ajuste</option></select></label><label>Fecha<input type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} /></label>{(filters.name || filters.type || filters.date) && <button className="text-button clear-filters" type="button" onClick={() => setFilters({ name: '', type: '', date: '' })}>Limpiar filtros</button>}</div></section><section className="panel table-panel history-list-card">{movements.length === 0 ? <EmptyState icon="⌁" text="Aún no has registrado movimientos." /> : filteredMovements.length === 0 ? <EmptyState icon="⌕" text="No hay movimientos que coincidan con esos filtros." /> : <div className="history-list">{[...filteredMovements].sort((a, b) => new Date(b.date) - new Date(a.date)).map((movement) => <div className="history-row" key={movement.id}><div className={`movement-icon ${movement.type.toLowerCase()}`}><span className="movement-glyph">{movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '−' : '↺'}</span></div><div className="history-main"><strong>{ingredientById[movement.ingredientId]?.name ?? 'Ingrediente eliminado'}</strong><span>{reasonLabels[movement.reason]}</span>{movement.note && <em>“{movement.note}”</em>}</div><div className="history-meta"><strong>{formatQuantity(movement.quantity, ingredientById[movement.ingredientId]?.unit)}</strong><span>{new Date(movement.date).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })}</span></div></div>)}</div>}</section></>
}

function IngredientTable({ ingredients, categoryById, onEdit }) { return ingredients.length === 0 ? <EmptyState icon="⌁" text="Agrega tu primer ingrediente para comenzar." /> : <div className="table-wrap"><table><thead><tr><th>Ingrediente</th><th>Categoría</th><th>Disponible</th><th>Mínimo</th><th></th></tr></thead><tbody>{ingredients.map((item) => <tr key={item.id} className={Number(item.quantity) <= Number(item.minimumStock) ? 'low-stock-row' : ''}><td><strong>{item.name}</strong></td><td>{categoryById[item.categoryId]?.name ?? '—'}</td><td>{formatQuantity(item.quantity, item.unit)}</td><td>{formatQuantity(item.minimumStock, item.unit)}</td><td><button className="text-button" onClick={() => onEdit(item)}>Editar</button></td></tr>)}</tbody></table></div> }
function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label> }
function Stat({ label, value, helper, warning }) { return <article className={`stat-card ${warning ? 'warning' : ''}`}><span>{label}</span><strong>{value}</strong><small>{helper}</small></article> }
function EmptyState({ icon, text }) { return <div className="empty-state"><span>{icon}</span><p>{text}</p></div> }

export default App
