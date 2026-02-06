import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AdminOverview from './Admin/AdminOverview';
import AdminPendingReviewers from './Admin/AdminPendingReviewers';
import AdminReviewers from './Admin/AdminReviewers';
import AdminPapers from './Admin/AdminPapers';

const AdminDashboard = () => {
    return (
        <DashboardLayout role="admin">
            <Routes>
                <Route path="/" element={<AdminOverview />} />
                <Route path="/pending-reviewers" element={<AdminPendingReviewers />} />
                <Route path="/reviewers" element={<AdminReviewers />} />
                <Route path="/papers" element={<AdminPapers />} />
            </Routes>
        </DashboardLayout>
    );
};

export default AdminDashboard;
