/**
 * Book Context for AIPhDWriter
 * Manages global state for book creation flow
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BookFormData,
  AudienceType,
  LengthType,
  StyleType,
  BookOutline,
  PreviewResponse,
  Book,
} from '../types';

interface BookContextType {
  // Form data
  formData: BookFormData;
  updateFormData: (data: Partial<BookFormData>) => void;
  resetFormData: () => void;

  // Current book being generated
  currentBookId: string | null;
  setCurrentBookId: (id: string | null) => void;

  // Preview data
  previewData: PreviewResponse | null;
  setPreviewData: (data: PreviewResponse | null) => void;

  // Selected add-ons
  selectedAddOns: string[];
  toggleAddOn: (id: string) => void;

  // User's email (persisted)
  userEmail: string;
  setUserEmail: (email: string) => void;

  // My books
  myBooks: Book[];
  addBook: (book: Book) => void;
  updateBook: (bookId: string, updates: Partial<Book>) => void;
  loadMyBooks: () => Promise<void>;
}

const defaultFormData: BookFormData = {
  topic: '',
  audience: 'general',
  length: 'standard',
  style: 'conversational',
  userEmail: '',
};

const BookContext = createContext<BookContextType | undefined>(undefined);

export function BookProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<BookFormData>(defaultFormData);
  const [currentBookId, setCurrentBookId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [userEmail, setUserEmailState] = useState<string>('');
  const [myBooks, setMyBooks] = useState<Book[]>([]);

  const updateFormData = (data: Partial<BookFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(defaultFormData);
    setCurrentBookId(null);
    setPreviewData(null);
    setSelectedAddOns([]);
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const setUserEmail = async (email: string) => {
    setUserEmailState(email);
    setFormData((prev) => ({ ...prev, userEmail: email }));
    try {
      await AsyncStorage.setItem('userEmail', email);
    } catch (error) {
      console.error('Failed to save email:', error);
    }
  };

  const loadMyBooks = async () => {
    try {
      const stored = await AsyncStorage.getItem('myBooks');
      if (stored) {
        setMyBooks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load books:', error);
    }
  };

  const addBook = async (book: Book) => {
    const updated = [book, ...myBooks];
    setMyBooks(updated);
    try {
      await AsyncStorage.setItem('myBooks', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save book:', error);
    }
  };

  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    const updated = myBooks.map((b) =>
      b.book_id === bookId ? { ...b, ...updates } : b
    );
    setMyBooks(updated);
    try {
      await AsyncStorage.setItem('myBooks', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update book:', error);
    }
  };

  return (
    <BookContext.Provider
      value={{
        formData,
        updateFormData,
        resetFormData,
        currentBookId,
        setCurrentBookId,
        previewData,
        setPreviewData,
        selectedAddOns,
        toggleAddOn,
        userEmail,
        setUserEmail,
        myBooks,
        addBook,
        updateBook,
        loadMyBooks,
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBook() {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBook must be used within a BookProvider');
  }
  return context;
}
