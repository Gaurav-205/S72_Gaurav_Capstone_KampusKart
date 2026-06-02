import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureModal } from './common/FeatureModal';
import { SuccessMessage } from './common/SuccessMessage';
import { PageSkeleton } from './common/SkeletonLoader';
import { Footer } from './ui/footer';
import { socialLinks } from '../utils/socialLinks';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';

// Import from the feature directory
import {
  useLostFound,
  LostFoundCard,
  LostFoundFilters,
  LostFoundForm,
  LostFoundDetail,
  lostFoundApi,
} from '../features/lostfound';
import type { LostFoundItem } from '../features/lostfound/types';

const LostFound = () => {
  const { token, user } = useAuth();

  // Custom hook for state and data fetching
  const {
    items,
    loading,
    error: fetchError,
    totalPages,
    isFetchingMore,
    isFiltering,
    filters,
    updateFilters,
    setPage,
    refresh,
    markAsResolved,
    removeItem,
  } = useLostFound(token);

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'form' | 'detail' | 'delete'>('form');
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search Suggestions Hook
  const buildSuggestions = useCallback((item: LostFoundItem, query: string): string[] => {
    const suggestions: string[] = [];
    const normalizedQuery = query.toLowerCase();
    if (item.title?.toLowerCase().includes(normalizedQuery)) suggestions.push(item.title);
    if (item.location?.toLowerCase().includes(normalizedQuery)) suggestions.push(item.location);
    return suggestions;
  }, []);

  const { showSuggestions, setShowSuggestions, filteredSuggestions, searchRef } =
    useSearchSuggestions<LostFoundItem>({
      searchInput: filters.search,
      items,
      buildSuggestions,
    });

  // Modal handlers
  const openAddModal = () => {
    setSelectedItem(null);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: LostFoundItem) => {
    setSelectedItem(item);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDetailModal = (item: LostFoundItem) => {
    setSelectedItem(item);
    setModalType('detail');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    const item = items.find((i) => i._id === id);
    if (item) {
      setSelectedItem(item);
      setModalType('delete');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormError(null);
  };

  // Action handlers
  const handleFormSubmit = async (formData: FormData) => {
    if (!token) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (selectedItem) {
        await lostFoundApi.updateItem(token, selectedItem._id, formData);
        setSuccessMessage('Item updated successfully!');
      } else {
        await lostFoundApi.createItem(token, formData);
        setSuccessMessage('Item posted successfully!');
      }
      refresh();
      closeModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async (id: string) => {
    const success = await markAsResolved(id);
    if (success) {
      setSuccessMessage('Item marked as resolved!');
      if (modalType === 'detail') {
        setSelectedItem((prev: LostFoundItem | null) =>
          prev ? { ...prev, resolved: true } : null
        );
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    const success = await removeItem(selectedItem._id);
    if (success) {
      setSuccessMessage('Item deleted successfully!');
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
          <h1 className="text-h2 font-extrabold text-black">Lost and Found</h1>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#181818] text-white font-bold text-lg hover:bg-[#00C6A7] transition-colors"
          >
            + Add New Item
          </button>
        </div>

        <LostFoundFilters
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
        {(filters.search || filters.type !== 'all' || filters.resolved !== 'all') && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Active filters:</span>
            {filters.type !== 'all' && (
              <span className="text-xs px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-white text-gray-700 font-semibold capitalize">
                Type: {filters.type}
              </span>
            )}
            {filters.resolved !== 'all' && (
              <span className="text-xs px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-white text-gray-700 font-semibold capitalize">
                Status: {filters.resolved}
              </span>
            )}
            {filters.search && (
              <span className="text-xs px-3 py-1.5 rounded-lg border-2 border-gray-200 bg-white text-gray-700 font-semibold">
                Search: {filters.search}
              </span>
            )}
            <button
              onClick={() => updateFilters({ search: '', type: 'all', resolved: 'all' })}
              className="ml-auto px-4 py-2 rounded-lg bg-[#181818] text-white text-xs font-bold hover:bg-[#00C6A7] transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Items Grid */}
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
          ) : items.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20">
              <p className="text-xl font-bold text-gray-700">Nothing here yet</p>
              <p className="text-gray-400 text-sm mt-2">No items match your criteria.</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={item._id} ref={idx === items.length - 1 ? lastItemRef : undefined}>
                <LostFoundCard
                  item={item}
                  currentUser={user}
                  token={token}
                  onSelect={openDetailModal}
                  onResolve={handleResolve}
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

        {!isFiltering && !isFetchingMore && items.length > 0 && filters.page >= totalPages && (
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
              ? selectedItem
                ? 'Edit Item'
                : 'Add New Item'
              : modalType === 'detail'
                ? 'Item Details'
                : 'Confirm Delete'
          }
          error={formError}
          size={modalType === 'detail' ? 'lg' : 'md'}
        >
          {modalType === 'form' && (
            <LostFoundForm
              item={selectedItem}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              error={formError}
            />
          )}

          {modalType === 'detail' && selectedItem && (
            <LostFoundDetail
              item={selectedItem}
              currentUser={user}
              token={token}
              onResolve={handleResolve}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          )}

          {modalType === 'delete' && (
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Are you sure?</h3>
              <p className="text-gray-600 mb-8">
                This action cannot be undone. This will permanently delete your post.
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
                  Delete Post
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

export default LostFound;
