import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FeatureModal } from '../../../components/common/FeatureModal';
import { SuccessMessage } from '../../../components/common/SuccessMessage';
import { PageSkeleton } from '../../../components/common/SkeletonLoader';
import { Footer } from '../../../components/ui/footer';
import { socialLinks } from '../../../utils/socialLinks';
import { useSearchSuggestions } from '../../../hooks/useSearchSuggestions';

import { useComplaints } from '../hooks/useComplaints';
import { ComplaintCard } from './ComplaintCard';
import { ComplaintFilters } from './ComplaintFilters';
import { ComplaintForm } from './ComplaintForm';
import { ComplaintDetail } from './ComplaintDetail';
import { complaintsApi } from '../api';
import type { Complaint } from '../types';

const Complaints = () => {
  const { token, user } = useAuth();

  // Custom hook for state and data fetching
  const {
    complaints,
    loading,
    error: fetchError,
    totalPages,
    isFetchingMore,
    isFiltering,
    filters,
    updateFilters,
    setPage,
    refresh,
    removeComplaint,
  } = useComplaints(token);

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'form' | 'detail' | 'delete'>('form');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search Suggestions Hook
  const buildSuggestions = useCallback((complaint: Complaint, query: string): string[] => {
    const suggestions: string[] = [];
    const normalizedQuery = query.toLowerCase();
    if (complaint.title?.toLowerCase().includes(normalizedQuery)) suggestions.push(complaint.title);
    if (complaint.category?.toLowerCase().includes(normalizedQuery))
      suggestions.push(complaint.category);
    return suggestions;
  }, []);

  const { showSuggestions, setShowSuggestions, filteredSuggestions, searchRef } =
    useSearchSuggestions<Complaint>({
      searchInput: filters.search,
      items: complaints,
      buildSuggestions,
    });

  // Modal handlers
  const openAddModal = () => {
    setSelectedComplaint(null);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDetailModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setModalType('detail');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    const complaint = complaints.find((c) => c._id === id);
    if (complaint) {
      setSelectedComplaint(complaint);
      setModalType('delete');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
    setFormError(null);
  };

  // Action handlers
  const handleFormSubmit = async (formData: FormData) => {
    if (!token) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (selectedComplaint) {
        await complaintsApi.updateComplaint(token, selectedComplaint._id, formData);
        setSuccessMessage('Complaint updated successfully!');
      } else {
        await complaintsApi.createComplaint(token, formData);
        setSuccessMessage('Complaint submitted successfully!');
      }
      refresh();
      closeModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedComplaint) return;
    const success = await removeComplaint(selectedComplaint._id);
    if (success) {
      setSuccessMessage('Complaint deleted successfully!');
      closeModal();
    }
  };

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && filters.page < totalPages) {
          setPage(filters.page + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetchingMore, filters.page, totalPages, setPage]
  );

  // Success message auto-hide
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading && filters.page === 1) {
    return <PageSkeleton contentType="cards" itemCount={8} filterCount={2} showAddButton={true} />;
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">College Complaints</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#181818] text-white font-bold text-lg hover:bg-[#00C6A7] transition-colors"
          >
            + Add Complaint
          </button>
        </div>

        <ComplaintFilters
          filters={filters}
          onFilterChange={updateFilters}
          suggestions={filteredSuggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          searchRef={searchRef}
          onSuggestionSelect={(val: string) => updateFilters({ search: val })}
        />

        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg font-medium border-2 border-red-100">
            {fetchError}
          </div>
        )}

        {/* Active Filters Display */}
        {(filters.search || filters.category !== 'all' || filters.status !== 'All') && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Active filters:</span>
            {filters.category !== 'all' && (
              <span className="text-xs px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-white text-gray-700 font-semibold capitalize">
                Category: {filters.category}
              </span>
            )}
            {filters.status !== 'All' && (
              <span className="text-xs px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-white text-gray-700 font-semibold capitalize">
                Status: {filters.status}
              </span>
            )}
            {filters.search && (
              <span className="text-xs px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-white text-gray-700 font-semibold">
                Search: {filters.search}
              </span>
            )}
            <button
              onClick={() => updateFilters({ search: '', category: 'all', status: 'All' })}
              className="ml-auto px-4 py-2 rounded-lg bg-[#181818] text-white text-xs font-bold hover:bg-[#00C6A7] transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Complaints Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isFiltering ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden animate-pulse h-[400px]"
              >
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : complaints.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xl font-bold text-gray-700">No complaints found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            complaints.map((complaint, idx) => (
              <div
                key={complaint._id}
                ref={idx === complaints.length - 1 ? lastItemRef : undefined}
              >
                <ComplaintCard
                  complaint={complaint}
                  currentUser={user}
                  onSelect={openDetailModal}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              </div>
            ))
          )}
        </div>

        {isFetchingMore && (
          <div className="flex justify-center items-center mt-8">
            <div className="animate-spin h-8 w-8 border-4 border-[#00C6A7] border-t-transparent rounded-full"></div>
          </div>
        )}

        {!isFiltering && !isFetchingMore && complaints.length > 0 && filters.page >= totalPages && (
          <div className="mt-8 text-center">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-600">
              You have reached the end of results.
            </p>
          </div>
        )}

        {/* Modals */}
        <FeatureModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={
            modalType === 'form'
              ? selectedComplaint
                ? 'Edit Complaint'
                : 'Add New Complaint'
              : modalType === 'detail'
                ? 'Complaint Details'
                : 'Confirm Delete'
          }
          error={formError}
          size={modalType === 'detail' ? 'xl' : 'md'}
        >
          {modalType === 'form' && (
            <ComplaintForm
              complaint={selectedComplaint}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              error={formError}
              isAdmin={user?.isAdmin}
            />
          )}

          {modalType === 'detail' && selectedComplaint && (
            <ComplaintDetail
              complaint={selectedComplaint}
              currentUser={user}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          )}

          {modalType === 'delete' && (
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Delete Complaint?</h3>
              <p className="text-gray-600 mb-8">
                Are you sure you want to delete this complaint? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 border-2 border-gray-200 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold"
                >
                  Delete Complaint
                </button>
              </div>
            </div>
          )}
        </FeatureModal>
      </main>
      <Footer
        logo={<img src="/Logo.webp" alt="KampusKart Logo" className="h-7 w-7" />}
        brandName="KampusKart"
        socialLinks={socialLinks}
        mainLinks={[
          { href: '/events', label: 'Events' },
          { href: '/facilities', label: 'Facilities' },
          { href: '/clubs-recruitment', label: 'Clubs' },
          { href: '/campus-map', label: 'Map' },
        ]}
        legalLinks={[
          { href: '/privacy', label: 'Privacy' },
          { href: '/terms', label: 'Terms' },
        ]}
        copyright={{
          text: `© ${new Date().getFullYear()} KampusKart`,
          license: 'All rights reserved.',
        }}
      />
    </div>
  );
};

export default Complaints;
