import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';

const ReviewerDashboard = () => {
    const { user, logout } = useAuth();
    const [papers, setPapers] = useState([]);
    
    // Review State (mapped by paperId ideally, but simple form here)
    const [activePaper, setActivePaper] = useState(null);
    const [remark, setRemark] = useState('');
    const [recommendation, setRecommendation] = useState('APPROVE'); // APPROVE | REJECT
    const [successDialogOpen, setSuccessDialogOpen] = useState(false);

    const fetchAssignedPapers = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/api/papers/assigned');
            setPapers(res.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        fetchAssignedPapers();
    }, [fetchAssignedPapers]);

    const submitReview = async (paperId) => {
        try {
            await axiosInstance.post('/api/papers/review', {
                paperId,
                remark,
                recommendation
            });
            // alert('Review submitted successfully');
            setSuccessDialogOpen(true);
            setActivePaper(null);
            fetchAssignedPapers();
        } catch (error) {
            alert(error.response?.data?.message || 'Submission failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
             <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reviewer Dashboard</h1>
                    <p className="text-gray-500">Welcome, {user?.name}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={logout}>Logout</Button>
            </header>

            <main className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-xl font-semibold">Assigned Papers</h2>
                {papers.length === 0 && <p className="text-gray-500">No papers assigned yet.</p>}
                
                {papers.map(paper => {
                    // Find the review entry for the current logged-in user
                    const myReview = paper.reviewers?.find(r => 
                         (r.reviewerId?._id === user?._id) || (r.reviewerId === user?._id)
                    );

                    return (
                        <Card key={paper._id}>
                            <CardHeader>
                                <CardTitle>{paper.title}</CardTitle>
                                <CardDescription>
                                    Paper Status: {paper.status} | My Status: <span className={myReview?.status === 'REVIEWED' ? 'text-green-600 font-bold' : 'text-orange-600'}>{myReview?.status || 'ASSIGNED'}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-4">{paper.abstract}</p>
                                <div className="flex gap-4 mb-4">
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={paper.cloudinaryUrl} target="_blank" rel="noopener noreferrer">Download PDF</a>
                                    </Button>
                                    
                                    {/* Show button if I haven't reviewed yet OR if I want to update? Limit to pending for now to match logic */}
                                    {paper.status === 'UNDER_REVIEW' && (
                                        <Button size="sm" onClick={() => {
                                            setActivePaper(paper._id);
                                            setRemark(myReview?.remark || '');
                                            setRecommendation(myReview?.recommendation || 'APPROVE');
                                        }}>
                                            {myReview?.status === 'REVIEWED' ? 'Edit Review' : 'Write Review'}
                                        </Button>
                                    )}
                                </div>

                                {(activePaper === paper._id) && (
                                    <div className="bg-slate-100 p-4 rounded-md space-y-4 border">
                                        <h3 className="font-semibold text-sm">Submit Review</h3>
                                        <div>
                                            <Label htmlFor="rec">Recommendation</Label>
                                            <select 
                                                id="rec"
                                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={recommendation}
                                                onChange={(e) => setRecommendation(e.target.value)}
                                            >
                                                <option value="APPROVE">Approve</option>
                                                <option value="REJECT">Reject</option>
                                            </select>
                                        </div>
                                        <div>
                                            <Label htmlFor="remark">Remarks</Label>
                                            <textarea 
                                                id="remark"
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                value={remark}
                                                onChange={(e) => setRemark(e.target.value)}
                                                placeholder="Your detailed comments..."
                                            />
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => setActivePaper(null)}>Cancel</Button>
                                            <Button size="sm" onClick={() => submitReview(paper._id)}>Submit Review</Button>
                                        </div>
                                    </div>
                                )}

                                {myReview?.status === 'REVIEWED' && activePaper !== paper._id && (
                                    <div className="mt-4 text-sm bg-green-50 p-3 rounded border border-green-200">
                                        <p><strong>Your Recommendation:</strong> {myReview.recommendation}</p>
                                        <p><strong>Your Remarks:</strong> {myReview.remark}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </main>

            <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Submitted</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 text-slate-700">
                        Your review has been submitted successfully. Thank you for your contribution!
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setSuccessDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReviewerDashboard;
