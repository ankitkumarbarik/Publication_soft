import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { CheckCircle } from 'lucide-react';

const AdminReviewers = () => {
    const [reviewers, setReviewers] = useState([]);

    useEffect(() => {
        const fetchReviewers = async () => {
            try {
                const res = await axiosInstance.get('/api/users/reviewers');
                setReviewers(res.data);
            } catch (error) {
                console.error("Error fetching reviewers", error);
            }
        };
        fetchReviewers();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Active Reviewers</h1>
                <p className="text-slate-500">Manage the panel of experts.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reviewer List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {reviewers.map((r) => (
                            <div key={r._id} className="py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                     <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border">
                                        {r.name.charAt(0).toUpperCase()}
                                     </div>
                                     <div>
                                         <p className="font-medium text-slate-900">{r.name}</p>
                                         <p className="text-sm text-slate-500">{r.email}</p>
                                     </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                    <CheckCircle size={14} /> Active
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {reviewers.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    No active reviewers found.
                </div>
            )}
        </div>
    );
};

export default AdminReviewers;
