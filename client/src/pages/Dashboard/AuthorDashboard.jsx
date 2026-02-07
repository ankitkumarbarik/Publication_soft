import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge'; // Make sure Badge exists or use custom
import { FileText, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

const AuthorDashboard = () => {
    const [papers, setPapers] = useState([]);

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const res = await axiosInstance.get('/api/papers/my-papers');
                setPapers(res.data);
            } catch (error) {
                console.error("Error fetching papers", error);
            }
        };

        fetchPapers();
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'PUBLISHED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'UNDER_REVIEW': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    // Handle PDF viewing - opens server stream endpoint that bypasses Cloudinary auth
    const handleViewPdf = (paperId) => {
        // Open the streaming endpoint directly - server handles auth
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/papers/stream/${paperId}`, '_blank');
    };

    return (
        <DashboardLayout role="author">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">My Publications</h1>
                        <p className="text-slate-500">Track the status of your research submissions.</p>
                    </div>
                    <Button asChild>
                        <a href="/submit-paper">Submit New Paper</a>
                    </Button>
                </div>

                {papers.length === 0 ? (
                    <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="text-slate-400" size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Papers Submitted</h3>
                            <p className="text-slate-500 max-w-sm mb-6">
                                You haven't submitted any research papers yet. Start your journey by submitting your first manuscript.
                            </p>
                            <Button asChild>
                                <a href="/submit-paper">Submit Manuscript</a>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {papers.map((paper) => (
                            <Card key={paper._id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-semibold leading-tight text-slate-900">
                                            {paper.title}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            Submitted on {new Date(paper.submittedAt).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(paper.status)}`}>
                                        {paper.status.replace('_', ' ')}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                                        {paper.abstract}
                                    </p>
                                    
                                    {paper.status === 'PUBLISHED' && (
                                        <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-100">
                                            <CheckCircle size={16} />
                                            <span className="font-medium">Paper Published!</span>
                                        </div>
                                    )}
                                    
                                    {paper.status === 'REJECTED' && (
                                        <div className="mt-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-100">
                                            <AlertCircle size={16} />
                                            <span className="font-medium">Submission Rejected</span>
                                        </div>
                                    )}

                                    {paper.reviewRemark && (
                                        <div className="mt-4 p-3 bg-slate-50 rounded-md border border-slate-100 text-sm">
                                            <span className="font-semibold text-slate-700 block mb-1">Reviewer Remarks:</span>
                                            <span className="text-slate-600 italic">"{paper.reviewRemark}"</span>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-slate-50/50 border-t border-slate-100 flex gap-3">
                                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleViewPdf(paper._id)}>
                                        View PDF
                                    </Button>
                                    {paper.status === 'PUBLISHED' && (
                                        <Button size="sm" className="h-8 text-xs bg-primary text-white" onClick={() => handleViewPdf(paper._id)}>
                                            Download PDF
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AuthorDashboard;
