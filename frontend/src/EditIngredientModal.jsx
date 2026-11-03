import { unitLabels } from './constants'

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>
}

export default function EditIngredientModal({ categories, ingredientForm, setIngredientForm, onSubmit, onCancel }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={onCancel}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-ingredient-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="modal-header">
        <div><p className="eyebrow">Ingredientes</p><h2 id="edit-ingredient-title">Editar ingrediente</h2></div>
        <button className="modal-close" type="button" aria-label="Cerrar" onClick={onCancel}>×</button>
      </header>
      <form onSubmit={onSubmit}>
        <Field label="Nombre"><input required value={ingredientForm.name} onChange={(event) => setIngredientForm({ ...ingredientForm, name: event.target.value })} /></Field>
        <Field label="Stock mínimo"><input required min="0" step="0.01" type="number" value={ingredientForm.minimumStock} onChange={(event) => setIngredientForm({ ...ingredientForm, minimumStock: event.target.value })} /></Field>
        <div className="form-row"><Field label="Unidad"><select value={ingredientForm.unit} onChange={(event) => setIngredientForm({ ...ingredientForm, unit: event.target.value })}>{Object.entries(unitLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></Field><Field label="Categoría"><select required value={ingredientForm.categoryId} onChange={(event) => setIngredientForm({ ...ingredientForm, categoryId: event.target.value })}><option value="">Selecciona…</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></Field></div>
        <footer className="modal-actions"><button className="secondary-button" type="button" onClick={onCancel}>Cancelar</button><button className="primary-button" type="submit">Guardar cambios</button></footer>
      </form>
    </section>
  </div>
}
