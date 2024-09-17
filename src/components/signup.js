import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    employeeID: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isAdmin: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      const { email, password, ...userData } = formData;
      
      // Remove empty address fields
      const cleanedUserData = Object.fromEntries(
        Object.entries(userData).filter(([key, value]) => 
          !['street', 'city', 'state', 'postalCode', 'country'].includes(key) || value !== ''
        )
      );

      await signup(email, password, cleanedUserData);
      navigate("/");
    } catch (error) {
      setError("Failed to create an account: " + error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
              <InputField name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
            </div>
            <InputField 
              name="email" 
              type="email" 
              placeholder="Email address" 
              value={formData.email} 
              onChange={handleChange} 
              autoComplete="off" 
              required
            />
            <InputField 
              name="password" 
              type="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              autoComplete="off" 
              required
            />
            <InputField name="employeeID" placeholder="Employee ID" value={formData.employeeID} onChange={handleChange} required />
          </div>

          <div className="rounded-md shadow-sm -space-y-px mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Address (Optional)</h3>
            <InputField name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField name="city" placeholder="City" value={formData.city} onChange={handleChange} />
              <InputField name="state" placeholder="State" value={formData.state} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField name="postalCode" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} />
              <InputField name="country" placeholder="Country" value={formData.country} onChange={handleChange} />
            </div>
          </div>

          <div className="flex items-center mt-4">
            <input
              id="isAdmin"
              name="isAdmin"
              type="checkbox"
              checked={formData.isAdmin}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
              Admin User
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? "Creating..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({ name, type = "text", placeholder, value, onChange, autoComplete, required }) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {placeholder} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
    </div>
  );
}