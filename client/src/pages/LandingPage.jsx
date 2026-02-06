import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { BookOpen, FileText, CheckCircle, Users, Globe, Award, ChevronRight, Menu, Mail, Upload, FileCheck, Shield } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="font-sans text-slate-800 bg-white min-h-screen flex flex-col">
            {/* 1. Header & Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="bg-primary text-white p-1 rounded-sm">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-xl font-bold text-slate-900 tracking-tight">ResearchDesk</span>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#about" className="hover:text-primary transition-colors">Journal</a>
                        <a href="#publications" className="hover:text-primary transition-colors">Publications</a>
                        <a href="#authors" className="hover:text-primary transition-colors">For Authors</a>
                        <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild className="hidden sm:flex">
                            <Link to="/login">Login</Link>
                        </Button>
                        <Button asChild className="bg-primary hover:bg-slate-800 text-white rounded-full px-6">
                            <Link to="/submit-paper">Submit Manuscript</Link>
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* 2. Hero Section */}
                <section className="relative overflow-hidden bg-slate-50 border-b border-slate-200">
                    <div className="container mx-auto px-4 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 max-w-2xl relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider">
                                <Globe size={12} /> Open Access Journal
                            </div>
                            <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 leading-tight">
                                Advancing Global Knowledge Across Disciplines
                            </h1>
                            <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                                International Journal For Advanced Research And Multidisciplinary (IJARMY) — A Peer-Reviewed platform for Engineers, Scientists, and Innovators.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button asChild size="lg" className="bg-primary text-white hover:bg-slate-800 h-12 px-8">
                                    <Link to="/published-papers">View Published Papers</Link>
                                </Button>
                                <Button variant="outline" size="lg" className="h-12 px-8 border-slate-300 text-slate-700 hover:bg-white">
                                    Author Guidelines
                                </Button>
                            </div>
                            <p className="text-xs text-slate-400 pt-4 flex items-center gap-2">
                                <Award size={14} /> UGC Recognized & ISO 9001:2008 Certified
                            </p>
                        </div>
                        {/* Abstract Visual Pattern */}
                        <div className="relative h-full w-full min-h-[300px] md:min-h-[500px] flex items-center justify-center opacity-40 md:opacity-100">
                             <div className="absolute inset-0 bg-linear-to-tr from-blue-50 to-slate-100 rounded-full blur-3xl transform translate-x-1/4" />
                             <div className="grid grid-cols-3 gap-6 transform rotate-12 scale-110">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="h-32 w-32 bg-white rounded-2xl shadow-sm border border-slate-100/50 backdrop-blur-sm" />
                                ))}
                             </div>
                        </div>
                    </div>
                </section>

                {/* 3. Trust Bar (Indexing) */}
                <section className="bg-white border-b border-slate-100 py-10">
                    <div className="container mx-auto px-4">
                         <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Indexed In Prestigious Databases</p>
                         <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                             {['Google Scholar', 'ResearchGate', 'ROAD', 'Indian Citation Index', 'Academia'].map((name) => (
                                 <span key={name} className="text-lg md:text-xl font-serif font-bold text-slate-400 hover:text-primary cursor-default">{name}</span>
                             ))}
                         </div>
                    </div>
                </section>

                {/* 4. About & Stats */}
                <section id="about" className="py-20 bg-white">
                    <div className="container mx-auto px-4 grid md:grid-cols-12 gap-12">
                         {/* Key Facts */}
                         <div className="md:col-span-4 space-y-8 border-r border-slate-100 pr-8">
                             <div>
                                 <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">ISSN</h3>
                                 <p className="text-3xl font-mono text-slate-900">2455-6602</p>
                             </div>
                             <div>
                                 <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Frequency</h3>
                                 <p className="text-xl font-medium text-slate-900">Monthly Publication</p>
                             </div>
                             <div>
                                 <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Access</h3>
                                 <p className="text-xl font-medium text-slate-900 flex items-center gap-2">
                                     <CheckCircle size={18} className="text-green-600" /> Open Access
                                 </p>
                             </div>
                         </div>
                         
                         {/* Aim & Scope Text */}
                         <div className="md:col-span-8 space-y-6">
                             <h2 className="text-3xl font-bold text-slate-900">Aim & Scope</h2>
                             <p className="text-slate-600 leading-relaxed text-lg">
                                 IJARMY provides a global platform for researchers, innovators, and scholars to share their research worldwide. We promote advancement in all disciplines, offering high-quality original Research Articles, Review Articles, Case Studies, and Technical Notes.
                             </p>
                             <p className="text-slate-600 leading-relaxed">
                                 Our mission is to support scholars in disseminating their work effectively, fostering the development of analytical skills and contributing valuable knowledge to society.
                             </p>
                             <Button variant="link" className="text-primary p-0 h-auto font-semibold group">
                                 Read Editorial Board <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                             </Button>
                         </div>
                    </div>
                </section>

                {/* 5. Research Areas */}
                <section id="publications" className="py-20 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">Research Areas</h2>
                                <p className="text-slate-600">Covering a broad spectrum of scientific and technical disciplines.</p>
                            </div>
                            <Button variant="outline">View All Topics</Button>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Card 1 */}
                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                                        <Users size={24} />
                                    </div>
                                    <CardTitle>Engineering & Technology</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li>Computer Science & AI</li>
                                        <li>Cloud Computing & Big Data</li>
                                        <li>Robotics & Automation</li>
                                        <li>Civil & Mechanical Engineering</li>
                                        <li className="text-primary font-medium pt-2 text-xs uppercase tracking-wide">and 40+ more...</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Card 2 */}
                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 text-emerald-600">
                                        <Globe size={24} />
                                    </div>
                                    <CardTitle>Science & Mathematics</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li>Computational Mathematics</li>
                                        <li>Physics & Fluid Dynamics</li>
                                        <li>Chemistry & Material Science</li>
                                        <li>Bioinformatics</li>
                                        <li className="text-primary font-medium pt-2 text-xs uppercase tracking-wide">and 25+ more...</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Card 3 */}
                            <Card className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-4 text-amber-600">
                                        <BookOpen size={24} />
                                    </div>
                                    <CardTitle>Management & Humanities</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-slate-600">
                                        <li>E-Commerce & Business</li>
                                        <li>Education Technology</li>
                                        <li>Environmental Management</li>
                                        <li>Industrial Economics</li>
                                        <li className="text-primary font-medium pt-2 text-xs uppercase tracking-wide">and 15+ more...</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* 6. Author Resources */}
                <section id="authors" className="py-20 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Submission Process</h2>
                            <p className="text-slate-600">A simplified, transparent workflow for contributors.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-100 -z-10" />

                            <div className="text-center space-y-4 bg-white p-6 rounded-xl">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm text-slate-400">
                                    <FileText size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">1. Prepare</h3>
                                <p className="text-sm text-slate-600">Download the IJARMY Paper Template and Review Copyright Form.</p>
                                <Button variant="outline" size="sm" className="mt-2 text-xs">Download Template</Button>
                            </div>

                            <div className="text-center space-y-4 bg-white p-6 rounded-xl">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm text-slate-400">
                                    <Shield size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">2. Check Policies</h3>
                                <p className="text-sm text-slate-600">Review our stringent Plagiarism Policy and Correction Policy.</p>
                                <Button variant="outline" size="sm" className="mt-2 text-xs">Read Policies</Button>
                            </div>

                            <div className="text-center space-y-4 bg-white p-6 rounded-xl">
                                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm text-primary">
                                    <Upload size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">3. Submit Online</h3>
                                <p className="text-sm text-slate-600">Login to our secure portal to upload your manuscript.</p>
                                <Button size="sm" className="mt-2 text-xs bg-primary text-white">Start Submission</Button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* 7. Footer */}
            <footer id="contact" className="bg-slate-900 text-slate-300 py-16">
                <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 text-sm">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-white">
                             <BookOpen size={20} />
                             <span className="text-lg font-bold tracking-tight">IJARMY</span>
                        </div>
                        <p className="text-slate-400 leading-relaxed">
                            International Journal For Advanced Research And Multidisciplinary. Advancing knowledge since 2016.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><a href="#" className="hover:text-white transition-colors">Current Issues</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Past Issues</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Editorial Board</a></li>
                        </ul>
                    </div>

                    <div>
                         <h4 className="text-white font-bold mb-6">Policies</h4>
                         <ul className="space-y-3">
                            <li><a href="#" className="hover:text-white transition-colors">Author Guidelines</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Peer Review Process</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Plagiarism Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Open Access Policy</a></li>
                         </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Contact</h4>
                        <div className="space-y-3">
                            <p className="flex items-center gap-2">
                                <Mail size={16} /> editor@ijarmy.com
                            </p>
                            <p>India</p>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-4 mt-16 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
                    <p>&copy; {new Date().getFullYear()} IJARMY. All Rights Reserved. | Designed for Academic Excellence.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
