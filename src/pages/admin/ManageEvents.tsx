import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/api';
import { handleError } from '../../utils/errorHandling';
import { Plus, Edit, Trash2, Calendar, MapPin, User, Users, DollarSign, Upload, Image, X, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  end_date: string;
  venue: string;
  type: 'upcoming' | 'past' | string;
  eventType?: 'individual' | 'group' | string;
  fee?: number;
  maxTeamSize?: number;
  thumbnail?: string;
}

const ManageEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  
  const [form, setForm] = useState<{
    title: string;
    description: string;
    date: string;
    end_date: string;
    venue: string;
    eventType: 'individual' | 'group' | string;
    fee: string;
    maxTeamSize: string;
    thumbnail: string;
  }>({
    title: '',
    description: '',
    date: '',
    end_date: '',
    venue: '',
    eventType: 'individual',
    fee: '',
    maxTeamSize: '',
    thumbnail: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (currentEvent) {
      setForm({
        title: currentEvent.title,
        description: currentEvent.description,
        date: currentEvent.date.slice(0, 16), // Format for datetime-local input
        end_date: currentEvent.end_date.slice(0, 16), // Format for datetime-local input
        venue: currentEvent.venue,
        eventType: currentEvent.eventType || 'individual',
        fee: currentEvent.fee?.toString() || '',
        maxTeamSize: currentEvent.maxTeamSize?.toString() || '',
        thumbnail: currentEvent.thumbnail || ''
      });
      
      setThumbnailPreview(currentEvent.thumbnail || null);
    } else {
      resetForm();
    }
  }, [currentEvent]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      
      // Sort events: upcoming first, then by date
      const sortedEvents = data.sort((a: Event, b: Event) => {
        // First sort by type (upcoming before past)
        if (a.type === 'upcoming' && b.type === 'past') return -1;
        if (a.type === 'past' && b.type === 'upcoming') return 1;
        
        // Then sort by date (most recent first)
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setEvents(sortedEvents);
    } catch (error) {
      handleError(error, 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      date: '',
      end_date: '',
      venue: '',
      eventType: 'individual',
      fee: '',
      maxTeamSize: '',
      thumbnail: ''
    });
    setThumbnailPreview(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    // Validate file size
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('File is too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please use JPG, PNG, or GIF images.');
      e.target.value = '';
      return;
    }
    
    // This would normally upload to server and get back a URL
    try {
      setUploadingThumbnail(true);
      
      // Initial compression options - reduce maxSizeMB to prevent 413 errors
      let options = {
        maxSizeMB: 0.2, // Further reduce maximum size to 0.2MB
        maxWidthOrHeight: 800, // Reduced from 1000px to 800px
        useWebWorker: true,
        initialQuality: 0.6, // Reduced from 0.7 to 0.6
      };
      
      // Compress the image
      let compressedFile = await imageCompression(file, options);
      
      // If still too large, compress further for very large images
      if (compressedFile.size > 200000) { // Reduced threshold to 200KB
        options = {
          ...options,
          maxSizeMB: 0.1, // Further reduced to 0.1MB
          maxWidthOrHeight: 600, // Reduced to 600px
          initialQuality: 0.5, // Reduced quality
        };
        compressedFile = await imageCompression(compressedFile, options);
        
        // Final resort for large images
        if (compressedFile.size > 100000) {
          const extremeOptions = {
            maxSizeMB: 0.05, // Extreme compression
            maxWidthOrHeight: 400, // Very small image
            initialQuality: 0.4, // Lower quality
            useWebWorker: true
          };
          compressedFile = await imageCompression(compressedFile, extremeOptions);
        }
      }
      
      const originalSizeMB = file.size / 1024 / 1024;
      const compressedSizeMB = compressedFile.size / 1024 / 1024;
      console.log('Original file size:', originalSizeMB.toFixed(2), 'MB');
      console.log('Compressed file size:', compressedSizeMB.toFixed(2), 'MB');
      
      // Create a base64 URL from the compressed file
      const fileReader = new FileReader();
      fileReader.readAsDataURL(compressedFile);
      fileReader.onload = () => {
        try {
          const base64 = fileReader.result as string;
          console.log('Compressed image size:', base64.length);
          console.log('Base64 preview:', base64.substring(0, 50) + '...');
          
          // If the base64 string is too large (over 1MB), provide a warning
          if (base64.length > 1000000) {
            console.warn('WARNING: Base64 image is still large:', Math.round(base64.length / 1024), 'KB');
            
            // Further reduce quality if still too large
            if (compressedFile.size > 300000) {
              toast.error('Image is still quite large. It may not upload correctly. Consider using a smaller image.');
            }
          }
          
          // Set the compressed image as the thumbnail
          setForm(prev => ({ ...prev, thumbnail: base64 }));
          // Update the preview
          setThumbnailPreview(base64);
          setUploadingThumbnail(false);
          
          // Show compression stats in toast message
          const compressionPercent = ((1 - (compressedFile.size / file.size)) * 100).toFixed(0);
          toast.success(
            `Image compressed by ${compressionPercent}% (${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB)`
          );
        } catch (err) {
          console.error('Error processing compressed image:', err);
          setUploadingThumbnail(false);
          toast.error('Failed to process the image. Please try a different image or smaller size.');
        }
      };
      
    } catch (error) {
      setUploadingThumbnail(false);
      handleError(error, 'Failed to process thumbnail');
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeThumbnail = () => {
    setThumbnailPreview(null);
    setForm(prev => ({ ...prev, thumbnail: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Basic validation
      if (!form.title || !form.description || !form.date || !form.venue) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Validate fee is a number if provided
      let fee = 0;
      if (form.fee) {
        fee = parseFloat(form.fee);
        if (isNaN(fee)) {
          toast.error('Fee must be a valid number');
          return;
        }
        if (fee < 0) {
          toast.error('Fee cannot be negative');
          return;
        }
      }
      
      // Validate maxTeamSize is a positive integer if provided and eventType is group
      let maxTeamSize = undefined;
      if (form.eventType === 'group' && form.maxTeamSize) {
        maxTeamSize = parseInt(form.maxTeamSize, 10);
        if (isNaN(maxTeamSize) || maxTeamSize <= 0) {
          toast.error('Team size must be a positive number');
          return;
        }
      }
      
      // Process thumbnail
      let thumbnail = '';
      if (form.thumbnail) {
        thumbnail = form.thumbnail.trim();
        // Check if it's a valid URL or base64
        if (!thumbnail.startsWith('http://') && 
            !thumbnail.startsWith('https://') && 
            !thumbnail.startsWith('data:image/')) {
          if (!thumbnail.startsWith('data:')) {
            toast.error('Thumbnail URL doesn\'t seem to be valid. It should start with http:// or https://');
            // Continue anyway but log the warning
            console.warn('Invalid thumbnail format but continuing:', thumbnail.substring(0, 30) + '...');
          }
        }
      }
      
      // Create the event object with proper type coercion
      const eventData = {
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        end_date: form.end_date || form.date,
        venue: form.venue.trim(),
        eventType: form.eventType, // Explicitly set eventType
        fee: fee, // Use the validated fee value
        maxTeamSize: form.eventType === 'group' ? maxTeamSize : undefined,
        thumbnail: thumbnail || undefined,
        type: (new Date(form.date) > new Date() ? 'upcoming' : 'past') as 'upcoming' | 'past'
      };
      
      // Log what's being sent to API for debugging
      console.log('Submitting event data:', JSON.stringify(eventData, null, 2));
      
      let result;
      if (currentEvent) {
        result = await updateEvent(currentEvent.id, eventData);
        console.log('Updated event result:', result);
        toast.success('Event updated successfully');
      } else {
        result = await createEvent(eventData);
        console.log('Created event result:', result);
        toast.success('Event created successfully');
      }
      
      // Refresh the events list and close the modal
      fetchEvents();
      setShowModal(false);
      resetForm();
    } catch (error) {
      handleError(error, currentEvent ? 'Failed to update event' : 'Failed to create event');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      handleError(error, 'Failed to delete event');
    }
  };

    return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Events</h1>
        <button
          onClick={() => {
            setCurrentEvent(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus size={20} />
          <span>Add Event</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-xl text-gray-300 mb-4">No events found</p>
          <p className="text-gray-400">Click the "Add Event" button to create your first event.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="glass-card hover:shadow-lg transition-shadow relative">
              {/* Event type badge */}
              <div className="absolute top-3 left-3 z-10">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase 
                  ${event.eventType === 'group' || event.eventType === 'team' ? 'bg-secondary-500' : 'bg-primary-500'} 
                  text-white`}
                >
                  {event.eventType === 'group' || event.eventType === 'team' ? (
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      Team
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      Individual
                    </span>
                  )}
                </div>
              </div>
              
              {/* Admin actions */}
              <div className="absolute top-3 right-3 flex space-x-2">
                <button
                  onClick={() => {
                    setCurrentEvent(event);
                    setShowModal(true);
                  }}
                  className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Edit event"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  title="Delete event"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              {/* Thumbnail with fallback */}
              <div className="h-48 overflow-hidden bg-gradient-to-r from-primary-100/10 to-secondary-100/10">
                {event.thumbnail ? (
                  <img 
                    src={event.thumbnail} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, replace with placeholder
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'h-full w-full flex items-center justify-center';
                        fallback.innerHTML = `
                          <div class="text-4xl font-bold text-primary-500/20">
                            ${event.title.charAt(0).toUpperCase()}
                          </div>
                        `;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="text-4xl font-bold text-primary-500/20">
                      {event.title.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2 pr-20">{event.title}</h3>
                
                <div className="flex items-center text-sm text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 mr-2 text-primary-400" />
                  <span>
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric' 
                    })}
                    {' - '}
                    {new Date(event.end_date).toLocaleDateString('en-US', { 
                      day: 'numeric', 
                      month: 'short',
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-300 mb-4">
                  <MapPin className="h-4 w-4 mr-2 text-primary-400" />
                  <span>{event.venue}</span>
                </div>
                
                {/* Fee information */}
                <div className="flex items-center text-sm text-gray-300 mb-4">
                  <DollarSign className="h-4 w-4 mr-2 text-primary-400" />
                  {typeof event.fee === 'number' && event.fee > 0 ? (
                    <span>₹{event.fee} {event.eventType === 'group' || event.eventType === 'team' ? 'per team' : 'per person'}</span>
                  ) : (
                    <span className="text-green-400">Free Event</span>
                  )}
                </div>
                
                <p className="text-gray-300 mb-4 line-clamp-3">{event.description}</p>
                
                <div className="flex justify-end">
                  <Link
                    to={`/admin/events/${event.id}/registrations`}
                    className="secondary-button text-xs px-3 py-1 inline-flex items-center"
                  >
                    View Registrations
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {currentEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Start Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={form.end_date}
                    onChange={handleChange}
                    className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  name="venue"
                  value={form.venue}
                  onChange={handleChange}
                  className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={form.eventType}
                    onChange={handleChange}
                    className="w-full bg-dark-700 border border-dark-500 text-gray-300 rounded px-3 py-2 focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="individual">Individual Event</option>
                    <option value="group">Group/Team Event</option>
                  </select>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Registration Fee (₹)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name="fee"
                      value={form.fee}
                      onChange={handleChange}
                      placeholder="0 for free event"
                      min="0"
                      step="1"
                      className="w-full bg-dark-700 border border-dark-500 text-gray-300 rounded pl-7 px-3 py-2 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Leave empty or set to 0 for free events</p>
                </div>
                
                {form.eventType === 'group' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Maximum Team Size
                    </label>
                    <input
                      type="number"
                      name="maxTeamSize"
                      value={form.maxTeamSize}
                      onChange={handleChange}
                      className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="Optional"
                      min="2"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Event Image
                </label>
                <div className="mt-1 flex items-center space-x-4">
                  {thumbnailPreview ? (
                    <div className="relative rounded-md overflow-hidden w-32 h-32 bg-dark-700">
                      <img 
                        src={thumbnailPreview} 
                        alt="Thumbnail preview" 
                        className="w-full h-full object-cover"
                      />
                      <button 
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                        title="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-600 w-32 h-32 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Image className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-400">Click to upload</span>
                      </div>
                    </button>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">
                      Upload an event image (recommended size: 800 x 400 pixels)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supports JPG, PNG or GIF (max 5MB before compression)
                    </p>
                    <p className="text-xs text-amber-500 mt-1 font-medium">
                      Important: The server has a strict 1MB upload limit. Images will be automatically compressed, but very large images may still be rejected.
                    </p>
                    
                    {uploadingThumbnail && (
                      <div className="mt-2 flex items-center">
                        <div className="mr-2 animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary-400"></div>
                        <span className="text-xs text-gray-400">Compressing and uploading...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-1">
                  Thumbnail URL (Optional)
                </label>
                <input
                  type="text"
                  name="thumbnail"
                  value={form.thumbnail}
                  onChange={handleChange}
                  className="w-full rounded-md bg-dark-700 border-dark-600 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can either upload an image above or provide a URL directly
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCurrentEvent(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-dark-700 text-white rounded-md hover:bg-dark-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                >
                  {currentEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageEvents;