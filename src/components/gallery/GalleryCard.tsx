import React from 'react';
import { Link } from 'react-router-dom';
import { Gallery } from '../../types/gallery';
import web_thumbnail from './Web_Thumbnail.jpg';

interface GalleryCardProps {
  gallery: Gallery;
}

const GalleryCard: React.FC<GalleryCardProps> = ({ gallery }) => {
  return (
    <Link to={`/gallery/${gallery.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 overflow-hidden">
          <img
            src={gallery.thumbnail_url || 'https://images.unsplakjkjsh.com/photo-1516542076529-1ea3854896f2'}
            alt={gallery.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{gallery.title}</h3>
          <p className="text-gray-600 mb-2">{gallery.description}</p>
          <p className="text-sm text-gray-500">{gallery.photo_count} photos</p>
        </div>
      </div>
    </Link>
  );
};

export default GalleryCard;