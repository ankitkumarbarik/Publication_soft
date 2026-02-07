import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Download, User } from 'lucide-react';

const PublishedPapers = () => {
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                const response = await axiosInstance.get('/api/papers/published');
                setPapers(response.data);
            } catch (err) {
                setError('Failed to load published papers.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPapers();
    }, []);

    // Handle PDF viewing - opens server stream endpoint that bypasses Cloudinary auth
    const handleViewPdf = (paperId) => {
        window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/papers/stream/${paperId}`, '_blank');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Published Research</h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Explore, read, and download peer-reviewed research papers from scholars worldwide.
                    </p>
                </div>

                {papers.length === 0 ? (
                    <div className="text-center text-slate-500 py-20">
                        No published papers available at the moment.
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {papers.map((paper) => (
                            <Card key={paper._id} className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <CardTitle className="text-xl font-serif text-slate-800 leading-snug">
                                        {paper.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                                        <User size={14} />
                                        <span>{paper.authorId?.name || 'Unknown Author'}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="grow">
                                    <p className="text-slate-600 text-sm line-clamp-4">
                                        {paper.abstract}
                                    </p>
                                </CardContent>
                                <CardFooter className="pt-4 border-t border-slate-100 flex justify-between">
                                    <Button variant="outline" size="sm" onClick={() => handleViewPdf(paper._id)}>
                                        <FileText size={16} className="mr-2" /> View PDF
                                    </Button>
                                    <Button size="sm" className="bg-primary text-white hover:bg-slate-800" onClick={() => handleViewPdf(paper._id)}>
                                        <Download size={16} className="mr-2" /> Download
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublishedPapers;
