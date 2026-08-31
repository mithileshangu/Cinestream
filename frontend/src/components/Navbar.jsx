import { useEffect, useState } from 'react'

export default function Navbar({ onSearch, page, onNavigatePage }) {
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function handleSubmit(e) {
    e.preventDefault()
    onSearch?.(query)
  }

  function handleAnchorClick(e, id) {
    if (page !== 'browse') {
      e.preventDefault()
      onNavigatePage('browse')
      // Let the browse page mount, then scroll to the section.
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <div className="navbar-left">
          <span className="brand" onClick={() => onNavigatePage('browse')} role="button" tabIndex={0}>
            Cine<span className="brand-accent">Stream</span>
          </span>
          <nav className="nav-links">
            <a href="#home" onClick={(e) => handleAnchorClick(e, 'home')}>Home</a>
            <a href="#movies" onClick={(e) => handleAnchorClick(e, 'movies')}>Movies</a>
            <a href="#genres" onClick={(e) => handleAnchorClick(e, 'genres')}>Genres</a>
            <a href="#recommended" onClick={(e) => handleAnchorClick(e, 'recommended')}>For You</a>
            <button
              className={`nav-tab-btn ${page === 'recommender' ? 'active' : ''}`}
              onClick={() => onNavigatePage('recommender')}
            >
              Recommender
            </button>
          </nav>
        </div>
        {page === 'browse' && (
          <form className="search-form" onSubmit={handleSubmit}>
            <input
              type="search"
              placeholder="Search titles..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                onSearch?.(e.target.value)
              }}
              aria-label="Search movies"
            />
          </form>
        )}
      </div>
    </header>
  )
}
