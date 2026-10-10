import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user, token, isAuthenticated, logout } = useAuth();

    return (
        <div>
            <h1>QueueLess Dashboard</h1>

            <p>Authenticated: {String(isAuthenticated)}</p>
            <p>User: {user?.name || "No user"}</p>
            <p>Token available: {String(Boolean(token))}</p>

            <button onClick={logout}>Logout</button>
        </div>
    );
};

export default Dashboard;