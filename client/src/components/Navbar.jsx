import { Link , useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user , isAuthenticated , logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <nav className='flex items-center justify-between bg-white px-4 py-2 shadow'>
            <Link to='/' className='text-xl font-bold text-blue-700'>
                QueueLess    
            </Link>

            <div className='flex items-center gap-5'>
                <Link to='/' className='text-gray-700 hover:text-blue-600'>
                    Home
                </Link>

                { isAuthenticated? (
                    <>
                        <Link
                            to='/dashboard'
                            className='text-gray-700 hover:text-blue-600'
                        >
                            Dashboard
                        </Link>

                        <span className='text-sm text-gray-600'>
                            Hi, {user?.name || 'User'}
                        </span>

                        <button
                            onClick={handleLogout}
                            className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
                            >
                                Logout
                            </button>
                    </>
                ):(
                    <>
                        <Link
                            to='/register'
                            className='text-gray-700 hover:text-blue-600'
                            >
                                Register
                            </Link>

                            <Link
                                to='/login'
                                className='rounded bg-blue-600 px-4 py2 text-white hover:bg-blue-700'
                                >
                                    Login
                            </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;


