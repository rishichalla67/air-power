import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    
    setError("")
    setMessage("")
    setLoading(true)
    try {
      await resetPassword(email)
      setMessage('Check your inbox for further instructions!')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-white">
            Forgot your password?
          </h2>
        </div>
        {error && (
          <div role="alert">
            <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
              Error
            </div>
            <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
              <p>{error}</p>
            </div>
          </div>
        )}
        {message && (
          <div role="alert">
            <div className="bg-green-500 text-white font-bold rounded-t px-4 py-2">
              Thank You!
            </div>
            <div className="border border-t-0 border-green-400 rounded-b bg-green-100 px-4 py-3 text-green-700">
              <p>{message}</p>
            </div>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading || message}
            >
              Reset Password
            </button>
          </div>

          <div>
            <p className="mt-2 text-center text-sm text-white">
              Remember now?{' '}
              <a href="/login" className="font-medium text-blue-200 hover:text-blue-100">
                Log in here!
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
