import React, { useEffect, useState } from 'react';
import { getUsers } from '../../lib/localStorage';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = () => {
      const usersData = getUsers();
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Registered Users</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-200">Name</th>
                <th className="py-2 px-4 border-b border-gray-200">Email</th>
                <th className="py-2 px-4 border-b border-gray-200">Registration No</th>
                <th className="py-2 px-4 border-b border-gray-200">Mobile</th>
                <th className="py-2 px-4 border-b border-gray-200">Branch</th>
                <th className="py-2 px-4 border-b border-gray-200">Year</th>
                <th className="py-2 px-4 border-b border-gray-200">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b border-gray-200">{user.name}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{user.email}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{user.registration_no}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{user.mobile}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{user.branch}</td>
                  <td className="py-2 px-4 border-b border-gray-200">{user.year}</td>
                  <td className="py-2 px-4 border-b border-gray-200 capitalize">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
