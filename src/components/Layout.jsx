import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function Layout() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <div className="app-layout">
      <header className="site-header">
        <Link to="/" className="brand">
          ParkMate
        </Link>
        <nav className="site-nav" aria-label="Main">
          {user ? (
            <>
              <NavLink to="/" end>
                Find parking
              </NavLink>
              <NavLink to="/bookings">My bookings</NavLink>
              <NavLink to="/account">Account</NavLink>
              {isAdmin && (
                <>
                  <span className="nav-divider" aria-hidden />
                  <NavLink to="/admin/parkings">Admin · Parkings</NavLink>
                  <NavLink to="/admin/bookings">Admin · Bookings</NavLink>
                  <NavLink to="/admin/users">Admin · Users</NavLink>
                </>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => logout()}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Sign up
              </NavLink>
            </>
          )}
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
