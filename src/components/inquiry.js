import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { XMarkIcon, EnvelopeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

function InquiryList() {
    const [inquiries, setInquiries] = useState([]);
    const [resolvedInquiries, setResolvedInquiries] = useState([]);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isResolvedSectionOpen, setIsResolvedSectionOpen] = useState(false);
    const { userData } = useAuth();

    useEffect(() => {
        const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allInquiries = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            const unresolved = allInquiries.filter(inquiry => !inquiry.resolved);
            const resolved = allInquiries.filter(inquiry => inquiry.resolved);
            setInquiries(unresolved);
            setResolvedInquiries(resolved);
        });

        return () => unsubscribe();
    }, []);

    const handleInquiryClick = (inquiry) => {
        setSelectedInquiry(inquiry);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedInquiry(null);
    };

    const handleSendEmail = (email) => {
        window.location.href = `mailto:${email}`;
    };

    const handleMarkAsResolved = async (inquiryId) => {
        try {
            const inquiryRef = doc(db, 'inquiries', inquiryId);
            await updateDoc(inquiryRef, { resolved: true });
        } catch (error) {
            console.error("Error marking inquiry as resolved: ", error);
        }
    };

    const handleMarkAsUnresolved = async (inquiryId) => {
        try {
            const inquiryRef = doc(db, 'inquiries', inquiryId);
            await updateDoc(inquiryRef, { resolved: false });
        } catch (error) {
            console.error("Error marking inquiry as unresolved: ", error);
        }
    };

    if (!userData.isAdmin) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <p className="text-xl font-semibold text-gray-600">You don't have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="w-screen min-h-screen bg-gray-100 p-4">
            <div className="w-full sm:w-[95%] mx-auto">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Inquiries</h2>
                    {inquiries.length === 0 ? (
                        <p className="text-gray-600">No inquiries found.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {inquiries.map((inquiry) => (
                                <div 
                                    key={inquiry.id} 
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                                    onClick={() => handleInquiryClick(inquiry)}
                                >
                                    <h3 className="font-semibold text-lg mb-2">{inquiry.name}</h3>
                                    <p className="text-gray-600 mb-2">{inquiry.email}</p>
                                    <p className="text-gray-800 line-clamp-3">{inquiry.message}</p>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {new Date(inquiry.createdAt.toDate()).toLocaleString()}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkAsResolved(inquiry.id);
                                        }}
                                        className="mt-2 flex items-center text-sm text-green-600 hover:text-green-800"
                                    >
                                        <CheckCircleIcon className="h-5 w-5 mr-1" />
                                        Mark as Resolved
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Resolved Inquiries Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div 
                        className="flex justify-between items-center cursor-pointer" 
                        onClick={() => setIsResolvedSectionOpen(!isResolvedSectionOpen)}
                    >
                        <h2 className="text-2xl font-bold mb-4">Resolved Inquiries</h2>
                        <button className="text-blue-500 hover:text-blue-700">
                            {isResolvedSectionOpen ? 'Collapse' : 'Expand'}
                        </button>
                    </div>
                    {isResolvedSectionOpen && (
                        <>
                            {resolvedInquiries.length === 0 ? (
                                <p className="text-gray-600">No resolved inquiries.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {resolvedInquiries.map((inquiry) => (
                                        <div 
                                            key={inquiry.id} 
                                            className="bg-gray-100 border border-gray-300 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                                            onClick={() => handleInquiryClick(inquiry)}
                                        >
                                            <h3 className="font-semibold text-lg mb-2">{inquiry.name}</h3>
                                            <p className="text-gray-600 mb-2">{inquiry.email}</p>
                                            <p className="text-gray-800 line-clamp-3">{inquiry.message}</p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                {new Date(inquiry.createdAt.toDate()).toLocaleString()}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsUnresolved(inquiry.id);
                                                }}
                                                className="mt-2 flex items-center text-sm text-red-600 hover:text-red-800"
                                            >
                                                <XCircleIcon className="h-5 w-5 mr-1" />
                                                Mark as Unresolved
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {showModal && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Inquiry Details</h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mb-4">
                            <h3 className="font-semibold text-lg">From: {selectedInquiry.name}</h3>
                            <p className="text-gray-600">{selectedInquiry.email}</p>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-semibold mb-2">Message:</h4>
                            <p className="text-gray-800 whitespace-pre-wrap">{selectedInquiry.message}</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Received: {new Date(selectedInquiry.createdAt.toDate()).toLocaleString()}
                        </p>
                        <button 
                            onClick={() => handleSendEmail(selectedInquiry.email)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
                        >
                            <EnvelopeIcon className="h-5 w-5 mr-2" />
                            Reply via Email
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InquiryList;
