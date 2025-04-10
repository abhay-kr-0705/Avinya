import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  path: string;
  label: string;
}

const getBreadcrumbs = (pathname: string): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean);
  return paths.map((path, index) => ({
    path: '/' + paths.slice(0, index + 1).join('/'),
    label: path.charAt(0).toUpperCase() + path.slice(1)
  }));
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);

  if (breadcrumbs.length === 0) return null;

  return (
    <div className="flex items-center text-sm text-gray-500 py-2 px-4">
      <a href="/" className="hover:text-blue-600">Home</a>
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          <ChevronRight className="w-4 h-4 mx-2" />
          <a 
            href={crumb.path}
            className={`${
              index === breadcrumbs.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'hover:text-blue-600'
            }`}
          >
            {crumb.label}
          </a>
        </React.Fragment>
      ))}
    </div>
  );
};