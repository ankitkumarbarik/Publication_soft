import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { UserCheck, UserX } from 'lucide-react';

const AdminPendingReviewers = () => {
    const [pendingReviewers, setPendingReviewers] = useState([]);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await axiosInstance.get('/api/users/pending-reviewers');
            setPendingReviewers(res.data);
        } catch (error) {
            console.error("Error fetching pending reviewers", error);
        }
    };

    const handleStatus = async (userId, status) => {
        try {
            setProcessingId(userId);
            await axiosInstance.post('/api/users/reviewer-status', { userId, status });
            // Remove from list locally
            setPendingReviewers(prev => prev.filter(r => r._id !== userId));
        } catch (error) {
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
                <p className="text-slate-500">Review and approve new reviewer applications.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingReviewers.map(r => (
                    <Card key={r._id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{r.name}</CardTitle>
                                    <CardDescription>{r.email}</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Pending</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div className="space-y-1 mb-2">
                                <span className="font-semibold text-slate-700">Qualifications:</span>
                                <p className="text-slate-600 bg-slate-50 p-2 rounded border">{r.qualifications}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50/50 p-3 flex gap-2">
                            <Button 
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                size="sm"
                                onClick={() => handleStatus(r._id, 'APPROVED')}
                                disabled={processingId === r._id}
                            >
                                <UserCheck size={16} className="mr-2" />
                                {processingId === r._id ? '...' : 'Approve'}
                            </Button>
                            <Button 
                                className="flex-1"
                                variant="destructive"
                                size="sm"
                                onClick={() => handleStatus(r._id, 'REJECTED')}
                                disabled={processingId === r._id}
                            >
                                <UserX size={16} className="mr-2" />
                                {processingId === r._id ? '...' : 'Reject'}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {pendingReviewers.length === 0 && (
                 <div className="text-center py-20 bg-white rounded-lg border border-dashed text-slate-500">
                     <p>No pending applications found.</p>
                 </div>
            )}
        </div>
    );
};

export default AdminPendingReviewers;
