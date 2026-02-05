import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog'; // Assuming Dialog implementation or use standard if missing
// I haven't implemented Dialog.jsx yet. I'll use a simple conditional render overlay for now or a Select dropdown inline.

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [view, setView] = useState('reviewers'); // 'reviewers' or 'papers'
    const [reviewers, setReviewers] = useState([]);
    const [pendingReviewers, setPendingReviewers] = useState([]);
    const [papers, setPapers] = useState([]);
    const [refresh, setRefresh] = useState(0);

    const fetchReviewers = async () => {
        try {
            const pendingRes = await axiosInstance.get('/api/users/pending-reviewers');
            setPendingReviewers(pendingRes.data);
            const allRes = await axiosInstance.get('/api/users/reviewers');
            setReviewers(allRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPapers = async () => {
        try {
            const res = await axiosInstance.get('/api/papers/all');
            setPapers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchReviewers();
        fetchPapers();
    }, [refresh]);

    const handleReviewerStatus = async (userId, status) => {
        try {
            await axiosInstance.post('/api/users/reviewer-status', { userId, status });
            setRefresh(p => p + 1);
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        }
    };

    const handleAssign = async (paperId, reviewerId) => {
        if (!reviewerId) return;
        try {
             await axiosInstance.post('/api/papers/assign', { paperId, reviewerId });
             setRefresh(p => p + 1);
             alert('Reviewer assigned');
        } catch (error) {
            alert(error.response?.data?.message || 'Assignment failed');
        }
    };

    const handleDecision = async (paperId, decision) => {
        try {
             await axiosInstance.post('/api/papers/decision', { paperId, decision });
             setRefresh(p => p + 1);
        } catch (error) {
            alert(error.response?.data?.message || 'Decision failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <header className="flex justify-between items-center mb-8 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">System Overview</p>
                </div>
                <div className="flex gap-4">
                    <Button variant={view === 'reviewers' ? 'default' : 'outline'} onClick={() => setView('reviewers')}>Manage Reviewers</Button>
                    <Button variant={view === 'papers' ? 'default' : 'outline'} onClick={() => setView('papers')}>Manage Papers</Button>
                    <Button variant="destructive" size="sm" onClick={logout}>Logout</Button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto">
                {view === 'reviewers' && (
                    <div className="space-y-8">
                        {/* Pending Reviewers */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Pending Approvals ({pendingReviewers.length})</h2>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pendingReviewers.map(r => (
                                    <Card key={r._id}>
                                        <CardHeader>
                                            <CardTitle>{r.name}</CardTitle>
                                            <CardDescription>{r.email}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm font-medium">Qualifications:</p>
                                            <p className="text-sm text-gray-600">{r.qualifications}</p>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button size="sm" onClick={() => handleReviewerStatus(r._id, 'APPROVED')} className="w-full bg-green-600 hover:bg-green-700">Approve</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleReviewerStatus(r._id, 'REJECTED')} className="w-full">Reject</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                                {pendingReviewers.length === 0 && <p className="text-gray-500 italic">No pending applications.</p>}
                            </div>
                        </section>
                        
                        {/* Active Reviewers */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Active Reviewers ({reviewers.length})</h2>
                            <div className="bg-white rounded-md border p-4">
                                <ul className="space-y-2">
                                    {reviewers.map(r => (
                                        <li key={r._id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                            <div>
                                                <p className="font-medium">{r.name}</p>
                                                <p className="text-xs text-gray-500">{r.email}</p>
                                            </div>
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </section>
                    </div>
                )}

                {view === 'papers' && (
                    <div className="space-y-6">
                        {papers.map(paper => (
                            <Card key={paper._id} className="overflow-hidden">
                                <CardHeader className="bg-gray-50/50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{paper.title}</CardTitle>
                                            <CardDescription>
                                                Author: {paper.authorId?.name || 'Unknown'} | Status: <b className="uppercase text-primary">{paper.status.replace('_', ' ')}</b>
                                            </CardDescription>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                             <a href={paper.cloudinaryUrl} target="_blank" rel="noopener noreferrer">View PDF</a>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <p className="text-sm text-gray-600 mb-4">{paper.abstract}</p>
                                    
                                    {/* Reviewer Section */}
                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-md border">
                                        <span className="text-sm font-medium">Reviewer:</span>
                                        {paper.reviewerId ? (
                                            <div className="flex-1 text-sm">
                                                {paper.reviewerId.name}
                                                {paper.status === 'UNDER_REVIEW' && paper.reviewRecommendation && (
                                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                                        Rec: {paper.reviewRecommendation}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <select 
                                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                onChange={(e) => handleAssign(paper._id, e.target.value)}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Assign Reviewer...</option>
                                                {reviewers.map(r => (
                                                    <option key={r._id} value={r._id}>{r.name}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Feedback Display */}
                                    {paper.reviewRemark && (
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded text-sm">
                                            <strong>Reviewer Remark:</strong> {paper.reviewRemark}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-gray-50/50 flex justify-end gap-2">
                                    {paper.status !== 'PUBLISHED' && paper.status !== 'REJECTED' && (
                                        <>
                                            <Button variant="destructive" onClick={() => handleDecision(paper._id, 'REJECT')}>Reject Paper</Button>
                                            <Button onClick={() => handleDecision(paper._id, 'PUBLISH')} className="bg-green-600 hover:bg-green-700">Publish Paper</Button>
                                        </>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
