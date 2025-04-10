import React, { useEffect, useState } from 'react';
import { getGalleries } from '../services/api';
import { handleError } from '../utils/errorHandling';
import { Gallery as GalleryType } from '../types/gallery';
import { Link } from 'react-router-dom';
import { Card, Image, Modal, Spin, Space, Button } from 'antd';
import { EyeOutlined, LeftOutlined, RightOutlined, SwapOutlined, RotateLeftOutlined, RotateRightOutlined, ZoomOutOutlined, ZoomInOutlined } from '@ant-design/icons';
import { useSwipeable } from 'react-swipeable';

const GalleryPage = () => {
  const [galleries, setGalleries] = useState<GalleryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGallery, setSelectedGallery] = useState<GalleryType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const data = await getGalleries();
      setGalleries(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryClick = (gallery: GalleryType) => {
    setSelectedGallery(gallery);
    setModalVisible(true);
  };

  const handlePhotoClick = (index: number) => {
    setSelectedPhotoIndex(index);
    setPreviewVisible(true);
  };

  const handlePrevPhoto = () => {
    if (selectedGallery && selectedPhotoIndex !== null) {
      const newIndex = selectedPhotoIndex === 0 
        ? selectedGallery.photos.length - 1 
        : selectedPhotoIndex - 1;
      setSelectedPhotoIndex(newIndex);
    }
  };

  const handleNextPhoto = () => {
    if (selectedGallery && selectedPhotoIndex !== null) {
      const newIndex = selectedPhotoIndex === selectedGallery.photos.length - 1 
        ? 0 
        : selectedPhotoIndex + 1;
      setSelectedPhotoIndex(newIndex);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextPhoto,
    onSwipedRight: handlePrevPhoto,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            Event Gallery
            <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our memorable moments captured through these stunning photographs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <Card
              key={gallery.id}
              hoverable
              className="overflow-hidden h-full flex flex-col gallery-card"
              cover={
                <div className="relative gallery-image-container">
                  <Image
                    src={gallery.thumbnail}
                    alt={gallery.title}
                    className="w-full object-contain"
                    preview={false}
                  />
                  <div className="gallery-overlay">
                    <EyeOutlined className="text-4xl text-white" />
                  </div>
                </div>
              }
              onClick={() => handleGalleryClick(gallery)}
            >
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{gallery.title}</h3>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">{gallery.photos.length} photos</p>
                  <div className="flex items-center text-blue-600 hover:text-blue-700">
                    <EyeOutlined className="mr-1" />
                    <span className="text-sm">View Gallery</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{gallery.description}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Gallery Modal */}
        <Modal
          title={selectedGallery?.title}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            setSelectedPhotoIndex(null);
          }}
          footer={null}
          width="80%"
        >
          {selectedGallery && (
            <div className="space-y-4">
              <p className="text-gray-600">{selectedGallery.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedGallery.photos.map((photo, index) => (
                  <div key={index} className="relative cursor-pointer" onClick={() => handlePhotoClick(index)}>
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Photo ${index + 1}`}
                      className="w-full rounded-lg"
                      preview={false}
                    />
                    {photo.caption && (
                      <p className="mt-2 text-sm text-gray-600">{photo.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>

        {/* Photo Preview */}
        <div style={{ display: 'none' }}>
          <Image.PreviewGroup
            preview={{
              visible: previewVisible,
              onVisibleChange: (vis) => setPreviewVisible(vis),
              current: selectedPhotoIndex || 0,
              countRender: (current, total) => `${current} / ${total}`,
              toolbarRender: (_, { transform: { scale }, actions: { onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn }}) => (
                <div className="ant-image-preview-operations-wrapper">
                  <div className="ant-image-preview-operations">
                    <Space size={12} className="p-2">
                      <Button type="text" className="text-white hover:text-gray-300" onClick={onFlipY}>
                        <SwapOutlined rotate={90} style={{ fontSize: '20px' }} />
                      </Button>
                      <Button type="text" className="text-white hover:text-gray-300" onClick={onFlipX}>
                        <SwapOutlined style={{ fontSize: '20px' }} />
                      </Button>
                      <Button type="text" className="text-white hover:text-gray-300" onClick={onRotateLeft}>
                        <RotateLeftOutlined style={{ fontSize: '20px' }} />
                      </Button>
                      <Button type="text" className="text-white hover:text-gray-300" onClick={onRotateRight}>
                        <RotateRightOutlined style={{ fontSize: '20px' }} />
                      </Button>
                      <Button type="text" className="text-white hover:text-gray-300" onClick={onZoomOut}>
                        <ZoomOutOutlined style={{ fontSize: '20px' }} />
                      </Button>
                      <Button type="text" className="text-white hover:text-gray-300" onClick={onZoomIn}>
                        <ZoomInOutlined style={{ fontSize: '20px' }} />
                      </Button>
                    </Space>
                  </div>
                </div>
              )
            }}
          >
            {selectedGallery?.photos.map((photo, index) => (
              <Image 
                key={index} 
                src={photo.url} 
                {...swipeHandlers}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') handlePrevPhoto();
                  if (e.key === 'ArrowRight') handleNextPhoto();
                }}
              />
            ))}
          </Image.PreviewGroup>
        </div>

        {/* Custom Navigation Buttons - Only visible on desktop */}
        {previewVisible && (
          <style jsx global>{`
            .ant-image-preview-operations {
              background: rgba(0, 0, 0, 0.5) !important;
            }
            .ant-image-preview-switch-left,
            .ant-image-preview-switch-right {
              display: none !important;
            }
            @media (min-width: 768px) {
              .custom-nav-button {
                display: block !important;
              }
            }
          `}</style>
        )}
        {previewVisible && (
          <>
            <button
              className="custom-nav-button fixed z-[1001] left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all hidden"
              onClick={handlePrevPhoto}
            >
              <LeftOutlined className="text-xl" />
            </button>
            <button
              className="custom-nav-button fixed z-[1001] right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all hidden"
              onClick={handleNextPhoto}
            >
              <RightOutlined className="text-xl" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;