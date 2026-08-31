// No login system — we generate a random ID once and persist it in
// localStorage, so "your" likes stay consistent across visits on this
// browser without needing an account. This is what makes "Recommended
// For You" actually personalized instead of trending-based.

const STORAGE_KEY = 'cinestream_user_id'

export function getUserId() {
  let id = localStorage.getItem(STORAGE_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, id)
  }
  return id
}
