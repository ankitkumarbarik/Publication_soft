import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';

const PublicSubmission = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please select a PDF file.');
            return;
        }
        
        const formData = new FormData();
        formData.append('title', title);
        formData.append('abstract', abstract);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('file', file);
        
        setLoading(true);
        setMessage('');

        try {
            await axiosInstance.post('/api/papers/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setMessage('Paper submitted successfully! An account has been created for you. Please check your email for login credentials.');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
            <Card className="w-full max-w-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Submit Research Paper</CardTitle>
                    <CardDescription>
                        Submit your paper for review. An account will be created for you automatically.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {success ? (
                        <div className="text-center space-y-6 py-8">
                            <div className="text-green-600 text-lg font-medium">{message}</div>
                            <p className="text-gray-600">Check your email ({email}) for your password.</p>
                            <Button onClick={() => navigate('/login')}>Proceed to Login</Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@university.edu" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="title">Paper Title</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Enter paper title" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="abstract">Abstract</Label>
                                <textarea 
                                    id="abstract" 
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={abstract} 
                                    onChange={(e) => setAbstract(e.target.value)} 
                                    required 
                                    placeholder="Brief summary of your research..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file">PDF File</Label>
                                <Input id="file" type="file" accept="application/pdf" onChange={handleFileChange} required />
                            </div>

                            {message && <div className="text-sm text-red-500">{message}</div>}

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Paper & Create Account'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                {!success && (
                    <CardFooter className="justify-center border-t p-4 bg-slate-50 rounded-b-lg">
                        <Link to="/login" className="text-sm text-gray-600 hover:underline">
                            Already have an account? Login
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};

export default PublicSubmission;
