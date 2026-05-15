import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiXCircle,
  FiAlertCircle, FiCheckCircle, FiCalendar, FiTag, FiBriefcase, FiCamera
} from 'react-icons/fi';
import { API_BASE } from '../config';
import { Footer } from './ui/footer';
import { socialLinks } from '../utils/socialLinks';

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'Not set';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Not set';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return 'Not set';
  }
};

const calculateCompletion = (data: Record<string, any>) => {
  const fields = ['name', 'email', 'phone', 'gender', 'dateOfBirth', 'major', 'program', 'yearOfStudy'];
  const filled = fields.filter(f => data[f] && String(data[f]).trim() !== '');
  return Math.round((filled.length / fields.length) * 100);
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

const ProfileSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white font-sans">
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <div className="max-w-3xl mx-auto">
        {/* Header row */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-9 w-40 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>

        {/* Avatar card */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6 flex flex-col sm:flex-row items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
          <div className="flex-1 w-full space-y-3">
            <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-8">
          {[0, 1].map(section => (
            <div key={section}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-5 w-44 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: section === 0 ? 5 : 3 }).map((_, i) => (
                  <div key={i} className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg space-y-2">
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-2 border-t-2 border-gray-200">
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  </div>
);

// ─── Field display ────────────────────────────────────────────────────────────

const InfoField: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
    <p className="text-xs font-semibold text-gray-500 mb-1.5">{label}</p>
    <div className="flex items-center gap-2 text-gray-900 font-medium text-sm">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <span className={value === 'Not set' ? 'text-gray-400 italic' : ''}>{value}</span>
    </div>
  </div>
);

// ─── Edit field ───────────────────────────────────────────────────────────────

const EditField: React.FC<{
  id: string; label: string; icon: React.ReactNode;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; disabled?: boolean; note?: string;
  max?: string;
}> = ({ id, label, icon, value, onChange, type = 'text', placeholder, disabled, note, max }) => (
  <div className="flex flex-col">
    <label htmlFor={id} className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</span>
      <input
        id={id} type={type} name={id} value={value} onChange={onChange}
        disabled={disabled} placeholder={placeholder} max={max}
        className={`w-full pl-10 pr-3 py-2.5 border-2 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent transition-colors
          ${disabled ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-900 border-gray-200'}`}
      />
    </div>
    {note && <p className="text-xs text-gray-400 mt-1">{note}</p>}
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const Profile = () => {
  const { user, token } = useAuth();

  const emptyProfile = {
    name: '', email: '', phone: '', major: '',
    yearOfStudy: '', profilePicture: null as { url: string; public_id: string } | null,
    gender: '', dateOfBirth: '', program: '',
  };

  const [profileData, setProfileData] = useState(emptyProfile);
  const [initialProfileData, setInitialProfileData] = useState(emptyProfile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { logout } = useAuth();

  // Seed from AuthContext immediately, then fetch fresh data
  useEffect(() => {
    if (user) {
      const seed = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        major: user.major || '',
        yearOfStudy: user.yearOfStudy || '',
        profilePicture: user.profilePicture || null,
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        program: user.program || '',
      };
      setProfileData(seed);
      setInitialProfileData(seed);
    }
  }, [user]);

  // Fetch fresh profile from API
  useEffect(() => {
    if (!token || !user) { setPageLoading(false); return; }
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) { setPageLoading(false); return; }
        const data = await res.json();
        const fresh = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          major: data.major || '',
          yearOfStudy: data.yearOfStudy || '',
          profilePicture: data.profilePicture || null,
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          program: data.program || '',
        };
        setProfileData(fresh);
        setInitialProfileData(fresh);
      } catch {
        // silently fall back to AuthContext data
      } finally {
        setPageLoading(false);
      }
    };
    fetchProfile();
  }, [token, user]);

  // Preview URL for selected file
  useEffect(() => {
    if (!selectedFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // Auto-dismiss success message
  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccessMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({ ...initialProfileData });
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profileData.name.trim()) { setError('Name cannot be empty.'); return; }
    setSaveLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('name', profileData.name.trim());
    formData.append('phone', profileData.phone.trim());
    formData.append('major', profileData.major.trim());
    formData.append('yearOfStudy', profileData.yearOfStudy.trim());
    formData.append('gender', profileData.gender.trim());
    formData.append('dateOfBirth', profileData.dateOfBirth.trim());
    formData.append('program', profileData.program.trim());
    if (selectedFile) formData.append('profilePicture', selectedFile);

    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const updated = {
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          major: data.major || '',
          yearOfStudy: data.yearOfStudy || '',
          profilePicture: data.profilePicture || null,
          gender: data.gender || '',
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
          program: data.program || '',
        };
        setProfileData(updated);
        setInitialProfileData(updated);
        setSelectedFile(null);
        setPreviewUrl(null);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(data.message || 'Failed to save profile.');
      }
    } catch {
      setError('An error occurred while saving. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user?.googleId && !deletePassword) {
      setDeleteError('Please enter your password to confirm.');
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: deletePassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        logout();
      } else {
        setDeleteError(data.message || 'Failed to delete account.');
      }
    } catch {
      setDeleteError('An error occurred. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (pageLoading) return <ProfileSkeleton />;

  const avatarSrc = previewUrl || profileData.profilePicture?.url;
  const completion = calculateCompletion(profileData);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-3xl mx-auto">

          {/* Page header */}
          <div className="flex items-center justify-between mb-8 gap-4">
            <h1 className="text-h2 font-extrabold text-black">My Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#181818] text-white font-bold text-sm hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 min-h-touch"
              >
                <FiEdit2 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-center gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 font-medium text-sm">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 p-1">
                <FiXCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          {successMessage && (
            <div className="mb-5 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
              <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-green-800 font-medium text-sm">{successMessage}</p>
            </div>
          )}

          {/* Avatar + completion card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 p-5 sm:p-6 bg-white border-2 border-gray-200 rounded-lg">
            {/* Avatar */}
            <div className="relative flex-shrink-0 group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-100 border-2 border-gray-200 overflow-hidden flex items-center justify-center">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <FiUser className="w-10 h-10 text-gray-300" />
                )}
              </div>
              {isEditing && (
                <label
                  htmlFor="profilePicture-upload"
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 text-white cursor-pointer rounded-lg gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200"
                  title="Upload photo"
                >
                  <FiCamera className="w-5 h-5" />
                  <span className="text-xs font-semibold">Change</span>
                  <input
                    id="profilePicture-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            {/* Name + email + completion */}
            <div className="flex-1 w-full text-center sm:text-left">
              <p className="text-lg font-bold text-gray-900 leading-tight">{profileData.name || 'Your Name'}</p>
              <p className="text-sm text-gray-500 mb-3 truncate">{profileData.email}</p>
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">Profile Completion</span>
                  <span className="text-xs font-bold text-gray-700">{completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${completion}%`,
                      backgroundColor: completion === 100 ? '#10B981' : '#00C6A7',
                    }}
                  />
                </div>
                {completion < 100 && (
                  <p className="text-xs text-gray-400 mt-1">
                    {isEditing ? 'Fill in all fields to reach 100%' : 'Click Edit Profile to complete your profile'}
                  </p>
                )}
                {completion === 100 && (
                  <p className="text-xs text-green-600 mt-1 font-semibold">Profile complete. You are all set.</p>
                )}
              </div>
            </div>
          </div>

          {/* Main info card */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-5 sm:p-6">
            {isEditing ? (
              <div className="space-y-8">
                {/* Personal Info */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#181818] text-white rounded-lg p-1.5"><FiUser className="w-4 h-4" /></span>
                    <h2 className="text-base font-extrabold text-black">Personal Information</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditField id="name" label="Full Name" icon={<FiUser className="w-4 h-4" />}
                      value={profileData.name} onChange={handleInputChange} placeholder="Your full name" />
                    <EditField id="email" label="Email" icon={<FiMail className="w-4 h-4" />}
                      value={profileData.email} onChange={handleInputChange} disabled note="Cannot be changed." />
                    <EditField id="phone" label="Phone" icon={<FiPhone className="w-4 h-4" />}
                      value={profileData.phone} onChange={handleInputChange} placeholder="Your phone number" />
                    {/* Gender */}
                    <div className="flex flex-col">
                      <label htmlFor="gender" className="block text-xs font-semibold text-gray-700 mb-1.5">Gender</label>
                      <div className="relative">
                        <select id="gender" name="gender" value={profileData.gender} onChange={handleInputChange}
                          className="appearance-none w-full px-4 py-2.5 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent text-base cursor-pointer">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <EditField id="dateOfBirth" label="Date of Birth" icon={<FiCalendar className="w-4 h-4" />}
                      value={profileData.dateOfBirth} onChange={handleInputChange}
                      type="date" max={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>

                {/* Academic Info */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#181818] text-white rounded-lg p-1.5"><FiBriefcase className="w-4 h-4" /></span>
                    <h2 className="text-base font-extrabold text-black">Academic Information</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditField id="major" label="Major / Department" icon={<FiTag className="w-4 h-4" />}
                      value={profileData.major} onChange={handleInputChange} placeholder="e.g., Computer Science" />
                    <EditField id="program" label="Program" icon={<FiBriefcase className="w-4 h-4" />}
                      value={profileData.program} onChange={handleInputChange} placeholder="e.g., Bachelor of Science" />
                    <EditField id="yearOfStudy" label="Year Interval" icon={<FiCalendar className="w-4 h-4" />}
                      value={profileData.yearOfStudy} onChange={handleInputChange} placeholder="e.g., 2024 - 2028" />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t-2 border-gray-200">
                  <button onClick={handleCancelEdit}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 transition-colors min-h-touch">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saveLoading}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-[#181818] hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 min-h-touch ${saveLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    {saveLoading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <><FiSave className="w-4 h-4" /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Personal Info view */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#181818] text-white rounded-lg p-1.5"><FiUser className="w-4 h-4" /></span>
                    <h2 className="text-base font-extrabold text-black">Personal Information</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InfoField label="Full Name" value={profileData.name || 'Not set'} icon={<FiUser className="w-4 h-4" />} />
                    <InfoField label="Email" value={profileData.email || 'Not set'} icon={<FiMail className="w-4 h-4" />} />
                    <InfoField label="Phone" value={profileData.phone || 'Not set'} icon={<FiPhone className="w-4 h-4" />} />
                    <InfoField label="Gender" value={profileData.gender || 'Not set'} icon={<FiUser className="w-4 h-4" />} />
                    <InfoField label="Date of Birth" value={formatDate(profileData.dateOfBirth)} icon={<FiCalendar className="w-4 h-4" />} />
                  </div>
                </div>

                {/* Academic Info view */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#181818] text-white rounded-lg p-1.5"><FiBriefcase className="w-4 h-4" /></span>
                    <h2 className="text-base font-extrabold text-black">Academic Information</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InfoField label="Major / Department" value={profileData.major || 'Not set'} icon={<FiTag className="w-4 h-4" />} />
                    <InfoField label="Program" value={profileData.program || 'Not set'} icon={<FiBriefcase className="w-4 h-4" />} />
                    <InfoField label="Year Interval" value={profileData.yearOfStudy || 'Not set'} icon={<FiCalendar className="w-4 h-4" />} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Delete Account Button */}
          {!isEditing && (
            <div className="mt-8 flex justify-center sm:justify-start">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors duration-200"
              >
                Delete My Account
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white w-full max-w-md rounded-lg p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="mb-4 text-red-600 text-xs font-medium">
                {deleteError}
              </div>
            )}

            {!user?.googleId && (
              <div className="mb-6">
                <label htmlFor="delete-password" className="block text-xs font-semibold text-gray-700 mb-2">
                  Enter password to confirm
                </label>
                <input
                  id="delete-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C6A7]"
                />
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeletePassword(''); setDeleteError(null); }}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer
        logo={<img src="/Logo.webp" alt="KampusKart Logo" className="h-7 w-7" />}
        brandName="KampusKart"
        socialLinks={socialLinks}
        mainLinks={[
          { href: '/news', label: 'News' },
          { href: '/events', label: 'Events' },
          { href: '/facilities', label: 'Facilities' },
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

export default Profile;

