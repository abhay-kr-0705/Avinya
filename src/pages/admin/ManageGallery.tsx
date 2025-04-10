import React, { useState, useEffect } from 'react';
import { 
  getGalleries, 
  createGallery, 
  updateGallery, 
  deleteGallery, 
  uploadImage,
  removeGalleryPhoto,
  updateGalleryPhotos,
  updateGalleryThumbnail
} from '../../services/api';
import { handleError } from '../../utils/errorHandling';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card, Image, Modal, message, Upload } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

interface Photo {
  _id: string;
  url: string;
  caption?: string;
}

interface Gallery {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  photos: Photo[];
}

const { confirm } = Modal;

const ManageGallery = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const data = await getGalleries();
      setGalleries(data);
      setLoading(false);
    } catch (error) {
      handleError(error, 'Failed to fetch galleries');
      setLoading(false);
    }
  };

  const handleEdit = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setEditModalVisible(true);
  };

  const showDeleteConfirm = (galleryId: string) => {
    confirm({
      title: 'Are you sure you want to delete this gallery?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        return new Promise((resolve, reject) => {
          confirm({
            title: 'Please confirm again',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you absolutely sure? All photos will be permanently deleted.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
              handleDelete(galleryId)
                .then(resolve)
                .catch(reject);
            },
            onCancel() {
              resolve(null);
            },
          });
        });
      },
    });
  };

  const handleDelete = async (galleryId: string) => {
    try {
      await deleteGallery(galleryId);
      message.success('Gallery deleted successfully');
      fetchGalleries();
    } catch (error) {
      handleError(error, 'Failed to delete gallery');
    }
  };

  const handlePhotoDelete = (photoId: string) => {
    if (!selectedGallery) return;
    
    confirm({
      title: 'Are you sure you want to remove this photo?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: async () => {
        try {
          console.log('Deleting photo:', { galleryId: selectedGallery._id, photoId });
          await removeGalleryPhoto(selectedGallery._id, photoId);
          
          // Update local state
          const updatedGalleries = galleries.map(g => {
            if (g._id === selectedGallery._id) {
              return {
                ...g,
                photos: g.photos.filter(p => p._id !== photoId)
              };
            }
            return g;
          });
          
          setGalleries(updatedGalleries);
          setSelectedGallery(prev => prev ? {
            ...prev,
            photos: prev.photos.filter(p => p._id !== photoId)
          } : null);
          
          message.success('Photo removed successfully');
        } catch (error) {
          handleError(error, 'Failed to remove photo');
        }
      },
    });
  };

  const handleUpload = async () => {
    if (!selectedGallery || fileList.length === 0) return;

    const formData = new FormData();
    fileList.forEach(file => {
      formData.append('photos', file);
    });

    try {
      const updatedGallery = await updateGalleryPhotos(selectedGallery._id, formData);
      setSelectedGallery(updatedGallery);
      setFileList([]);
      message.success('Photos uploaded successfully');
      fetchGalleries();
    } catch (error) {
      handleError(error, 'Failed to upload photos');
    }
  };

  const handleThumbnailUpload = async () => {
    if (!selectedGallery || !thumbnailFile) return;

    const formData = new FormData();
    formData.append('thumbnail', thumbnailFile);

    try {
      const updatedGallery = await updateGalleryThumbnail(selectedGallery._id, formData);
      setSelectedGallery(updatedGallery);
      setThumbnailFile(null);
      message.success('Thumbnail updated successfully');
      fetchGalleries();
    } catch (error) {
      handleError(error, 'Failed to update thumbnail');
    }
  };

  const handleCreateGallery = async () => {
    if (!form.title || !thumbnailFile) {
      message.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      if (form.description) {
        formData.append('description', form.description);
      }
      formData.append('thumbnail', thumbnailFile);
      
      if (fileList.length > 0) {
        fileList.forEach(file => {
          formData.append('photos', file);
        });
      }

      const newGallery = await createGallery(formData);
      setGalleries(prev => [...prev, newGallery]);
      setModalVisible(false);
      setForm({ title: '', description: '' });
      setThumbnailFile(null);
      setFileList([]);
      message.success('Gallery created successfully');
    } catch (error) {
      console.error('Error creating gallery:', error);
      message.error('Failed to create gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Gallery</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Add New Gallery
        </Button>
      </div>

      <Modal
        title="Add New Gallery"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setForm({ title: '', description: '' });
          setThumbnailFile(null);
          setFileList([]);
        }}
        footer={null}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <Input
              placeholder="Gallery Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <Input.TextArea
              placeholder="Gallery Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
            <Upload
              beforeUpload={(file) => {
                setThumbnailFile(file);
                return false;
              }}
              maxCount={1}
              fileList={thumbnailFile ? [thumbnailFile] : []}
              onRemove={() => setThumbnailFile(null)}
            >
              <Button icon={<PlusOutlined />}>Select Thumbnail</Button>
            </Upload>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Photos</label>
            <Upload
              beforeUpload={(file) => {
                setFileList(prev => [...prev, file]);
                return false;
              }}
              fileList={fileList}
              multiple
              onRemove={(file) => {
                setFileList(prev => prev.filter(f => f.uid !== file.uid));
              }}
            >
              <Button icon={<PlusOutlined />}>Select Photos</Button>
            </Upload>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button onClick={() => {
              setModalVisible(false);
              setForm({ title: '', description: '' });
              setThumbnailFile(null);
              setFileList([]);
            }}>
              Cancel
            </Button>
            <Button
              type="primary"
              onClick={handleCreateGallery}
              loading={loading}
              disabled={!form.title || !thumbnailFile}
            >
              Create Gallery
            </Button>
          </div>
        </div>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map(gallery => (
          <Card
            key={gallery._id}
            cover={
              <div className="relative h-48">
                <img
                  alt={gallery.title}
                  src={gallery.thumbnail}
                  className="w-full h-full object-cover"
                />
              </div>
            }
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(gallery)}
              >
                Edit
              </Button>,
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(gallery._id)}
              >
                Delete
              </Button>
            ]}
          >
            <Card.Meta
              title={gallery.title}
              description={gallery.description}
            />
            <p className="text-sm text-gray-500 mt-2">
              Photos: {gallery.photos.length}
            </p>
          </Card>
        ))}
      </div>

      <Modal
        title="Edit Gallery"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedGallery && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Update Thumbnail</h3>
              <Upload
                beforeUpload={(file) => {
                  setThumbnailFile(file);
                  return false;
                }}
                maxCount={1}
              >
                <Button icon={<PlusOutlined />}>Select New Thumbnail</Button>
              </Upload>
              {thumbnailFile && (
                <Button
                  type="primary"
                  onClick={handleThumbnailUpload}
                  className="mt-2"
                >
                  Upload Thumbnail
                </Button>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Add Photos</h3>
              <Upload
                beforeUpload={(file) => {
                  setFileList(prev => [...prev, file]);
                  return false;
                }}
                fileList={fileList}
                multiple
              >
                <Button icon={<PlusOutlined />}>Select Photos</Button>
              </Upload>
              {fileList.length > 0 && (
                <Button
                  type="primary"
                  onClick={handleUpload}
                  className="mt-2"
                >
                  Upload Photos
                </Button>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Current Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedGallery.photos.map((photo) => (
                  <div key={photo._id} className="relative group">
                    <Image
                      src={photo.url}
                      alt="Gallery photo"
                      className="w-full h-32 object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        danger
                        onClick={() => handlePhotoDelete(photo._id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageGallery;