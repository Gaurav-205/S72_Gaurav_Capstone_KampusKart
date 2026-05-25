import { useState, useEffect, useCallback } from 'react';
import { Event, EventFilters } from '../types';
import { eventsApi } from '../api';

export const useEvents = (token: string | null) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState<EventFilters>({
    status: 'All',
    search: '',
    page: 1,
  });

  const itemsPerPage = 9;

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await eventsApi.listEvents(token || '', filters, itemsPerPage);

      if (Array.isArray(data)) {
        setEvents(data);
        setTotalPages(1);
      } else {
        setEvents(data.events || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const updateFilters = useCallback((newFilters: Partial<EventFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  const removeEvent = useCallback(
    async (id: string) => {
      if (!token) return false;
      try {
        await eventsApi.deleteEvent(token, id);
        setEvents((prev) => prev.filter((e) => e._id !== id));
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete event');
        return false;
      }
    },
    [token]
  );
  const registerForEvent = useCallback(
    async (eventId: string) => {
      if (!token) return false;

      try {
        await eventsApi.registerForEvent(token, eventId);
        await fetchEvents();
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to register for event');
        return false;
      }
    },
    [token, fetchEvents]
  );

  const withdrawRegistration = useCallback(
    async (eventId: string) => {
      if (!token) return false;

      try {
        await eventsApi.withdrawRegistration(token, eventId);
        await fetchEvents();
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to withdraw registration');
        return false;
      }
    },
    [token, fetchEvents]
  );

  return {
    events,
    loading,
    error,
    totalPages,
    filters,
    updateFilters,
    setPage,
    refresh,
    removeEvent,
    registerForEvent,
    withdrawRegistration,
  };
};
