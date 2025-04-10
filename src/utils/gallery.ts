import { Gallery, GalleryResponse } from '../types/gallery';
import { getGalleryPhotos } from '../services/api';

export const transformGalleryData = async (galleries: GalleryResponse[]): Promise<Gallery[]> => {
  try {
    const photos = await getGalleryPhotos();
    
    return galleries.map((gallery) => {
      const galleryPhotos = photos.filter((photo) => photo.gallery_id === gallery.id);
      const thumbnailUrl = galleryPhotos.length > 0 ? galleryPhotos[0].url : null;

      return {
        ...gallery,
        photos: galleryPhotos,
        thumbnail_url: thumbnailUrl
      };
    });
  } catch (error) {
    console.error('Error transforming gallery data:', error);
    return galleries.map(gallery => ({
      ...gallery,
      photos: [],
      thumbnail_url: null
    }));
  }
};