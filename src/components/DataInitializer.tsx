'use client';

import { useEffect } from 'react';
import { mockProducts, mockCreators, mockPosts, mockCategories } from '@/data/mockData';

export default function DataInitializer() {
  useEffect(() => {
    // Always refresh with latest mock data for demo purposes
    localStorage.setItem('taoyuan_products', JSON.stringify(mockProducts));
    if (!localStorage.getItem('taoyuan_posts')) {
      localStorage.setItem('taoyuan_posts', JSON.stringify(mockPosts));
    }
    if (!localStorage.getItem('taoyuan_categories')) {
      localStorage.setItem('taoyuan_categories', JSON.stringify(mockCategories));
    }
  }, []);

  return null;
}
