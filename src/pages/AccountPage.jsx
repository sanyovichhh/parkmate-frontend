import { useAuth } from '../context/useAuth';

export function AccountPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="page-shell">
      <h1>Account</h1>
      <p className="lede">Profile details from your session.</p>
      <dl className="detail-list">
        <div>
          <dt>Name</dt>
          <dd>
            {user.first_name} {user.last_name}
          </dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{user.is_admin ? 'Administrator' : 'Customer'}</dd>
        </div>
        <div>
          <dt>Member since</dt>
          <dd>
            {user.date_joined
              ? new Date(user.date_joined).toLocaleString()
              : '—'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
