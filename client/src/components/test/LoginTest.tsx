
export default function LoginTest() {
  const { login, user, isAuthenticated, isLoading, error } = useAuth();
  const [testCredentials, setTestCredentials] = useState({
    username: 'STREETPATROL808',
    password: 'Password3211'
  });

  const handleTestLogin = async () => {
    const result = await login(testCredentials.username, testCredentials.password);
    console.log('Test login result:', result);
  };

  if (isAuthenticated && user) {
    return (
      <div className="p-4 bg-green-900 border border-green-700 rounded-lg">
        <h3 className="text-green-400 font-semibold mb-2">✅ Authentication Test Passed</h3>
        <p className="text-green-300">Logged in as: {user.firstName} {user.lastName}</p>
        <p className="text-green-300">Role: {user.role}</p>
        <p className="text-green-300">Email: {user.email}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-800 border border-slate-700 rounded-lg">
      <h3 className="text-white font-semibold mb-4">🧪 Authentication Test</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-300">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-1">Username:</label>
          <input
            type="text"
            value={testCredentials.username}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, username: e.target.value }))}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
          />
        </div>
        
        <div>
          <label className="block text-slate-300 mb-1">Password:</label>
          <input
            type="password"
            value={testCredentials.password}
            onChange={(e) => setTestCredentials(prev => ({ ...prev, password: e.target.value }))}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white"
          />
        </div>
        
        <button
          onClick={handleTestLogin}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white py-2 px-4 rounded transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Login'}
        </button>
      </div>
    </div>
  );
}

import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
