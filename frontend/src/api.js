const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.message ?? 'No se pudo completar la operación.')
  }

  return response.status === 204 ? null : response.json()
}

export const api = {
  listIngredients: () => request('/ingredients'),
  createIngredient: (data) => request('/ingredients', { method: 'POST', body: JSON.stringify(data) }),
  updateIngredient: (id, data) => request(`/ingredients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  listCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  listMovements: () => request('/movements'),
  createMovement: (data) => request('/movements', { method: 'POST', body: JSON.stringify(data) }),
}
