import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge"; // Ensure Badge exists
import { Textarea } from "../../components/ui/textarea"; // Ensure Textarea exists
import { FileText, CheckCircle, Clock } from 'lucide-react';

const ReviewerDashboard = () => {
    const location = useLocation();
    const [papers, setPapers] = useState([]);
    
    // Review Dialog State
    const [selectedPaper, setSelectedPaper] = useState(null);
    const [remark, setRemark] = useState('');
    const [recommendation, setRecommendation] = useState('ACCEPTED');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    // Determine view based on URL
    // /reviewer/assigned -> Show pending
    // /reviewer/completed -> Show reviewed
    // /reviewer -> Show all or pending
    const showCompleted = location.pathname.includes('completed');

    const fetchAssignedPapers = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/api/papers/assigned');
            // Backend returns all assigned. We filter on frontend for now.
            // Ideally backend should filter.
            setPapers(res.data);
        } catch (error) {
            console.error("Error fetching papers", error);
        }
    }, []);

    useEffect(() => {
        fetchAssignedPapers();
    }, [fetchAssignedPapers]);

    const submitReview = async () => {
        if (!selectedPaper) return;

        try {
            await axiosInstance.post('/api/papers/review', {
                paperId: selectedPaper._id,
                remark,
                recommendation
            });
            setDialogOpen(false);
            setSuccessDialogOpen(true);
            fetchAssignedPapers(); // Refresh list
        } catch (error) {
            console.error("Review failed", error);
            alert("Failed to submit review");
        }
    };

    const openReviewDialog = (paper) => {
        setSelectedPaper(paper);
        // Pre-fill if editing
        const myReview = paper.reviewers?.find(r => {
             const rId = r.reviewerId?._id || r.reviewerId;
             const uId = currentUser?._id || currentUser?.id;
             return String(rId) === String(uId);
        });

        if (myReview && myReview.status === 'REVIEWED') {
            setRemark(myReview.remark || '');
            setRecommendation(myReview.recommendation || 'ACCEPTED');
        } else {
            setRemark('');
            setRecommendation('ACCEPTED');
        }
        setDialogOpen(true);
    };

    // Filter papers based on view
    // Paper struct: { ..., reviewers: [ { reviewerId: me, status: 'ASSIGNED'/'REVIEWED' } ] }
    const { user: currentUser } = useAuth();
    
    // Filter logic:
    // PENDING: My status is 'ASSIGNED'
    // COMPLETED: My status is 'REVIEWED'

    return (
        <DashboardLayout role="reviewer">
            <div className="space-y-6">
                 <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {showCompleted ? 'Completed Reviews' : 'Assigned Papers'}
                    </h1>
                    <p className="text-slate-500">
                        {showCompleted 
                            ? 'History of your contributed reviews.' 
                            : 'Papers waiting for your expert review.'}
                    </p>
                </div>

                <div className="grid gap-6">
                    {papers.filter(p => {
                        // Find my reviewer entry safely
                        const myReview = p.reviewers?.find(r => {
                            const rId = r.reviewerId?._id || r.reviewerId;
                            const uId = currentUser?._id || currentUser?.id;
                            return String(rId) === String(uId);
                        });
                        
                        if (!myReview) return false; 
                        if (showCompleted) return myReview.status === 'REVIEWED';
                        return myReview.status === 'ASSIGNED';
                    }).length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                             <p className="text-slate-500">No papers found in this category.</p>
                        </div>
                    ) : (
                        papers.filter(p => {
                            const myReview = p.reviewers?.find(r => {
                                const rId = r.reviewerId?._id || r.reviewerId;
                                const uId = currentUser?._id || currentUser?.id;
                                return String(rId) === String(uId);
                            });
                            if (showCompleted) return myReview && myReview.status === 'REVIEWED';
                            return myReview && myReview.status === 'ASSIGNED';
                        }).map(paper => (
                            <Card key={paper._id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle>{paper.title}</CardTitle>
                                            <CardDescription>Author: {paper.authorId?.name || 'Hidden'}</CardDescription>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                                            paper.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100'
                                        }`}>
                                            {paper.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 mb-4">{paper.abstract}</p>
                                    <div className="flex gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1"><Clock size={12}/> Submitted: {new Date(paper.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 flex justify-end gap-3">
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={paper.cloudinaryUrl} target="_blank" rel="noopener noreferrer"><FileText size={14} className="mr-2"/> View PDF</a>
                                    </Button>
                                    
                                    <Button size="sm" 
                                        onClick={() => openReviewDialog(paper)}
                                        disabled={paper.status === 'PUBLISHED' || paper.status === 'REJECTED'}
                                        className={paper.status === 'PUBLISHED' || paper.status === 'REJECTED' ? 'opacity-50 cursor-not-allowed' : ''}
                                    >
                                        {showCompleted ? 'Edit Review' : 'Submit Review'}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Submit Review Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Submit Review</DialogTitle>
                            <CardDescription>Evaluate "{selectedPaper?.title}"</CardDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Remark / Feedback</Label>
                                {/* Textarea component needed, using primitive if not available */}
                                <textarea 
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter your detailed feedback for the author..."
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Recommendation</Label>
                                <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={recommendation}
                                    onChange={(e) => setRecommendation(e.target.value)}
                                >
                                    <option value="ACCEPTED">Accept</option>
                                    <option value="REJECTED">Reject</option>
                                    <option value="CHANGES_REQUIRED">Changes Required</option>
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={submitReview}>Submit Review</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                 {/* Success Dialog */}
                 <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Review Submitted</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 text-slate-700 flex items-center gap-3">
                             <CheckCircle className="text-green-500" size={24} />
                             <div>
                                 <p className="font-medium">Thank you for your contribution!</p>
                                 <p className="text-sm text-slate-500">Your review has been recorded successfully.</p>
                             </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setSuccessDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </DashboardLayout>
    );
};

export default ReviewerDashboard;
