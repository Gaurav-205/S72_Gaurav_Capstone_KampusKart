import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureModal } from './common/FeatureModal';
import { SuccessMessage } from './common/SuccessMessage';
import { PageSkeleton } from './common/SkeletonLoader';
import { Footer } from './ui/footer';
import { socialLinks } from '../utils/socialLinks';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';

// Import from the feature directory
import {
  useFacilities,
  FacilityCard,
  FacilityFilters,
  FacilityForm,
  FacilityDetail,
  facilitiesApi,
} from '../features/facilities';
import type { Facility } from '../features/facilities/types';

const Facilities = () => {
  const { token, user } = useAuth();

  // Custom hook for state and data fetching
  const {
    facilities,
    loading,
    error: fetchError,
    filters,
    updateFilters,
    refresh,
    removeFacility,
  } = useFacilities(token);

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'form' | 'detail' | 'delete'>('form');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search Suggestions Hook
  const buildSuggestions = useCallback((facility: Facility, query: string): string[] => {
    const suggestions: string[] = [];
    const normalizedQuery = query.toLowerCase();
    if (facility.name?.toLowerCase().includes(normalizedQuery)) suggestions.push(facility.name);
    if (facility.location?.toLowerCase().includes(normalizedQuery))
      suggestions.push(facility.location);
    if (facility.type?.toLowerCase().includes(normalizedQuery)) suggestions.push(facility.type);
    return suggestions;
  }, []);

  const { showSuggestions, setShowSuggestions, filteredSuggestions, searchRef } =
    useSearchSuggestions<Facility>({
      searchInput: filters.search,
      items: facilities,
      buildSuggestions,
    });

  // Modal handlers
  const openAddModal = () => {
    setSelectedFacility(null);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (facility: Facility) => {
    setSelectedFacility(facility);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDetailModal = (facility: Facility) => {
    setSelectedFacility(facility);
    setModalType('detail');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    const facility = facilities.find((f) => f._id === id);
    if (facility) {
      setSelectedFacility(facility);
      setModalType('delete');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFacility(null);
    setFormError(null);
  };

  // Action handlers
  const handleFormSubmit = async (formData: FormData) => {
    if (!token) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (selectedFacility) {
        await facilitiesApi.updateFacility(token, selectedFacility._id, formData);
        setSuccessMessage('Facility updated successfully!');
      } else {
        await facilitiesApi.createFacility(token, formData);
        setSuccessMessage('Facility added successfully!');
      }
      refresh();
      closeModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save facility');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedFacility) return;
    const success = await removeFacility(selectedFacility._id);
    if (success) {
      setSuccessMessage('Facility deleted successfully!');
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

  if (loading && facilities.length === 0) {
    return (
      <PageSkeleton
        contentType="cards"
        itemCount={6}
        filterCount={1}
        showAddButton={user?.isAdmin}
      />
    );
  }

  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      f.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === 'All' || f.type === filters.type;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">Campus Facilities</h1>
          {user?.isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#181818] text-white font-bold text-lg hover:bg-[#00C6A7] transition-colors"
            >
              + Add Facility
            </button>
          )}
        </div>

        <FacilityFilters
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

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xl font-bold text-gray-700">No facilities found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility._id}
                facility={facility}
                isAdmin={user?.isAdmin}
                onSelect={openDetailModal}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            ))
          )}
        </div>

        {/* Modals */}
        <FeatureModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={
            modalType === 'form'
              ? selectedFacility
                ? 'Edit Facility'
                : 'Add New Facility'
              : modalType === 'detail'
                ? 'Facility Details'
                : 'Confirm Delete'
          }
          error={formError}
          size={modalType === 'detail' ? 'xl' : 'md'}
        >
          {modalType === 'form' && (
            <FacilityForm
              facility={selectedFacility}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              error={formError}
            />
          )}

          {modalType === 'detail' && selectedFacility && (
            <FacilityDetail
              facility={selectedFacility}
              isAdmin={user?.isAdmin}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          )}

          {modalType === 'delete' && (
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Delete Facility?</h3>
              <p className="text-gray-600 mb-8">
                Are you sure you want to delete &quot;{selectedFacility?.name}&quot;? This action
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
                  Delete Facility
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

export default Facilities;
