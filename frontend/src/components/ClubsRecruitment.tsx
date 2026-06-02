import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureModal } from './common/FeatureModal';
import { SuccessMessage } from './common/SuccessMessage';
import { PageSkeleton } from './common/SkeletonLoader';
import { Footer } from './ui/footer';
import { socialLinks } from '../utils/socialLinks';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';

// Import from the feature directory
import { useClubs, ClubCard, ClubFilters, ClubForm, ClubDetail, clubsApi } from '../features/clubs';
import type { Club } from '../features/clubs/types';

const ClubsRecruitment = () => {
  const { token, user } = useAuth();

  // Custom hook for state and data fetching
  const {
    clubs,
    loading,
    error: fetchError,
    filters,
    updateFilters,
    refresh,
    removeClub,
  } = useClubs(token);

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'form' | 'detail' | 'delete'>('form');
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search Suggestions Hook
  const buildSuggestions = useCallback((club: Club, query: string): string[] => {
    const suggestions: string[] = [];
    const normalizedQuery = query.toLowerCase();
    if (club.title?.toLowerCase().includes(normalizedQuery)) suggestions.push(club.title);
    if (club.clubName?.toLowerCase().includes(normalizedQuery)) suggestions.push(club.clubName);
    return suggestions;
  }, []);

  const { showSuggestions, setShowSuggestions, filteredSuggestions, searchRef } =
    useSearchSuggestions<Club>({
      searchInput: filters.search,
      items: clubs,
      buildSuggestions,
    });

  // Modal handlers
  const openAddModal = () => {
    setSelectedClub(null);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (club: Club) => {
    setSelectedClub(club);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDetailModal = (club: Club) => {
    setSelectedClub(club);
    setModalType('detail');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    const club = clubs.find((c) => c._id === id);
    if (club) {
      setSelectedClub(club);
      setModalType('delete');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClub(null);
    setFormError(null);
  };

  // Action handlers
  const handleFormSubmit = async (formData: FormData) => {
    if (!token) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (selectedClub) {
        await clubsApi.updateClub(token, selectedClub._id, formData);
        setSuccessMessage('Club recruitment updated successfully!');
      } else {
        await clubsApi.createClub(token, formData);
        setSuccessMessage('Club recruitment added successfully!');
      }
      refresh();
      closeModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save recruitment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClub) return;
    const success = await removeClub(selectedClub._id);
    if (success) {
      setSuccessMessage('Club recruitment deleted successfully!');
      closeModal();
    }
  };

  // Success message auto-hide
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading && clubs.length === 0) {
    return (
      <PageSkeleton
        contentType="cards"
        itemCount={6}
        filterCount={1}
        showAddButton={user?.isAdmin}
      />
    );
  }

  const filteredClubs = clubs.filter(
    (club) =>
      (filters.status === 'all' || club.status === filters.status) &&
      (club.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        club.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        club.clubName.toLowerCase().includes(filters.search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">Clubs Recruitment</h1>
          {user?.isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#181818] text-white font-bold text-lg hover:bg-[#00C6A7] transition-colors"
            >
              + Add New Recruitment
            </button>
          )}
        </div>

        <ClubFilters
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

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xl font-bold text-gray-700">No recruitments found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            filteredClubs.map((club) => (
              <ClubCard key={club._id} club={club} onSelect={openDetailModal} />
            ))
          )}
        </div>

        {/* Modals */}
        <FeatureModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={
            modalType === 'form'
              ? selectedClub
                ? 'Edit Recruitment'
                : 'Add New Recruitment'
              : modalType === 'detail'
                ? 'Recruitment Details'
                : 'Confirm Delete'
          }
          error={formError}
          size={modalType === 'detail' ? 'xl' : 'md'}
        >
          {modalType === 'form' && (
            <ClubForm
              club={selectedClub}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              error={formError}
            />
          )}

          {modalType === 'detail' && selectedClub && (
            <ClubDetail
              club={selectedClub}
              isAdmin={user?.isAdmin}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          )}

          {modalType === 'delete' && (
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Delete Recruitment?</h3>
              <p className="text-gray-600 mb-8">
                Are you sure you want to delete &quot;{selectedClub?.title}&quot;? This action
                cannot be undone.
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
                  Delete Recruitment
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

export default ClubsRecruitment;
