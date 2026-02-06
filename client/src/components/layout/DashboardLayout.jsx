import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    LayoutDashboard, 
    FileText, 
    Users, 
    Settings, 
    LogOut, 
    Menu, 
    X,
    Bell,
    CheckSquare,
    BookOpen
} from 'lucide-react';
import { Button } from '../ui/button';

const DashboardLayout = ({ children, role }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = {
        admin: [
            { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
            { icon: Users, label: 'Reviewers', path: '/admin/reviewers' },
            { icon: FileText, label: 'Pending Approvals', path: '/admin/pending-reviewers' },
            { icon: BookOpen, label: 'All Papers', path: '/admin/papers' },
        ],
        reviewer: [
            { icon: LayoutDashboard, label: 'Dashboard', path: '/reviewer' },
            { icon: FileText, label: 'Assigned Papers', path: '/reviewer/assigned' },
            { icon: CheckSquare, label: 'Completed Reviews', path: '/reviewer/completed' },
        ],
        author: [
            { icon: LayoutDashboard, label: 'My Papers', path: '/author' },
            { icon: FileText, label: 'Submit New Paper', path: '/submit-paper' }, // Link to public for now or internal
        ]
    };

    const currentNav = navItems[role] || [];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`
                    fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300
                    transform transition-transform duration-200 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <BookOpen className="text-primary mr-2" size={24} />
                    <span className="text-xl font-bold text-white tracking-tight">ResearchDesk</span>
                </div>

                <div className="p-4 space-y-1">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        Menu
                    </div>
                    {currentNav.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== role && location.pathname.startsWith(item.path));
                        return (
                            <Link 
                                key={item.path} 
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                    ${isActive 
                                        ? 'bg-primary text-white' 
                                        : 'hover:bg-slate-800 hover:text-white'
                                    }
                                `}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>

                <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
                    <button 
                        className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <span className="text-sm text-slate-500 hidden sm:inline-block">
                            Welcome, <span className="font-semibold text-slate-800">{user?.name}</span>
                        </span>
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-primary font-bold shadow-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
