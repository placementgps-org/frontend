import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Loader2, BookOpen } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CourseCard from '../../components/courses/CourseCard';
import { courseService } from '../../services/courseService';

export default function FreeCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchCourses = useCallback(async (isNewSearch = false) => {
    if (isNewSearch) {
      setLoading(true);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await courseService.getCourses({
        page: isNewSearch ? 1 : page,
        limit: 12,
        search,
        category,
        difficulty
      });

      if (data.success) {
        if (isNewSearch) {
          setCourses(data.data);
        } else {
          setCourses(prev => [...prev, ...data.data]);
        }
        setTotalPages(data.pages);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to the server');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, search, category, difficulty]);

  useEffect(() => {
    // Debounce search and filter changes
    const timer = setTimeout(() => {
      fetchCourses(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, category, difficulty, fetchCourses]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (page > 1) {
      fetchCourses(false);
    }
  }, [page, fetchCourses]);

  return (
    <div className="min-h-screen bg-[#05070F] text-white selection:bg-[#2F80FF] selection:text-white font-sans antialiased overflow-x-hidden flex flex-col">
      <Navbar onOpenLogin={() => {}} isAuthPage={false} />
      
      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:text-left"
        >
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2F80FF]/20 to-[#1D5BD8]/20 flex items-center justify-center border border-[#2F80FF]/30">
              <BookOpen className="text-[#4FA3FF]" size={20} />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight gradient-heading">
              Free Courses
            </h1>
          </div>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
            Find free courses from top providers to build the skills you need for your dream career. Search by skill, category, or difficulty.
          </p>
        </motion.div>

        {/* Search & Filters */}
        <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 sm:p-6 mb-10 shadow-lg shadow-black/20 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses, skills, providers..."
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-[#2F80FF] focus:ring-1 focus:ring-[#2F80FF] transition-all text-white placeholder-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 md:w-auto">
              <div className="relative min-w-[160px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter size={16} className="text-slate-400" />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-[#2F80FF] transition-all text-white appearance-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Computer Science & IT">Computer Science & IT</option>
                  <option value="Data Science, AI & Machine Learning">Data Science & AI</option>
                  <option value="Commerce, Business & Finance">Business & Finance</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Science (Physics, Chemistry, Biology)">Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Marketing & Digital Skills">Marketing</option>
                </select>
              </div>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full sm:w-[140px] px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-[#2F80FF] transition-all text-white appearance-none cursor-pointer"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 min-h-[300px]">
            <Loader2 className="w-10 h-10 text-[#2F80FF] animate-spin mb-4" />
            <p className="text-slate-400 text-sm animate-pulse">Searching for best courses...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center text-red-400">
            <p className="font-medium">{error}</p>
            <button onClick={() => fetchCourses(true)} className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors">
              Try Again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/30 rounded-2xl border border-slate-800/40 border-dashed">
            <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No courses found</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              We couldn't find any courses matching your current filters. Try adjusting your search term, category, or difficulty.
            </p>
            {(search || category || difficulty) && (
              <button 
                onClick={() => { setSearch(''); setCategory(''); setDifficulty(''); }}
                className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
            
            {page < totalPages && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-sm transition-all border border-slate-700 flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    'Load More Courses'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
