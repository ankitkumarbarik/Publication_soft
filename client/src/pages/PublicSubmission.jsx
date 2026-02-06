import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog"
import { UploadCloud, FileText, User, Mail, CheckCircle, AlertCircle } from 'lucide-react';

const PublicSubmission = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(''); // For error messages
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

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
        // If logged in, backend uses ID, but we send these anyway as fallback/validation
        formData.append('name', name);
        formData.append('email', email);
        formData.append('file', file);
        
        setLoading(true);
        setMessage('');

        try {
            await axiosInstance.post('/api/papers/submit', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowSuccessDialog(true);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessClose = () => {
        if (user) {
            // Redirect based on role if needed, or just to their dashboard
            user.role === 'admin' ? navigate('/admin') : 
            user.role === 'reviewer' ? navigate('/reviewer') : navigate('/author');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4 md:p-8">
            <Card className="w-full max-w-3xl shadow-xl border-slate-100/50">
                <CardHeader className="bg-white border-b border-slate-100 pb-8">
                    <div className="flex flex-col items-center space-y-2 text-center">
                        <div className="p-3 bg-primary/10 rounded-full mb-2">
                             <UploadCloud className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">Submit Research Paper</CardTitle>
                        <CardDescription className="text-base text-slate-600 max-w-lg">
                            {user ? `Submitting as ${user.name}` : 'Submit your manuscript for peer review. Authors without an account will have one created automatically.'}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2 text-slate-700">
                                    <User className="h-4 w-4" /> Full Name
                                </Label>
                                <Input 
                                    id="name" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    required 
                                    disabled={!!user}
                                    placeholder="e.g. Dr. Jane Smith" 
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2 text-slate-700">
                                    <Mail className="h-4 w-4" /> Email Address
                                </Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required 
                                    disabled={!!user}
                                    placeholder="jane.smith@university.edu" 
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title" className="flex items-center gap-2 text-slate-700">
                                <FileText className="h-4 w-4" /> Paper Title
                            </Label>
                            <Input 
                                id="title" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)} 
                                required 
                                placeholder="Enter the full title of your research paper" 
                                className="font-medium bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="abstract" className="text-slate-700">Abstract</Label>
                            <textarea 
                                id="abstract" 
                                className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus:bg-white focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none"
                                value={abstract} 
                                onChange={(e) => setAbstract(e.target.value)} 
                                required 
                                placeholder="Provide a concise summary of your research objectives, methodology, and key findings..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file" className="text-slate-700">PDF Manuscript</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 hover:bg-slate-100 transition-colors text-center cursor-pointer relative">
                                <Input 
                                    id="file" 
                                    type="file" 
                                    accept="application/pdf" 
                                    onChange={handleFileChange} 
                                    required 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                                    {file ? (
                                        <>
                                            <FileText className="h-8 w-8 text-primary" />
                                            <span className="text-sm font-medium text-slate-900">{file.name}</span>
                                            <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="h-8 w-8 text-slate-400" />
                                            <span className="text-sm text-slate-600">Click to upload or drag and drop</span>
                                            <span className="text-xs text-slate-400">PDF files only (Max 10MB)</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-4 w-4" />
                                {message}
                            </div>
                        )}

                        <Button type="submit" className="w-full h-11 text-base font-medium shadow-md hover:shadow-lg transition-all" disabled={loading}>
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"/> Submitting...
                                </span>
                            ) : 'Submit Paper'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t py-6 bg-slate-50/50">
                    <p className="text-sm text-slate-500">
                        {user ? (
                            <Link to={user.role === 'admin' ? '/admin' : user.role === 'reviewer' ? '/reviewer' : '/author'} className="font-medium text-primary hover:underline">
                                Return to Dashboard
                            </Link>
                        ) : (
                            <>Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login here</Link></>
                        )}
                    </p>
                </CardFooter>
            </Card>

            <Dialog open={showSuccessDialog} onOpenChange={(open) => {
                if (!open) handleSuccessClose();
                setShowSuccessDialog(open);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogTitle className="text-center text-xl text-green-700">Submission Successful!</DialogTitle>
                        <DialogDescription className="text-center pt-2 space-y-2">
                            <p>Your paper has been securely submitted for review.</p>
                            
                            {!user && (
                                <div className="bg-slate-50 p-3 rounded-md border border-slate-100 text-left mt-4 text-slate-700 text-sm">
                                    <p className="font-semibold mb-1">Account Created:</p>
                                    <p>Email: <span className="font-mono text-slate-900">{email}</span></p>
                                    <p className="text-xs text-slate-500 mt-2">A temporary password has been sent to your email. Please check your inbox and spam folder.</p>
                                </div>
                            )}
                            {user && (
                                <div className="bg-green-50 p-3 rounded-md border border-green-100 text-green-800 text-sm mt-4">
                                    <p>The paper is now linked to your account. You can track its status in your dashboard.</p>
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center">
                        <Button className="w-full sm:w-auto" onClick={handleSuccessClose}>
                            {user ? 'Go to Dashboard' : 'Proceed to Login'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PublicSubmission;
