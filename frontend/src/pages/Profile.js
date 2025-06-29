import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    country: user?.country || 'IN'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateProfile(formData);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">👤 My Profile</h1>
          <p className="text-gray-400">Manage your account settings and preferences</p>
        </div>

        {/* Profile Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-happy-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.full_name || user?.username}</h2>
                <p className="text-gray-400">{user?.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user?.kyc_status === 'verified' 
                      ? 'bg-green-500 text-white'
                      : user?.kyc_status === 'pending'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-500 text-white'
                  }`}>
                    KYC: {user?.kyc_status || 'Not Submitted'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Member since {new Date(user?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="border-b border-gray-700">
            <nav className="flex">
              {[
                { id: 'profile', label: 'Profile Info', icon: '👤' },
                { id: 'security', label: 'Security', icon: '🔒' },
                { id: 'kyc', label: 'KYC Verification', icon: '📋' },
                { id: 'referrals', label: 'Referrals', icon: '👥' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-happy-500 text-happy-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Profile Info Tab */}
            {activeTab === 'profile' && (
              <div className="max-w-md">
                <h3 className="text-white font-semibold mb-4">Personal Information</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Country</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    >
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary py-3 disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="max-w-md">
                <h3 className="text-white font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <h4 className="text-white font-medium mb-2">Change Password</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Update your password to keep your account secure
                    </p>
                    <button className="btn-secondary text-sm">
                      Change Password
                    </button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <h4 className="text-white font-medium mb-2">Two-Factor Authentication</h4>
                    <p className="text-gray-400 text-sm mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <button className="btn-secondary text-sm">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <div>
                <h3 className="text-white font-semibold mb-4">KYC Verification</h3>
                <div className="max-w-md">
                  <div className={`bg-gray-900 rounded-lg p-4 border-2 ${
                    user?.kyc_status === 'verified' 
                      ? 'border-green-500'
                      : user?.kyc_status === 'pending'
                      ? 'border-yellow-500'
                      : 'border-gray-600'
                  }`}>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        user?.kyc_status === 'verified' 
                          ? 'bg-green-500'
                          : user?.kyc_status === 'pending'
                          ? 'bg-yellow-500'
                          : 'bg-gray-500'
                      }`}>
                        <span className="text-white">
                          {user?.kyc_status === 'verified' ? '✓' : user?.kyc_status === 'pending' ? '⏳' : '📋'}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-white font-medium">
                          KYC Status: {user?.kyc_status === 'verified' ? 'Verified' 
                            : user?.kyc_status === 'pending' ? 'Under Review'
                            : 'Not Submitted'}
                        </h4>
                        <p className="text-gray-400 text-sm">
                          {user?.kyc_status === 'verified' 
                            ? 'Your identity has been verified'
                            : user?.kyc_status === 'pending'
                            ? 'We are reviewing your documents'
                            : 'Complete KYC to unlock all features'}
                        </p>
                      </div>
                    </div>
                    
                    {user?.kyc_status !== 'verified' && (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-300">
                          <p className="font-medium mb-2">Required Documents:</p>
                          <ul className="space-y-1 text-xs text-gray-400">
                            <li>• Government issued ID (Aadhar, Passport, Driving License)</li>
                            <li>• PAN Card</li>
                            <li>• Recent selfie for verification</li>
                          </ul>
                        </div>
                        
                        {user?.kyc_status !== 'pending' && (
                          <button className="btn-primary text-sm">
                            Submit KYC Documents
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Referrals Tab */}
            {activeTab === 'referrals' && (
              <div>
                <h3 className="text-white font-semibold mb-4">Referral Program</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <h4 className="text-white font-medium mb-2">Your Referral Code</h4>
                    <div className="bg-gray-800 rounded border border-gray-600 p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-happy-400 font-mono text-lg">{user?.referral_code}</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(user?.referral_code)}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Share this code with friends to earn bonuses when they sign up!
                    </p>
                  </div>
                  
                  <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                    <h4 className="text-white font-medium mb-2">Referral Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Referrals:</span>
                        <span className="text-white font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bonus Earned:</span>
                        <span className="text-happy-400 font-medium">0 HC</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;