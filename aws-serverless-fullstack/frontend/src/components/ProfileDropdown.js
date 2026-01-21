// In /frontend/src/components/ProfileDropdown.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

const ProfileDropdown = () => {
  const { logout, user } = useAuth();

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 focus:outline-none">
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <FiUser className="text-blue-600" />
        </div>
        <span className="text-sm font-medium text-gray-700">
          {user?.username || 'User'}
        </span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;