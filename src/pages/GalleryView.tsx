import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGalleryPhotos } from '../services/api';
import { handleError } from '../utils/errorHandling';

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  created_at: string;
}

const GalleryView = () => {
  const { id } = useParams<{ id: string }>();
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchGalleryPhotos();
    }
  }, [id]);

  const fetchGalleryPhotos = async () => {
    try {
      const data = await getGalleryPhotos();
      const galleryPhotos = data.filter(photo => photo.gallery_id === id);
      setPhotos(galleryPhotos);
    } catch (error) {
      handleError(error, 'Failed to fetch gallery photos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading photos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img
                src={photo.url}
                alt={photo.caption}
                className="w-full h-64 object-cover"
              />
              {photo.caption && (
                <div className="p-4">
                  <p className="text-gray-600">{photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {photos.length === 0 && (
          <div className="text-center text-gray-600">
            No photos available in this gallery.
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;