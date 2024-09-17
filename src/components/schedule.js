import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { TrashIcon, PencilIcon, XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

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
                        onClick={() => onDelete(event)}
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
    const { currentUser, userData } = useAuth();
    const [date, setDate] = useState(new Date());
    const [allEvents, setAllEvents] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
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
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const eventsCollection = collection(db, 'events');
        const usersCollection = collection(db, 'users');

        // Query for all events (for the calendar)
        const allEventsQuery = query(eventsCollection, orderBy('date'));
        
        // Query for user-specific events (for the list below the calendar)
        const userEventsQuery = userData.isAdmin
            ? allEventsQuery
            : query(
                eventsCollection,
                where("assignTo", "==", currentUser.displayName || currentUser.email),
                orderBy('date')
            );

        const unsubscribeAllEvents = onSnapshot(allEventsQuery, (snapshot) => {
            const fetchedEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setAllEvents(fetchedEvents);
        }, (error) => {
            console.error("Error fetching all events: ", error);
        });

        const unsubscribeUserEvents = onSnapshot(userEventsQuery, (snapshot) => {
            const fetchedEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUserEvents(fetchedEvents);
        }, (error) => {
            console.error("Error fetching user events: ", error);
        });

        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(usersCollection);
            const usersList = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(usersList);
        };

        fetchUsers();

        return () => {
            unsubscribeAllEvents();
            unsubscribeUserEvents();
        };
    }, [currentUser, userData]);

    const sortedEvents = userEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    const completedEvents = sortedEvents.filter(event => event.completed);
    const upcomingEvents = sortedEvents.filter(event => !event.completed && new Date(event.date) >= new Date());
    const draftEvents = sortedEvents.filter(event => !event.completed && new Date(event.date) < new Date());

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
        const dayEvents = allEvents.filter(event => 
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
            assignTo: userData.isAdmin ? '' : currentUser.displayName || currentUser.email,
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
        setNewEvent(prev => {
            const updatedEvent = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Calculate next maintenance date if both last maintenance date and frequency are set
            if ((name === 'lastMaintenanceDate' || name === 'maintenanceFrequency') &&
                updatedEvent.lastMaintenanceDate && updatedEvent.maintenanceFrequency) {
                const lastDate = new Date(updatedEvent.lastMaintenanceDate);
                const nextDate = new Date(lastDate.setDate(lastDate.getDate() + parseInt(updatedEvent.maintenanceFrequency)));
                updatedEvent.nextMaintenanceDate = nextDate.toISOString().split('T')[0];
            }

            return updatedEvent;
        });
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const createRecurringEvents = async (baseEvent) => {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        
        let currentDate = new Date(baseEvent.nextMaintenanceDate);
        const frequency = parseInt(baseEvent.maintenanceFrequency);
        const eventsToCreate = [];

        while (currentDate <= oneYearFromNow) {
            const newEvent = {
                ...baseEvent,
                date: currentDate.toISOString(),
                lastMaintenanceDate: new Date(currentDate).toISOString().split('T')[0],
                nextMaintenanceDate: new Date(currentDate.setDate(currentDate.getDate() + frequency)).toISOString().split('T')[0],
                completed: false
            };
            eventsToCreate.push(newEvent);
            currentDate.setDate(currentDate.getDate() + frequency);
        }

        const eventsCollection = collection(db, 'events');
        for (const event of eventsToCreate) {
            try {
                await addDoc(eventsCollection, event);
            } catch (error) {
                console.error("Error creating recurring event: ", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newEvent.title) {
            try {
                const eventsCollection = collection(db, 'events');
                const baseEvent = {
                    ...newEvent,
                    date: selectedDate.toISOString(),
                };
                await addDoc(eventsCollection, baseEvent);
                
                if (baseEvent.maintenanceFrequency && baseEvent.nextMaintenanceDate) {
                    await createRecurringEvents(baseEvent);
                }
                
                handleCreateModalClose();
                showNotification('Event(s) created successfully', 'success');
            } catch (error) {
                console.error("Error creating event: ", error);
                showNotification('Error creating event', 'error');
            }
        }
    };

    const handleDeleteClick = (event) => {
        setEventToDelete(event);
        setShowConfirmModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (eventToDelete) {
            try {
                await deleteDoc(doc(db, 'events', eventToDelete.id));
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

    const renderTooltip = (text) => (
        <div className="group relative inline-block ml-1">
            <InformationCircleIcon className="h-5 w-5 text-gray-500" />
            <span className="invisible group-hover:visible absolute z-10 bg-gray-800 text-white text-sm rounded p-2 -mt-2 ml-2 w-48">
                {text}
            </span>
        </div>
    );

    const renderEventList = (eventList, title) => (
        <div className="mb-6">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            {eventList.length > 0 ? (
                <ul className="space-y-4">
                    {eventList.map(event => (
                        <li key={event.id} className="bg-white rounded-lg shadow p-4">
                            <h4 className="text-lg font-semibold">{event.title}</h4>
                            <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
                            <p className="text-gray-600">Assigned to: {event.assignTo}</p>
                            <div className="mt-2">
                                <button
                                    onClick={() => handleEditClick(event)}
                                    className="text-blue-500 hover:text-blue-700 mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(event)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No events in this category.</p>
            )}
        </div>
    );

    return (
        <div className="w-screen min-h-screen bg-gray-100 p-4">
            {userData.isAdmin && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
                    <p className="font-bold">Admin View</p>
                    <p>You are currently viewing admin-only content.</p>
                </div>
            )}
            <div className="w-full sm:w-[95%] mx-auto">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <Calendar
                        onChange={setDate}
                        value={date}
                        onClickDay={handleDateClick}
                        tileContent={({ date, view }) => {
                            if (view === 'month') {
                                const dayEvents = allEvents.filter(event => 
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
                        className="responsive-calendar w-full"
                    />
                </div>

                <div className={`bg-white rounded-lg shadow p-6 ${userData.isAdmin ? 'border-2 border-blue-500' : ''}`}>
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        {userData.isAdmin ? (
                            <>
                                <span className="mr-2">All Events</span>
                                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">Admin</span>
                            </>
                        ) : (
                            "Your Events"
                        )}
                    </h2>
                    {renderEventList(upcomingEvents, "Upcoming Events")}
                    {renderEventList(draftEvents, "Draft Events")}
                    {renderEventList(completedEvents, "Completed Events")}
                </div>
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto">
                    <div className={`bg-white p-5 rounded-lg w-full sm:w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto relative ${userData.isAdmin ? 'border-4 border-blue-500' : ''}`}>
                        {userData.isAdmin && (
                            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-t-lg mb-4">
                                <p className="font-bold">Admin Mode</p>
                                <p className="text-sm">You can assign this event to any worker.</p>
                            </div>
                        )}
                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                        <h2 className="text-xl mb-4">Create Event for {selectedDate.toDateString()}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Event Details</h3>
                                <input
                                    type="text"
                                    name="title"
                                    value={newEvent.title}
                                    onChange={handleInputChange}
                                    placeholder="Event Title"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Location</h3>
                                <input
                                    type="text"
                                    name="address"
                                    value={newEvent.address}
                                    onChange={handleInputChange}
                                    placeholder="Address"
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <input
                                    type="text"
                                    name="buildingNumber"
                                    value={newEvent.buildingNumber}
                                    onChange={handleInputChange}
                                    placeholder="Building #"
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <input
                                    type="text"
                                    name="officeNumber"
                                    value={newEvent.officeNumber}
                                    onChange={handleInputChange}
                                    placeholder="Office #"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Filter Information</h3>
                                <input
                                    type="text"
                                    name="filterSize"
                                    value={newEvent.filterSize}
                                    onChange={handleInputChange}
                                    placeholder="Filter Size"
                                    className="w-full p-2 border rounded mb-2"
                                />
                                <input
                                    type="text"
                                    name="condition"
                                    value={newEvent.condition}
                                    onChange={handleInputChange}
                                    placeholder="Condition"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Assignment</h3>
                                {userData.isAdmin ? (
                                    <select
                                        name="assignTo"
                                        value={newEvent.assignTo}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">Select a worker</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.firstName}>
                                                {user.firstName} {user.lastName}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        name="assignTo"
                                        value={newEvent.assignTo}
                                        readOnly
                                        className="w-full p-2 border rounded bg-gray-100"
                                    />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Maintenance</h3>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Last Maintenance Date
                                        {renderTooltip("The date when the last maintenance was performed")}
                                    </label>
                                    <input
                                        type="date"
                                        name="lastMaintenanceDate"
                                        value={newEvent.lastMaintenanceDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Maintenance Frequency (in days)
                                        {renderTooltip("How often maintenance should be performed, in days")}
                                    </label>
                                    <input
                                        type="number"
                                        name="maintenanceFrequency"
                                        value={newEvent.maintenanceFrequency}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 30 for monthly"
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Next Maintenance Date
                                        {renderTooltip("Automatically calculated based on last maintenance date and frequency")}
                                    </label>
                                    <input
                                        type="date"
                                        name="nextMaintenanceDate"
                                        value={newEvent.nextMaintenanceDate}
                                        readOnly
                                        className="w-full p-2 border rounded bg-gray-100"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="completed"
                                    checked={newEvent.completed}
                                    onChange={handleInputChange}
                                    className="mr-2"
                                />
                                <label htmlFor="completed" className="text-sm font-medium text-gray-700">
                                    Completed
                                    {renderTooltip("Check if the maintenance task has been completed")}
                                </label>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Additional Notes</h3>
                                <textarea
                                    name="notes"
                                    value={newEvent.notes}
                                    onChange={handleInputChange}
                                    placeholder="Any additional information about the event"
                                    rows="3"
                                    className="w-full p-2 border rounded"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                            >
                                Create Event
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto">
                    <div className="bg-white p-5 rounded-lg w-full sm:w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                        <h2 className="text-xl mb-4">Events for {selectedDate.toDateString()}</h2>
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
                    <div className="bg-white p-5 rounded-lg w-full sm:w-[95%] max-w-md relative">
                        <button
                            onClick={handleDeleteCancel}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                        <h2 className="text-xl mb-4">Confirm Deletion</h2>
                        <p>Are you sure you want to delete this event?</p>
                        <p className="font-bold">{eventToDelete?.title}</p>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button onClick={handleDeleteCancel} className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            {showUpdateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center overflow-y-auto">
                    <div className="bg-white p-5 rounded-lg w-full sm:w-[95%] max-w-4xl max-h-[90vh] overflow-y-auto relative">
                        <button
                            onClick={() => setShowUpdateModal(false)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
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
`;

const styleElement = document.createElement('style');
styleElement.innerHTML = responsiveStyles;
document.head.appendChild(styleElement);

export default Schedule;