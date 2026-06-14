import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSearch, FiEdit2, FiTrash2, FiX, FiSave, FiShield, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config';
import { Footer } from './ui/footer';
import { socialLinks } from '../utils/socialLinks';
import { FeatureModal } from './common/FeatureModal';
import { ErrorMessage } from './common/ErrorMessage';
import { SuccessMessage } from './common/SuccessMessage';

type AdminUser = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  major?: string;
  yearOfStudy?: string;
  gender?: string;
  program?: string;
  dateOfBirth?: string | null;
  createdAt?: string;
  isAdmin?: boolean;
  profilePicture?: {
    url?: string;
    public_id?: string;
  };
};

type UserFormState = {
  name: string;
  phone: string;
  major: string;
  yearOfStudy: string;
  gender: string;
  program: string;
  dateOfBirth: string;
};

const emptyForm: UserFormState = {
  name: '',
  phone: '',
  major: '',
  yearOfStudy: '',
  gender: '',
  program: '',
  dateOfBirth: '',
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const AdminUsers = () => {
  const { token, user, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<UserFormState>(emptyForm);
  const [sortBy, setSortBy] = useState('createdAt-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  useEffect(() => {
    if (!loading && (!token || !user)) {
      navigate('/login', { replace: true });
    }
  }, [loading, navigate, token, user]);

  useEffect(() => {
    if (!loading && user && !user.isAdmin) {
      navigate('/home', { replace: true });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!token || !user?.isAdmin) {
      return;
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get<AdminUser[]>(`${API_BASE}/api/user/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch {
        setError('Failed to load users.');
      } finally {
        setPageLoading(false);
      }
    };

    fetchUsers();
  }, [token, user]);

  useEffect(() => {
    if (!successMessage) return;
    const timeoutId = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, itemsPerPage]);

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'createdAt-asc') {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === 'createdAt-desc') {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === 'name-asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'name-desc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  const filteredUsers = sortedUsers.filter((entry) => {
    const haystack =
      `${entry.name} ${entry.email} ${entry.phone ?? ''} ${entry.major ?? ''} ${entry.program ?? ''}`.toLowerCase();
    return haystack.includes(searchQuery.toLowerCase());
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openEditor = (entry: AdminUser) => {
    setSelectedUser(entry);
    setFormData({
      name: entry.name || '',
      phone: entry.phone || '',
      major: entry.major || '',
      yearOfStudy: entry.yearOfStudy || '',
      gender: entry.gender || '',
      program: entry.program || '',
      dateOfBirth: entry.dateOfBirth ? entry.dateOfBirth.slice(0, 10) : '',
    });
    setError(null);
    setSuccessMessage(null);
  };

  const closeEditor = () => {
    setSelectedUser(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedUser || !token) return;

    setSaving(true);
    setError(null);

    try {
      const response = await axios.put<AdminUser>(
        `${API_BASE}/api/user/admin/users/${selectedUser._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((currentUsers) =>
        currentUsers.map((entry) => (entry._id === selectedUser._id ? response.data : entry))
      );
      setSuccessMessage('User updated successfully.');
      closeEditor();
    } catch (requestError) {
      const axiosError = axios.isAxiosError(requestError) ? requestError : null;
      setError(axiosError?.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteUser || !token) return;

    setDeletingId(pendingDeleteUser._id);
    setError(null);

    try {
      await axios.delete(`${API_BASE}/api/user/admin/users/${pendingDeleteUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((currentUsers) =>
        currentUsers.filter((userEntry) => userEntry._id !== pendingDeleteUser._id)
      );
      if (selectedUser?._id === pendingDeleteUser._id) {
        closeEditor();
      }
      setSuccessMessage('User deleted successfully.');
    } catch (requestError) {
      const axiosError = axios.isAxiosError(requestError) ? requestError : null;
      setError(axiosError?.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
      setPendingDeleteUser(null);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-white pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-10 w-72 bg-gray-200 rounded-lg mb-4" />
          <div className="h-12 w-full bg-gray-100 rounded-lg mb-8" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-44 bg-gray-100 rounded-2xl border border-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F4FDFB] to-white font-sans pt-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6FFFA] text-[#007C6A] text-xs font-bold uppercase tracking-[0.18em] mb-4">
                <FiShield className="w-3.5 h-3.5" /> Admin only
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight">
                User Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl">
                Search, review, update, and remove campus users from one place.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:max-w-2xl">
              <div className="relative flex-grow">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by name, email, or program..."
                  className="w-full h-12 pl-11 pr-4 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                />
              </div>

              <div className="w-full sm:w-64">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                >
                  <option value="createdAt-asc">Oldest First (Default)</option>
                  <option value="createdAt-desc">Newest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          <ErrorMessage message={error} />
          <SuccessMessage message={successMessage} onDismiss={() => setSuccessMessage(null)} />
        </div>

        <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr] items-start">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'}
              </span>
              <span>{users.length} total</span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              {paginatedUsers.map((entry) => (
                <article
                  key={entry._id}
                  className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {entry.profilePicture?.url ? (
                        <img
                          src={entry.profilePicture.url}
                          alt={entry.name}
                          className="h-12 w-12 rounded-xl object-cover flex-shrink-0 border-2 border-gray-100"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#181818] text-white flex-shrink-0">
                          <FiUser className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="text-base font-bold text-black truncate">{entry.name}</h2>
                        <p className="text-sm text-gray-500 truncate">{entry.email}</p>
                      </div>
                    </div>
                    {entry.isAdmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#E6FFFA] px-2.5 py-1 text-xs font-semibold text-[#007C6A]">
                        <FiShield className="w-3 h-3" /> Admin
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Phone</p>
                      <p className="font-medium text-gray-900">{entry.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Program</p>
                      <p className="font-medium text-gray-900">{entry.program || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Major</p>
                      <p className="font-medium text-gray-900">{entry.major || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs uppercase tracking-wide">Joined</p>
                      <p className="font-medium text-gray-900">{formatDate(entry.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openEditor(entry)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#181818] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#00C6A7]"
                    >
                      <FiEdit2 className="w-4 h-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteUser(entry)}
                      disabled={deletingId === entry._id || entry._id === user?._id}
                      className="inline-flex items-center gap-2 rounded-lg border-2 border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FiTrash2 className="w-4 h-4" />{' '}
                      {deletingId === entry._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-gray-200 shadow-sm text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-9 px-2.5 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                  >
                    <option value={10}>10 per page</option>
                    <option value={12}>12 per page</option>
                    <option value={24}>24 per page</option>
                    <option value={48}>48 per page</option>
                  </select>
                  <span className="text-gray-500">
                    of <strong className="text-black font-semibold">{totalItems}</strong> entries
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="h-10 px-4 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-500 px-2">
                    Page <strong className="text-black font-semibold">{currentPage}</strong> of{' '}
                    <strong className="text-black font-semibold">{totalPages}</strong>
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className="h-10 px-4 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="sticky top-28 rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-sm">
            {selectedUser ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-black">Edit user</h2>
                    <p className="text-sm text-gray-500 truncate">{selectedUser.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
                    aria-label="Close editor"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-gray-700">
                    Name
                    <input
                      value={formData.name}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, name: event.target.value }))
                      }
                      className="h-11 rounded-xl border-2 border-gray-200 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-gray-700">
                    Phone
                    <input
                      value={formData.phone}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, phone: event.target.value }))
                      }
                      className="h-11 rounded-xl border-2 border-gray-200 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-gray-700">
                    Major
                    <input
                      value={formData.major}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, major: event.target.value }))
                      }
                      className="h-11 rounded-xl border-2 border-gray-200 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-gray-700">
                      Year
                      <select
                        value={formData.yearOfStudy}
                        onChange={(event) =>
                          setFormData((current) => ({
                            ...current,
                            yearOfStudy: event.target.value,
                          }))
                        }
                        className="h-11 rounded-xl border-2 border-gray-200 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] bg-white"
                      >
                        <option value="">Not set</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                        <option value="5th Year">5th Year</option>
                        <option value="Graduate">Graduate</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-gray-700">
                      Gender
                      <select
                        value={formData.gender}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, gender: event.target.value }))
                        }
                        className="h-11 rounded-xl border-2 border-gray-200 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] bg-white"
                      >
                        <option value="">Not set</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                  </div>
                  <label className="grid gap-2 text-sm font-medium text-gray-700">
                    Program
                    <select
                      value={formData.program}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, program: event.target.value }))
                      }
                      className="h-11 rounded-xl border-2 border-gray-200 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] bg-white"
                    >
                      <option value="">Not set</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="MBA">MBA</option>
                      <option value="BBA">BBA</option>
                      <option value="B.Des">B.Des</option>
                      <option value="M.Des">M.Des</option>
                      <option value="BFA">BFA</option>
                      <option value="B.Sc">B.Sc</option>
                      <option value="M.Sc">M.Sc</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-gray-700">
                    Date of Birth
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(event) =>
                        setFormData((current) => ({ ...current, dateOfBirth: event.target.value }))
                      }
                      className="h-11 rounded-xl border-2 border-gray-200 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                    />
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#181818] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00C6A7] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <FiSave className="w-4 h-4" /> {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditor}
                    className="inline-flex items-center justify-center rounded-xl border-2 border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6FFFA] text-[#007C6A]">
                  <FiUser className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-black">Select a user</h2>
                <p className="mt-2 max-w-xs text-sm text-gray-500">
                  Choose a user card to review and update profile details.
                </p>
              </div>
            )}
          </aside>
        </section>
      </main>

      <FeatureModal
        isOpen={Boolean(pendingDeleteUser)}
        onClose={() => setPendingDeleteUser(null)}
        title="Delete user"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-black">{pendingDeleteUser?.name}</span>? This cannot
            be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setPendingDeleteUser(null)}
              className="rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={!pendingDeleteUser || deletingId === pendingDeleteUser._id}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deletingId === pendingDeleteUser?._id ? 'Deleting...' : 'Delete user'}
            </button>
          </div>
        </div>
      </FeatureModal>

      <Footer
        logo={<img src="/Logo.webp" alt="KampusKart Logo" className="h-7 w-7" />}
        brandName="KampusKart"
        socialLinks={socialLinks}
        mainLinks={[]}
        legalLinks={[]}
        copyright={{
          text: `© ${new Date().getFullYear()} KampusKart`,
          license: 'All rights reserved.',
        }}
      />
    </div>
  );
};

export default AdminUsers;
