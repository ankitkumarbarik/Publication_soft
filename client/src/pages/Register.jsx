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
    qualifications: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register-reviewer`, formData);
      setSuccess('Registration successful! Please wait for admin approval.');
      // setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle>Reviewer Registration</CardTitle>
          <CardDescription>Join our panel of experts.</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
              <div className="text-green-600 text-center space-y-4">
                  <p>{success}</p>
                  <Button variant="outline" onClick={() => navigate('/login')}>Go to Login</Button>
              </div>
          ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input id="qualifications" placeholder="PhD, MSc, areas of expertise..." value={formData.qualifications} onChange={handleChange} required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required />
              </div>
            </div>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            <Button className="w-full mt-4" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
          )}
        </CardContent>
        {!success && (
        <CardFooter className="justify-center">
             <Link to="/login" className="text-sm underline text-blue-600">Already have an account?</Link>
        </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Register;
