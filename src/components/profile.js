import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    bio: '',
    employeeID: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            street: data.street || '',
            city: data.city || '',
            state: data.state || '',
            postalCode: data.postalCode || '',
            country: data.country || '',
            bio: data.bio || '',
            employeeID: data.employeeID || '',
          });
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const { employeeID, ...updateData } = userData;
      await updateDoc(userRef, updateData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile');
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 w-[90%] sm:w-3/4 mx-auto">
        <div className="relative px-4 py-10 bg-white shadow rounded-3xl sm:p-10">
          <div className="max-w-full mx-auto">
            <div className="flex items-center space-x-5">
              <div className="h-14 w-14 bg-blue-200 rounded-full flex flex-shrink-0 justify-center items-center text-blue-500 text-2xl font-mono">
                {userData.firstName.charAt(0)}
              </div>
              <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                <h2 className="leading-relaxed">Edit Profile</h2>
                <p className="text-sm text-gray-500 font-normal leading-relaxed">
                  Update your personal information
                </p>
              </div>
            </div>
            <form className="divide-y divide-gray-200" onSubmit={handleSubmit}>
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <div className="flex flex-col">
                  <label className="leading-loose">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Your first name"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Your last name"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Your email"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userData.phoneNumber}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Your phone number"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Street</label>
                  <input
                    type="text"
                    name="street"
                    value={userData.street}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Street address"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">City</label>
                  <input
                    type="text"
                    name="city"
                    value={userData.city}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="City"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">State</label>
                  <input
                    type="text"
                    name="state"
                    value={userData.state}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="State"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={userData.postalCode}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Postal Code"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={userData.country}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Country"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Bio</label>
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Your bio"
                    rows="3"
                  ></textarea>
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Employee ID</label>
                  <input
                    type="text"
                    name="employeeID"
                    value={userData.employeeID}
                    className="px-4 py-2 border bg-gray-100 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600 cursor-not-allowed"
                    placeholder="Employee ID"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Employee ID cannot be changed</p>
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm mb-4">{error}</div>
              )}
              {success && (
                <div className="text-green-500 text-sm mb-4">{success}</div>
              )}
              <div className="pt-4 flex items-center space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}