import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Resource } from '../types/resource';

interface ResourceSearchProps {
  resources: Resource[];
  onFilterChange: (filtered: Resource[]) => void;
}

export const ResourceSearch: React.FC<ResourceSearchProps> = ({ resources, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    dateRange: '',
    contentType: ''
  });

  useEffect(() => {
    const filtered = resources.filter(resource => {
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filters.category || resource.category === filters.category;
      const matchesDate = !filters.dateRange || filterByDate(resource.created_at, filters.dateRange);

      return matchesSearch && matchesCategory && matchesDate;
    });

    onFilterChange(filtered);
  }, [searchTerm, filters, resources]);

  const filterByDate = (date: string, range: string) => {
    const resourceDate = new Date(date);
    const now = new Date();
    
    switch (range) {
      case 'week':
        return resourceDate >= new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return resourceDate >= new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return resourceDate >= new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return true;
    }
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setFilters({ category: '', dateRange: '', contentType: '' })}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          Clear Filters
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="App Development">App Development</option>
          <option value="AI & ML">AI & ML</option>
          <option value="Robotics & IoT">Robotics & IoT</option>
          <option value="Cybersecurity">Cybersecurity</option>
        </select>

        <select
          value={filters.dateRange}
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
          className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Time</option>
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="year">Past Year</option>
        </select>
      </div>
    </div>
  );
};