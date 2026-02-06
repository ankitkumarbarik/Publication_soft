import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { FileText, UserPlus, Trash2, Check, X } from 'lucide-react';

const AdminPapers = () => {
    const [papers, setPapers] = useState([]);
    const [reviewers, setReviewers] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const [selectedReviewers, setSelectedReviewers] = useState({});
    
    // Dialog state
    const [confirmDialog, setConfirmDialog] = useState({ open: false, paperId: null, reviewerId: null });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [papersRes, reviewersRes] = await Promise.all([
                axiosInstance.get('/api/papers/all'),
                axiosInstance.get('/api/users/reviewers')
            ]);
            setPapers(papersRes.data);
            setReviewers(reviewersRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    // Generic Message Dialog
    const [messageDialog, setMessageDialog] = useState({ open: false, title: '', message: '', type: 'info' });

    const showMessage = (title, message, type = 'info') => {
        setMessageDialog({ open: true, title, message, type });
    };

    const handleAssign = async (paperId) => {
        const reviewerId = selectedReviewers[paperId];
        if (!reviewerId) return;
        
        try {
            setProcessingId(paperId);
            await axiosInstance.post('/api/papers/assign', { paperId, reviewerId });
            fetchData(); // Refresh
            setSelectedReviewers(prev => ({ ...prev, [paperId]: '' }));
            showMessage("Success", "Reviewer assigned successfully", "success");
        } catch {
            showMessage("Error", "Failed to assign reviewer", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemoveReviewer = async () => {
        const { paperId, reviewerId } = confirmDialog;
        if (!paperId || !reviewerId) return;

        try {
            setProcessingId(paperId);
            await axiosInstance.post('/api/papers/remove-reviewer', { paperId, reviewerId });
            fetchData();
            setConfirmDialog({ open: false, paperId: null, reviewerId: null });
            showMessage("Success", "Reviewer removed successfully", "success");
        } catch {
            showMessage("Error", "Failed to remove reviewer", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const [decisionDialog, setDecisionDialog] = useState({ open: false, paperId: null, decision: null });

    const handleDecision = (paperId, decision) => {
        setDecisionDialog({ open: true, paperId, decision });
    };

    const executeDecision = async () => {
        const { paperId, decision } = decisionDialog;
        if (!paperId || !decision) return;

        try {
            setProcessingId(paperId);
            await axiosInstance.post('/api/papers/decision', { paperId, decision });
            fetchData();
            setDecisionDialog({ open: false, paperId: null, decision: null });
            showMessage("Success", `Paper ${decision === 'PUBLISH' ? 'Published' : 'Rejected'} successfully`, "success");
        } catch {
             showMessage("Error", "Failed to record decision", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
             'PUBLISHED': 'bg-green-100 text-green-800',
             'REJECTED': 'bg-red-100 text-red-800',
             'UNDER_REVIEW': 'bg-amber-100 text-amber-800',
             'SUBMITTED': 'bg-blue-100 text-blue-800'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Manage Papers</h1>
                <p className="text-slate-500">Oversee submission workflows and publication decisions.</p>
            </div>

            <div className="space-y-6">
                {papers.map(paper => (
                    <Card key={paper._id} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4 bg-slate-50/50">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="text-lg">{paper.title}</CardTitle>
                                        {getStatusBadge(paper.status)}
                                    </div>
                                    <CardDescription>
                                        Author: <span className="font-semibold text-slate-700">{paper.authorId?.name}</span> | 
                                        Submitted: {new Date(paper.submittedAt).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <a href={paper.cloudinaryUrl} target="_blank" rel="noopener noreferrer">
                                        <FileText size={14} className="mr-2" /> PDF
                                    </a>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm text-slate-600 mb-6 bg-white p-3 rounded border border-slate-100">
                                {paper.abstract}
                            </p>

                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-900">Review Process</h4>
                                
                                {paper.reviewers?.length > 0 ? (
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {paper.reviewers.map((rev, idx) => (
                                            <div key={idx} className="flex justify-between items-start p-3 bg-white rounded border text-sm">
                                                <div>
                                                    <div className="font-medium text-slate-800">{rev.reviewerId?.name}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                        Status: 
                                                        <span className={`font-semibold ${rev.status === 'REVIEWED' ? 'text-green-600' : 'text-amber-600'}`}>
                                                            {rev.status === 'REVIEWED' ? (rev.recommendation || 'REVIEWED') : rev.status}
                                                        </span>
                                                    </div>
                                                    {rev.remark && (
                                                        <div className="mt-2 text-slate-600 italic bg-slate-50 p-2 rounded text-xs border-l-2 border-slate-300">
                                                            "{rev.remark}"
                                                        </div>
                                                    )}
                                                </div>
                                                {paper.status !== 'PUBLISHED' && paper.status !== 'REJECTED' && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-6 w-6 text-slate-400 hover:text-red-500"
                                                        onClick={() => setConfirmDialog({ open: true, paperId: paper._id, reviewerId: rev.reviewerId?._id || rev.reviewerId })}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No reviewers assigned yet.</p>
                                )}

                                {/* Assign Reviewer control */}
                                {paper.status !== 'PUBLISHED' && paper.status !== 'REJECTED' && (
                                    <div className="flex items-center gap-2 max-w-md mt-2">
                                        <select 
                                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                            value={selectedReviewers[paper._id] || ''}
                                            onChange={(e) => setSelectedReviewers(prev => ({ ...prev, [paper._id]: e.target.value }))}
                                        >
                                            <option value="">Select Reviewer to Assign...</option>
                                            {reviewers
                                                .filter(r => !paper.reviewers?.some(pr => (pr.reviewerId?._id || pr.reviewerId) === (r._id)))
                                                .map(r => (
                                                    <option key={r._id} value={r._id}>{r.name}</option>
                                                ))
                                            }
                                        </select>
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleAssign(paper._id)}
                                            disabled={!selectedReviewers[paper._id] || processingId === paper._id}
                                        >
                                            {processingId === paper._id ? '...' : <UserPlus size={16} />}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                             {paper.status !== 'PUBLISHED' && paper.status !== 'REJECTED' ? (
                                 <>
                                     <Button 
                                         variant="destructive" 
                                         size="sm"
                                         onClick={() => handleDecision(paper._id, 'REJECT')}
                                         disabled={processingId === paper._id}
                                     >
                                         <X size={16} className="mr-2" /> Reject
                                     </Button>
                                     <Button 
                                         className="bg-green-600 hover:bg-green-700"
                                         size="sm"
                                         onClick={() => handleDecision(paper._id, 'PUBLISH')}
                                         disabled={processingId === paper._id}
                                     >
                                         <Check size={16} className="mr-2" /> Publish Paper
                                     </Button>
                                 </>
                             ) : (
                                 <span className="text-sm text-slate-400 font-medium italic">Decision Finalized</span>
                             )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Remove Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, paperId: null, reviewerId: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Removal</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Are you sure you want to remove this reviewer?
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDialog({ open: false, paperId: null, reviewerId: null })}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRemoveReviewer}>Remove</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generic Message Dialog */}
            <Dialog open={messageDialog.open} onOpenChange={(open) => !open && setMessageDialog({ ...messageDialog, open: false })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className={messageDialog.type === 'error' ? 'text-red-600' : 'text-slate-900'}>
                            {messageDialog.title}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-slate-600">
                        {messageDialog.message}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setMessageDialog({ ...messageDialog, open: false })}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decision Confirmation Dialog */}
            <Dialog open={decisionDialog.open} onOpenChange={(open) => !open && setDecisionDialog({ ...decisionDialog, open: false })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Decision</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        Are you sure you want to <strong>{decisionDialog.decision}</strong> this paper?
                        <p className="text-sm text-slate-500 mt-2">This action is irreversible and will notify the author.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDecisionDialog({ ...decisionDialog, open: false })}>Cancel</Button>
                        <Button 
                            className={decisionDialog.decision === 'PUBLISH' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            onClick={executeDecision}
                        >
                            Confirm {decisionDialog.decision === 'PUBLISH' ? 'Publish' : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminPapers;
