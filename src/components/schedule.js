import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

// Notification component
function Notification({ message, type, onClose }) {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-4 py-2 rounded-md shadow-md flex items-center z-50 w-full max-w-sm mx-auto notification-banner`}>
            <span className="flex-grow">{message}</span>
            <button onClick={onClose} className="ml-2 focus:outline-none">
                <XMarkIcon className="h-5 w-5" />
            </button>
        </div>
    );
}

function EventItem({ event, onDelete, onEdit }) {
    return (
        <li className="mb-8 p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{event.title}</h3>
                <div>
                    <button
                        onClick={() => onEdit(event)}
                        className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                        <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => onDelete(event.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <p><strong>Address:</strong> {event.address}</p>
            <p><strong>Building #:</strong> {event.buildingNumber}</p>
            <p><strong>Office #:</strong> {event.officeNumber}</p>
            <p><strong>Filter Size:</strong> {event.filterSize}</p>
            <p><strong>Condition:</strong> {event.condition}</p>
            <p><strong>Assigned To:</strong> {event.assignTo}</p>
            <p><strong>Last Maintenance Date:</strong> {event.lastMaintenanceDate}</p>
            <p><strong>Maintenance Frequency:</strong> {event.maintenanceFrequency} days</p>
            <p><strong>Next Maintenance Date:</strong> {event.nextMaintenanceDate}</p>
            <p><strong>Completed:</strong> {event.completed ? 'Yes' : 'No'}</p>
            <p><strong>Notes:</strong> {event.notes}</p>
        </li>
    );
}

function Schedule() {
    const [date, setDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [newEvent, setNewEvent] = useState({
        title: '',
        address: '',
        buildingNumber: '',
        officeNumber: '',
        filterSize: '',
        condition: '',
        assignTo: '',
        lastMaintenanceDate: '',
        maintenanceFrequency: '',
        nextMaintenanceDate: '',
        completed: false,
        notes: ''
    });
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [eventToUpdate, setEventToUpdate] = useState(null);
    const [notification, setNotification] = useState(null);
    const clickTimeoutRef = useRef(null);

    useEffect(() => {
        const eventsCollection = collection(db, 'events');

        const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
            const fetchedEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setEvents(fetchedEvents);
        }, (error) => {
            console.error("Error fetching events: ", error);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (newEvent.lastMaintenanceDate && newEvent.maintenanceFrequency) {
            const lastDate = new Date(newEvent.lastMaintenanceDate);
            const nextDate = new Date(lastDate.setDate(lastDate.getDate() + parseInt(newEvent.maintenanceFrequency)));
            setNewEvent(prev => ({
                ...prev,
                nextMaintenanceDate: nextDate.toISOString().split('T')[0]
            }));
        }
    }, [newEvent.lastMaintenanceDate, newEvent.maintenanceFrequency]);

    const handleDateClick = (date) => {
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
            clickTimeoutRef.current = null;
            handleDateDoubleClick(date);
        } else {
            clickTimeoutRef.current = setTimeout(() => {
                clickTimeoutRef.current = null;
                handleDateSingleClick(date);
            }, 300);
        }
    };

    const handleDateSingleClick = (date) => {
        setSelectedDate(date);
        const dayEvents = events.filter(event => 
            new Date(event.date).toDateString() === date.toDateString()
        );
        setSelectedEvents(dayEvents);
        setShowDetailsModal(true);
    };

    const handleDateDoubleClick = (date) => {
        setSelectedDate(date);
        setShowCreateModal(true);
    };

    const handleCreateModalClose = () => {
        setShowCreateModal(false);
        setNewEvent({
            title: '',
            address: '',
            buildingNumber: '',
            officeNumber: '',
            filterSize: '',
            condition: '',
            assignTo: '',
            lastMaintenanceDate: '',
            maintenanceFrequency: '',
            nextMaintenanceDate: '',
            completed: false,
            notes: ''
        });
    };

    const handleDetailsModalClose = () => {
        setShowDetailsModal(false);
        setSelectedEvents([]);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewEvent(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newEvent.title) {
            try {
                const eventsCollection = collection(db, 'events');
                await addDoc(eventsCollection, {
                    ...newEvent,
                    date: selectedDate.toISOString(),
                });
                handleCreateModalClose();
                showNotification('Event created successfully', 'success');
            } catch (error) {
                console.error("Error creating event: ", error);
                showNotification('Error creating event', 'error');
            }
        }
    };

    const handleDeleteClick = (eventId) => {
        const eventToDelete = selectedEvents.find(event => event.id === eventId);
        setEventToDelete(eventToDelete);
        setShowConfirmModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (eventToDelete) {
            try {
                await deleteDoc(doc(db, 'events', eventToDelete.id));
                setSelectedEvents(selectedEvents.filter(event => event.id !== eventToDelete.id));
                setShowConfirmModal(false);
                setEventToDelete(null);
                showNotification('Event deleted successfully', 'success');
            } catch (error) {
                console.error("Error deleting event: ", error);
                showNotification('Error deleting event', 'error');
            }
        }
    };

    const handleDeleteCancel = () => {
        setShowConfirmModal(false);
        setEventToDelete(null);
    };

    const handleEditClick = (event) => {
        setEventToUpdate(event);
        setNewEvent(event);
        setShowDetailsModal(false);
        setShowUpdateModal(true);
    };

    const handleUpdateModalClose = () => {
        setShowUpdateModal(false);
        setEventToUpdate(null);
        setNewEvent({
            title: '',
            address: '',
            buildingNumber: '',
            officeNumber: '',
            filterSize: '',
            condition: '',
            assignTo: '',
            lastMaintenanceDate: '',
            maintenanceFrequency: '',
            nextMaintenanceDate: '',
            completed: false,
            notes: ''
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (eventToUpdate && newEvent.title) {
            try {
                const eventRef = doc(db, 'events', eventToUpdate.id);
                await updateDoc(eventRef, {
                    ...newEvent,
                    date: selectedDate.toISOString(),
                });
                handleUpdateModalClose();
                showNotification('Event updated successfully', 'success');
            } catch (error) {
                console.error("Error updating event: ", error);
                showNotification('Error updating event', 'error');
            }
        }
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
            <div className="w-full h-full p-4">
                <Calendar
                    onChange={setDate}
                    value={date}
                    onClickDay={handleDateClick}
                    tileContent={({ date, view }) => {
                        if (view === 'month') {
                            const dayEvents = events.filter(event => 
                                new Date(event.date).toDateString() === date.toDateString()
                            );
                            return (
                                <ul className="list-none p-0 m-0 text-xs text-red-500">
                                    {dayEvents.map(event => (
                                        <li key={event.id} className="mb-0.5">
                                            {event.title}
                                        </li>
                                    ))}
                                </ul>
                            );
                        }
                        return null;
                    }}
                    className="responsive-calendar"
                />
            </div>
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto">
                    <div className="bg-white p-5 rounded-lg w-96 max-h-screen overflow-y-auto">
                        <h2 className="text-xl mb-4">Create Event for {selectedDate.toDateString()}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="title"
                                value={newEvent.title}
                                onChange={handleInputChange}
                                placeholder="Event Title"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="address"
                                value={newEvent.address}
                                onChange={handleInputChange}
                                placeholder="Address"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="buildingNumber"
                                value={newEvent.buildingNumber}
                                onChange={handleInputChange}
                                placeholder="Building #"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="officeNumber"
                                value={newEvent.officeNumber}
                                onChange={handleInputChange}
                                placeholder="Office #"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="filterSize"
                                value={newEvent.filterSize}
                                onChange={handleInputChange}
                                placeholder="Filter Size"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="condition"
                                value={newEvent.condition}
                                onChange={handleInputChange}
                                placeholder="Condition"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="assignTo"
                                value={newEvent.assignTo}
                                onChange={handleInputChange}
                                placeholder="Assign To"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="date"
                                name="lastMaintenanceDate"
                                value={newEvent.lastMaintenanceDate}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="number"
                                name="maintenanceFrequency"
                                value={newEvent.maintenanceFrequency}
                                onChange={handleInputChange}
                                placeholder="Maintenance Frequency (In Days)"
                                className="w-full p-2 border rounded"
                            />
                            <div className="w-full p-2 border rounded bg-gray-100">
                                <label className="block text-sm font-medium text-gray-700">Next Maintenance Date</label>
                                <input
                                    type="date"
                                    name="nextMaintenanceDate"
                                    value={newEvent.nextMaintenanceDate}
                                    readOnly
                                    className="w-full bg-gray-100"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="completed"
                                    checked={newEvent.completed}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <label htmlFor="completed">Completed</label>
                            </div>
                            <textarea
                                name="notes"
                                value={newEvent.notes}
                                onChange={handleInputChange}
                                placeholder="Notes"
                                className="w-full p-2 border rounded h-24"
                            />
                            <div className="flex justify-end space-x-2">
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Create Event</button>
                                <button type="button" onClick={handleCreateModalClose} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg w-3/5 h-3/5 overflow-y-auto">
                        <h2 className="text-2xl mb-4">Events for {selectedDate.toDateString()}</h2>
                        {selectedEvents.length > 0 ? (
                            <ul className="list-none p-0">
                                {selectedEvents.map(event => (
                                    <EventItem key={event.id} event={event} onDelete={handleDeleteClick} onEdit={handleEditClick} />
                                ))}
                            </ul>
                        ) : (
                            <p>No events for this date.</p>
                        )}
                        <button onClick={handleDetailsModalClose} className="mt-4 px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Close</button>
                    </div>
                </div>
            )}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-5 rounded-lg w-80">
                        <h2 className="text-xl mb-4">Confirm Delete</h2>
                        <p>Are you sure you want to delete this event?</p>
                        <p className="font-bold">{eventToDelete?.title}</p>
                        <div className="mt-4">
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-500 text-white rounded mr-2 hover:bg-red-600">Delete</button>
                            <button onClick={handleDeleteCancel} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto">
                    <div className="bg-white p-5 rounded-lg w-96 max-h-screen overflow-y-auto">
                        <h2 className="text-xl mb-4">Update Event for {selectedDate.toDateString()}</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <input
                                type="text"
                                name="title"
                                value={newEvent.title}
                                onChange={handleInputChange}
                                placeholder="Event Title"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="address"
                                value={newEvent.address}
                                onChange={handleInputChange}
                                placeholder="Address"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="buildingNumber"
                                value={newEvent.buildingNumber}
                                onChange={handleInputChange}
                                placeholder="Building #"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="officeNumber"
                                value={newEvent.officeNumber}
                                onChange={handleInputChange}
                                placeholder="Office #"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="filterSize"
                                value={newEvent.filterSize}
                                onChange={handleInputChange}
                                placeholder="Filter Size"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="condition"
                                value={newEvent.condition}
                                onChange={handleInputChange}
                                placeholder="Condition"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="text"
                                name="assignTo"
                                value={newEvent.assignTo}
                                onChange={handleInputChange}
                                placeholder="Assign To"
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="date"
                                name="lastMaintenanceDate"
                                value={newEvent.lastMaintenanceDate}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                            />
                            <input
                                type="number"
                                name="maintenanceFrequency"
                                value={newEvent.maintenanceFrequency}
                                onChange={handleInputChange}
                                placeholder="Maintenance Frequency (In Days)"
                                className="w-full p-2 border rounded"
                            />
                            <div className="w-full p-2 border rounded bg-gray-100">
                                <label className="block text-sm font-medium text-gray-700">Next Maintenance Date</label>
                                <input
                                    type="date"
                                    name="nextMaintenanceDate"
                                    value={newEvent.nextMaintenanceDate}
                                    readOnly
                                    className="w-full bg-gray-100"
                                />
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="completed"
                                    checked={newEvent.completed}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <label htmlFor="completed">Completed</label>
                            </div>
                            <textarea
                                name="notes"
                                value={newEvent.notes}
                                onChange={handleInputChange}
                                placeholder="Notes"
                                className="w-full p-2 border rounded h-24"
                            />
                            <div className="flex justify-end space-x-2">
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Update Event</button>
                                <button type="button" onClick={handleUpdateModalClose} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
}

const responsiveStyles = `
    .responsive-calendar {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
    }

    .react-calendar {
        width: 100% !important;
        height: 100% !important;
        max-width: 100% !important;
        max-height: 100% !important;
    }

    @media (max-width: 768px) {
        .react-calendar {
            font-size: 0.8em;
        }
    }

    @media (max-width: 640px) {
        .notification-banner {
            top: 0;
            left: 0;
            right: 0;
            transform: none;
            border-radius: 0;
            padding-top: env(safe-area-inset-top);
        }
    }
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = responsiveStyles;
document.head.appendChild(styleElement);

export default Schedule;