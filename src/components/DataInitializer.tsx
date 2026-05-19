'use client';

import { useEffect } from 'react';
import { mockProducts, mockCreators, mockPosts, mockCategories } from '@/data/mockData';

export default function DataInitializer() {
  useEffect(() => {
    // Products
    if (!localStorage.getItem('taoyuan_products')) {
      localStorage.setItem('taoyuan_products', JSON.stringify(mockProducts));
    }
    // Posts
    if (!localStorage.getItem('taoyuan_posts')) {
      localStorage.setItem('taoyuan_posts', JSON.stringify(mockPosts));
    }
    // Categories
    if (!localStorage.getItem('taoyuan_categories')) {
      localStorage.setItem('taoyuan_categories', JSON.stringify(mockCategories));
    }
  }, []);

  return null;
}
