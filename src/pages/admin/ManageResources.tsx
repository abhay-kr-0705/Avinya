import React, { useState, useEffect } from 'react';
import { getResources, createResource, updateResource, deleteResource } from '../../services/api';
import { handleError } from '../../utils/errorHandling';
import { useAuth } from '../../contexts/AuthContext';
import { message } from 'antd';

interface Resource {
  _id: string;  
  title: string;
  description: string;
  url: string;
  type: string;
  domain?: string;
  created_at: string;
  updated_at: string;
}

const DOMAINS = [
  'Web Development',
  'AI and ML',
  'Data Science',
  'Cybersecurity',
  'Cloud Computing',
  'DevOps',
  'Blockchain',
  'UI/UX Design',
  'Competitive Programming',
  'Robotics and IoT',
  'Creativity',
  'Outreach',
  'Other'
] as const;

const ManageResources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    type: 'document',
    domain: ''
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await getResources();
      setResources(data);
    } catch (error) {
      handleError(error, 'Failed to fetch resources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingResource) {
        await updateResource(editingResource._id, form);
        message.success('Resource updated successfully');
      } else {
        await createResource(form);
        message.success('Resource created successfully');
      }
      await fetchResources();
      setForm({ title: '', description: '', url: '', type: 'document', domain: '' });
      setEditingResource(null);
    } catch (error) {
      handleError(error, editingResource ? 'Failed to update resource' : 'Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title,
      description: resource.description,
      url: resource.url,
      type: resource.type,
      domain: resource.domain || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      await deleteResource(id);
      await fetchResources();
      message.success('Resource deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete resource');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).split(',')[0]; // Only take the date part
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = !selectedDomain || resource.domain === selectedDomain;
    return matchesSearch && matchesDomain;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          {/* Loading Header */}
          <div className="flex justify-between items-center animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded"></div>
            <div className="h-10 w-32 bg-gray-200 rounded"></div>
          </div>

          {/* Loading Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Loading Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="animate-pulse">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="h-6 bg-gray-200 rounded"></div>
                ))}
              </div>

              {/* Table Rows */}
              {[...Array(5)].map((_, rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-6 gap-4 p-4 border-b">
                  {[...Array(6)].map((_, colIndex) => (
                    <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Loading Pagination */}
          <div className="flex justify-between items-center p-4 animate-pulse">
            <div className="flex space-x-2">
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <input
                type="text"
                id="description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                URL
              </label>
              <input
                type="url"
                id="url"
                value={form.url}
                onChange={e => setForm({ ...form, url: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="type"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="document">Document</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                </select>
              </div>

              <div>
                <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                  Domain (Optional)
                </label>
                <select
                  id="domain"
                  value={form.domain}
                  onChange={e => setForm({ ...form, domain: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Domain</option>
                  {DOMAINS.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {editingResource ? 'Update' : 'Add'} Resource
              </button>
              {editingResource && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingResource(null);
                    setForm({ title: '', description: '', url: '', type: 'document', domain: '' });
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search Resources
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="domainFilter" className="block text-sm font-medium text-gray-700">
                Filter by Domain
              </label>
              <select
                id="domainFilter"
                value={selectedDomain}
                onChange={e => setSelectedDomain(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Domains</option>
                {DOMAINS.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domain
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResources.map((resource) => (
                  <tr key={resource._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{resource.title}</div>
                      <div className="text-sm text-gray-500">{resource.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {resource.domain || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(resource.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(resource)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(resource._id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageResources;