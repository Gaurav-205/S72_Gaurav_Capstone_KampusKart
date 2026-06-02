import { API_BASE } from '../../config';
import { Event, EventFilters } from './types';

export const eventsApi = {
  listEvents: async (
    token: string,
    filters: EventFilters,
    itemsPerPage: number
  ): Promise<{ events: Event[]; totalItems: number; totalPages: number }> => {
    const params = new URLSearchParams({
      page: String(filters.page),
      limit: String(itemsPerPage),
      ...(filters.status !== 'All' && { status: filters.status }),
      ...(filters.search && { search: filters.search }),
    });

    const response = await fetch(`${API_BASE}/api/events?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  createEvent: async (token: string, formData: FormData): Promise<Event> => {
    const response = await fetch(`${API_BASE}/api/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create event');
    return response.json();
  },

  updateEvent: async (token: string, id: string, formData: FormData): Promise<Event> => {
    const response = await fetch(`${API_BASE}/api/events/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to update event');
    return response.json();
  },

  deleteEvent: async (token: string, id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/api/events/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete event');
    return response.json();
  },
  registerForEvent: async (token: string, eventId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/api/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to register for event');
    }

    return data;
  },

  withdrawRegistration: async (token: string, eventId: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/api/events/${eventId}/register`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to withdraw registration');
    }

    return data;
  },

  getUserRegistrations: async (token: string): Promise<Event[]> => {
    const response = await fetch(`${API_BASE}/api/events/user/registrations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch registrations');
    }

    return response.json();
  },
};
