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
    const [processingPaperId, setProcessingPaperId] = useState(null);
    const [processingReviewerId, setProcessingReviewerId] = useState(null);
    const [selectedReviewers, setSelectedReviewers] = useState({}); // Map paperId -> reviewerId
    const [confirmation, setConfirmation] = useState({ open: false, paperId: null, reviewerId: null });

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
            setProcessingReviewerId(userId);
            await axiosInstance.post('/api/users/reviewer-status', { userId, status });
            setRefresh(p => p + 1);
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessingReviewerId(null);
        }
    };

    const handleAssign = async (paperId) => {
        const reviewerId = selectedReviewers[paperId];
        if (!reviewerId) return;
        try {
             setProcessingPaperId(paperId);
             await axiosInstance.post('/api/papers/assign', { paperId, reviewerId });
             setRefresh(p => p + 1);
             setSelectedReviewers(prev => ({ ...prev, [paperId]: undefined })); // Reset selection
        } catch (error) {
            alert(error.response?.data?.message || 'Assignment failed');
        } finally {
            setProcessingPaperId(null);
        }
    };

    const handleRemoveReviewer = (paperId, reviewerId) => {
        setConfirmation({ open: true, paperId, reviewerId });
    };

    const confirmRemove = async () => {
        const { paperId, reviewerId } = confirmation;
        if (!paperId || !reviewerId) return;
        
        try {
            setProcessingPaperId(paperId);
            await axiosInstance.post('/api/papers/remove-reviewer', { paperId, reviewerId });
            setRefresh(p => p + 1);
            setConfirmation({ open: false, paperId: null, reviewerId: null });
        } catch (error) {
            alert(error.response?.data?.message || 'Removal failed');
        } finally {
            setProcessingPaperId(null);
        }
    };

    const handleDecision = async (paperId, decision) => {
        try {
             setProcessingPaperId(paperId);
             await axiosInstance.post('/api/papers/decision', { paperId, decision });
             setRefresh(p => p + 1);
        } catch (error) {
            alert(error.response?.data?.message || 'Decision failed');
        } finally {
            setProcessingPaperId(null);
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
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleReviewerStatus(r._id, 'APPROVED')} 
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                disabled={processingReviewerId === r._id}
                                            >
                                                {processingReviewerId === r._id ? 'Processing...' : 'Approve'}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="destructive" 
                                                onClick={() => handleReviewerStatus(r._id, 'REJECTED')} 
                                                className="w-full"
                                                disabled={processingReviewerId === r._id}
                                            >
                                                {processingReviewerId === r._id ? 'Processing...' : 'Reject'}
                                            </Button>
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
                                    <div className="flex flex-col gap-3 bg-slate-50 p-3 rounded-md border text-sm">
                                        <div className="font-medium text-slate-900">Reviewers:</div>
                                        
                                        {/* List Assigned Reviewers */}
                                        {paper.reviewers && paper.reviewers.length > 0 ? (
                                            <ul className="space-y-2 mb-2">
                                                {paper.reviewers.map((rev, idx) => (
                                                    <li key={idx} className="flex justify-between items-center bg-white p-2 rounded border">
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{rev.reviewerId?.name || 'Unknown'}</span>
                                                            {rev.status === 'REVIEWED' && rev.recommendation && (
                                                                <span className={`text-xs px-2 py-0.5 rounded w-fit ${rev.recommendation === 'APPROVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                    {rev.recommendation}
                                                                </span>
                                                            )}
                                                            {rev.status === 'ASSIGNED' && (
                                                                <span className="text-xs text-gray-500 italic">Pending Review</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {rev.remark && (
                                                                <div className="text-xs text-gray-600 border-l pl-2 max-w-[150px] truncate" title={rev.remark}>
                                                                    {rev.remark}
                                                                </div>
                                                            )}
                                                            {paper.status !== 'PUBLISHED' && paper.status !== 'REJECTED' && (
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    title="Remove Reviewer"
                                                                    onClick={() => handleRemoveReviewer(paper._id, rev.reviewerId?._id || rev.reviewerId)}
                                                                >
                                                                    &times;
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-500 italic text-xs mb-2">No reviewers assigned.</p>
                                        )}

                                        {/* Assign New Reviewer */}
                                        {paper.status !== 'PUBLISHED' && paper.status !== 'REJECTED' && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <select 
                                                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
                                                    onChange={(e) => setSelectedReviewers(prev => ({ ...prev, [paper._id]: e.target.value }))}
                                                    value={selectedReviewers[paper._id] || ''}
                                                >
                                                    <option value="" disabled>Add Reviewer...</option>
                                                    {reviewers
                                                        // Filter out already assigned reviewers
                                                        .filter(r => !paper.reviewers?.some(pr => pr.reviewerId?._id === r._id || pr.reviewerId === r._id))
                                                        .map(r => (
                                                            <option key={r._id} value={r._id}>{r.name}</option>
                                                    ))}
                                                </select>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handleAssign(paper._id)}
                                                    disabled={!selectedReviewers[paper._id] || processingPaperId === paper._id}
                                                    className="h-9 whitespace-nowrap"
                                                >
                                                    {processingPaperId === paper._id ? 'Adding...' : 'Add Reviewer'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-gray-50/50 flex justify-end gap-2">
                                    {paper.status !== 'PUBLISHED' && paper.status !== 'REJECTED' && (
                                        <>
                                            <Button 
                                                variant="destructive" 
                                                onClick={() => handleDecision(paper._id, 'REJECT')}
                                                disabled={processingPaperId === paper._id}
                                            >
                                                {processingPaperId === paper._id ? 'Processing...' : 'Reject Paper'}
                                            </Button>
                                            <Button 
                                                onClick={() => handleDecision(paper._id, 'PUBLISH')} 
                                                className="bg-green-600 hover:bg-green-700 items-center gap-2"
                                                disabled={processingPaperId === paper._id}
                                            >
                                                {processingPaperId === paper._id && (
                                                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"/>
                                                )}
                                                {processingPaperId === paper._id ? 'Publishing...' : 'Publish Paper'}
                                            </Button>
                                        </>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <Dialog open={confirmation.open} onOpenChange={(open) => !open && setConfirmation(prev => ({ ...prev, open: false }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Removal</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-slate-700">
                        Are you sure you want to remove this reviewer? This action cannot be undone immediately if they have already submitted a review.
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmation({ open: false, paperId: null, reviewerId: null })}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmRemove}>Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;
