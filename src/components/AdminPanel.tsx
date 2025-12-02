import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import BulkRepoCreator from './BulkRepoCreator';
import BulkPromptCreator from './BulkPromptCreator';
import { LogOut, Shield, Database, FileText } from 'lucide-react';

const ADMIN_USERNAME = 'prompt2025';
const ADMIN_PASSWORD = '$pro$hifi';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Check if already logged in (simple session storage)
    const loggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
    console.log('AdminPanel: Checking login status:', loggedIn);
    setIsLoggedIn(loggedIn);
  }, []);

  const forceLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('adminLoggedIn');
    setUsername('');
    setPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AdminPanel: Attempting login with username:', username);
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log('AdminPanel: Login successful');
      setIsLoggedIn(true);
      sessionStorage.setItem('adminLoggedIn', 'true');
      setLoginError('');
    } else {
      console.log('AdminPanel: Login failed');
      setLoginError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('adminLoggedIn');
    setUsername('');
    setPassword('');
  };

  if (!isLoggedIn) {
    console.log('AdminPanel: Rendering login form');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg border">
          <h2 className="text-center text-xl font-bold mb-4">Admin Login</h2>
          {sessionStorage.getItem('adminLoggedIn') === 'true' && (
            <div className="text-sm text-orange-600 text-center mb-4">
              You appear to be logged in already. 
              <button 
                onClick={forceLogout}
                className="text-blue-600 hover:underline ml-1"
              >
                Force logout
              </button>
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {loginError && (
              <p className="text-red-500 text-sm">{loginError}</p>
            )}
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-black font-medium py-2 px-4 rounded-md transition-colors"
            >
              Login to Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold">Admin Bulk Operations</h1>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1 text-black">
              <Shield className="w-3 h-3" />
              Secure Access
            </Badge>
          </div>
          <Button onClick={handleLogout} variant="outline" className="hover:bg-red-50 hover:border-red-200">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Bulk Repositories</p>
                  <p className="text-xs text-gray-500">Create multiple repos from Excel</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Bulk Prompts</p>
                  <p className="text-xs text-gray-500">Add prompts to repositories</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Admin Controls</p>
                  <p className="text-xs text-gray-500">Safe bulk operations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="repos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="repos">Bulk Create Repos</TabsTrigger>
            <TabsTrigger value="prompts">Bulk Create Prompts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="repos">
            <div className="p-4 border rounded-lg">
              <BulkRepoCreator />
            </div>
          </TabsContent>
          
          <TabsContent value="prompts">
            <div className="p-4 border rounded-lg">
              <BulkPromptCreator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}