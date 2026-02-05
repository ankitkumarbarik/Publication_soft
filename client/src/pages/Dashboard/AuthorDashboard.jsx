import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const AuthorDashboard = () => {
    const { user, logout } = useAuth();
    const [papers, setPapers] = useState([]);
    const [view, setView] = useState('list'); // 'list' or 'submit'
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (view === 'list') fetchPapers();
    }, [view]);

    const fetchPapers = async () => {
        try {
            // My papers endpoint? Requires filtering by author in backend or specific endpoint.
            // Backend paper.controller `getAllPapers` returns ALL. 
            // We need `getMyPapers` or specific route.
            // Wait, I implemented `getAssignedPapers` for reviewer, but not `getMyPapers` for author.
            // I should assume the Author endpoint might need created or filtered.
            // Let's check backend `paper.routes.js`.
            // Route `GET /api/papers/all` is admin only.
            // I missed `GET /api/papers/my-papers` for author.
            // I'll add that to backend later. For now, I'll implement the frontend and fix backend next.
            // Or I can filter on frontend if I had access, but I don't.
            // I'll call `/api/papers/my-papers` and implement it in backend in next step.
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/papers/my-papers`);
            setPapers(res.data);
        } catch (error) {
            console.error("Error fetching papers", error);
        }
    };

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
        formData.append('file', file);
        // Author details inferred from token
        
        setLoading(true);
        setMessage('');

        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/papers/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage('Paper submitted successfully!');
            setTitle('');
            setAbstract('');
            setFile(null);
            setTimeout(() => setView('list'), 1500);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'PUBLISHED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="flex justify-between items-center mb-8 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
                    <p className="text-gray-500">Welcome, {user?.name}</p>
                </div>
                <div className="flex gap-4">
                    <Button variant={view === 'list' ? 'secondary' : 'ghost'} onClick={() => setView('list')}>My Papers</Button>
                    <Button variant={view === 'submit' ? 'default' : 'outline'} onClick={() => setView('submit')}>Submit New Paper</Button>
                    <Button variant="destructive" size="sm" onClick={logout}>Logout</Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto">
                {view === 'submit' ? (
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>Submit Research Paper</CardTitle>
                            <CardDescription>Upload your PDF for review.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
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
                                {message && <div className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{message}</div>}
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Paper'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {papers.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-lg border shadow-sm">
                                <p className="text-gray-500 mb-4">You haven't submitted any papers yet.</p>
                                <Button onClick={() => setView('submit')}>Submit Your First Paper</Button>
                            </div>
                        ) : (
                            papers.map(paper => (
                                <Card key={paper._id}>
                                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                                        <div className="space-y-1">
                                            <CardTitle>{paper.title}</CardTitle>
                                            <CardDescription>Submitted on {new Date(paper.submittedAt).toLocaleDateString()}</CardDescription>
                                        </div>
                                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(paper.status)}`}>
                                            {paper.status.replace('_', ' ')}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{paper.abstract}</p>
                                        {paper.status === 'PUBLISHED' && (
                                            <div className="mt-4 p-4 bg-green-50 rounded-md border border-green-100">
                                                <p className="text-green-800 font-medium">Congratulations! Your paper has been published.</p>
                                            </div>
                                        )}
                                        {paper.reviewRemark && (
                                            <div className="mt-4">
                                                <p className="text-sm font-semibold">Reviewer Remark:</p>
                                                <p className="text-sm text-gray-600 italic">"{paper.reviewRemark}"</p>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                         <Button variant="outline" size="sm" asChild>
                                             <a href={paper.cloudinaryUrl} target="_blank" rel="noopener noreferrer">View PDF</a>
                                         </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AuthorDashboard;
