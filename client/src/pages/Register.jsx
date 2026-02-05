import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'author',
    qualifications: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRoleChange = (e) => {
      setFormData({ ...formData, role: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, formData);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Join our research community today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
              <div className="text-center space-y-6 py-6">
                  <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-slate-900">Registration Successful</p>
                    <p className="text-slate-500">{success}</p>
                  </div>
                  <Button className="w-full" onClick={() => navigate('/login')}>Proceed to Login</Button>
              </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <div className="relative">
                <select 
                    id="role" 
                    value={formData.role} 
                    onChange={handleRoleChange} 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    required
                >
                    <option value="author">Author</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="publisher">Publisher</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none opacity-50">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
            </div>

            {formData.role === 'reviewer' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label htmlFor="qualifications">Qualifications</Label>
                  <Input id="qualifications" placeholder="e.g. PhD Computer Science" value={formData.qualifications} onChange={handleChange} required />
                </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />
            </div>

            {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
            
            <Button className="w-full font-semibold" type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
          )}
        </CardContent>
        {!success && (
        <CardFooter className="justify-center border-t p-6 bg-slate-50/50">
             <div className="text-sm text-slate-600">
                Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login here</Link>
             </div>
        </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Register;
