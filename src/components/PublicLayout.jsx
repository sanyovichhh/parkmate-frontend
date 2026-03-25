import { Link, NavLink, Outlet } from 'react-router-dom';

export function PublicLayout() {
  return (
    <div className="app-layout">
      <header className="site-header">
        <Link to="/" className="brand">
          ParkMate
        </Link>
        <nav className="site-nav" aria-label="Account">
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/register" className="btn btn-primary btn-sm">
            Sign up
          </NavLink>
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer">
        <span>ParkMate — book parking in a few steps.</span>
      </footer>
    </div>
  );
}
