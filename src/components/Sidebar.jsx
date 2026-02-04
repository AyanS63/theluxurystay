import React from "react"; // Explicit import for clarity, though not strictly needed in new JSX transform
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BedDouble,
  CalendarDays,
  CreditCard,
  Brush,
  LogOut,
  MessageSquare,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/dashboard/users", icon: Users },
    { name: "Rooms", path: "/dashboard/rooms", icon: BedDouble },
    { name: "Bookings", path: "/dashboard/bookings", icon: CalendarDays },
    { name: "Events", path: "/dashboard/events", icon: CalendarDays },
    { name: "Inquiries", path: "/dashboard/inquiries", icon: MessageSquare },

    { name: "Housekeeping", path: "/dashboard/housekeeping", icon: Brush },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div 
        className={clsx(
          "w-64 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed left-0 top-0 transition-transform duration-300 z-40",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0 md:shadow-none"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-xl font-bold font-serif text-primary-700 dark:text-primary-500">
            LuxuryStay
          </h1>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >

            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems
              .filter((item) => {
                if (!user) return false;
                if (user.role === "admin") return true;
                if (user.role === "manager") return true;

                // Receptionist/Staff logic
                const restrictedItems = ["Users"];
                return !restrictedItems.includes(item.name);
              })
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose} // Close sidebar on mobile when link clicked
                      className={clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 shadow-sm"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400"
                      )}
                    >
                      <Icon
                        size={20}
                        className={clsx(
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400"
                        )}
                      />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
