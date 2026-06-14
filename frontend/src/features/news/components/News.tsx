import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { FeatureModal } from '../../../components/common/FeatureModal';
import { SuccessMessage } from '../../../components/common/SuccessMessage';
import { PageSkeleton } from '../../../components/common/SkeletonLoader';
import { Footer } from '../../../components/ui/footer';
import { socialLinks } from '../../../utils/socialLinks';
import { useSearchSuggestions } from '../../../hooks/useSearchSuggestions';

import { useNews } from '../hooks/useNews';
import { NewsCard } from './NewsCard';
import { NewsFilters } from './NewsFilters';
import { NewsForm } from './NewsForm';
import { NewsDetail } from './NewsDetail';
import { newsApi } from '../api';
import type { NewsItem } from '../types';

const News = () => {
  const { token, user } = useAuth();

  // Custom hook for state and data fetching
  const {
    news,
    loading,
    error: fetchError,
    filters,
    updateFilters,
    refresh,
    removeNews,
  } = useNews(token);

  // Local UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'form' | 'detail' | 'delete'>('form');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Search Suggestions Hook
  const buildSuggestions = useCallback((item: NewsItem, query: string): string[] => {
    const suggestions: string[] = [];
    const normalizedQuery = query.toLowerCase();
    if (item.title?.toLowerCase().includes(normalizedQuery)) suggestions.push(item.title);
    if (item.category?.toLowerCase().includes(normalizedQuery)) suggestions.push(item.category);
    return suggestions;
  }, []);

  const { showSuggestions, setShowSuggestions, filteredSuggestions, searchRef } =
    useSearchSuggestions<NewsItem>({
      searchInput: filters.search,
      items: news,
      buildSuggestions,
    });

  // Modal handlers
  const openAddModal = () => {
    setSelectedNews(null);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: NewsItem) => {
    setSelectedNews(item);
    setModalType('form');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openDetailModal = (item: NewsItem) => {
    setSelectedNews(item);
    setModalType('detail');
    setIsModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    const item = news.find((n) => n._id === id);
    if (item) {
      setSelectedNews(item);
      setModalType('delete');
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNews(null);
    setFormError(null);
  };

  const handleDelete = async () => {
    if (!selectedNews) return;
    const success = await removeNews(selectedNews._id);
    if (success) {
      setSuccessMessage('News deleted successfully!');
      closeModal();
    }
  };

  // Action handlers
  const handleFormSubmit = async (formData: FormData) => {
    if (!token) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (selectedNews) {
        await newsApi.updateNews(token, selectedNews._id, formData);
        setSuccessMessage('News updated successfully!');
      } else {
        await newsApi.createNews(token, formData);
        setSuccessMessage('News added successfully!');
      }
      refresh();
      closeModal();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save news');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success message auto-hide
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading && news.length === 0) {
    return (
      <PageSkeleton
        contentType="cards"
        itemCount={6}
        filterCount={1}
        showAddButton={user?.isAdmin}
      />
    );
  }

  const filteredNews = news.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      n.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'All' || n.category === filters.category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">Campus News</h1>
          {user?.isAdmin && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#181818] text-white font-bold text-lg hover:bg-[#00C6A7] transition-colors"
            >
              + Add News
            </button>
          )}
        </div>

        <NewsFilters
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

        {/* News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <p className="text-xl font-bold text-gray-700">No news found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            filteredNews.map((item) => (
              <NewsCard
                key={item._id}
                news={item}
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
              ? selectedNews
                ? 'Edit News'
                : 'Add News'
              : modalType === 'detail'
                ? 'News Details'
                : 'Confirm Delete'
          }
          error={formError}
          size={modalType === 'detail' ? 'xl' : 'md'}
        >
          {modalType === 'form' && (
            <NewsForm
              news={selectedNews}
              onSubmit={handleFormSubmit}
              isSubmitting={isSubmitting}
              error={formError}
            />
          )}

          {modalType === 'detail' && selectedNews && (
            <NewsDetail
              news={selectedNews}
              isAdmin={user?.isAdmin}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
            />
          )}

          {modalType === 'delete' && (
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold mb-4">Delete News Item?</h3>
              <p className="text-gray-600 mb-8">
                Are you sure you want to delete &quot;{selectedNews?.title}&quot;? This action
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
                  Delete News
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

export default News;
