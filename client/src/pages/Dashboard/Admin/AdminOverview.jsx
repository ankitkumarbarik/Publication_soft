import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        papers: 0,
        published: 0,
        reviewers: 0,
        pendingReviewers: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
             try {
                // Parallel fetch for overview data
                const [papersRes, reviewersRes, pendingRes] = await Promise.all([
                    axiosInstance.get('/api/papers/all'),
                    axiosInstance.get('/api/users/reviewers'),
                    axiosInstance.get('/api/users/pending-reviewers')
                ]);

                const papers = papersRes.data;
                setStats({
                    papers: papers.length,
                    published: papers.filter(p => p.status === 'PUBLISHED').length,
                    reviewers: reviewersRes.data.length,
                    pendingReviewers: pendingRes.data.length
                });

             } catch (error) {
                 console.error("Failed to fetch stats", error);
             }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: 'Total Papers', value: stats.papers, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Published', value: stats.published, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Active Reviewers', value: stats.reviewers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { title: 'Pending Approval', value: stats.pendingReviewers, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, idx) => (
                    <Card key={idx}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${card.bg}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {/* Quick Actions or Recent Activity could go here */}
            <div className="grid md:grid-cols-2 gap-6 pt-6">
                <Card>
                    <CardHeader>
                         <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">System activity log is coming soon.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminOverview;
