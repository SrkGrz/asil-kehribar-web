import React, { useState } from 'react';
import { BlogPost } from '../types';

interface BlogProps {
  blogPosts: BlogPost[];
}

export const Blog: React.FC<BlogProps> = ({ blogPosts }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const handleClose = () => setSelectedPost(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 lg:py-24">
      <div className="mb-20">
        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Saray Günlükleri</span>
        <h1 className="text-5xl md:text-8xl font-display font-black italic mb-6">Blog</h1>
        <p className="text-xl text-stone-500 font-light max-w-2xl leading-relaxed">Kehribarın gizemli dünyasına adım atın. Doğanın bu eşsiz mucizesi hakkında bilmeniz gereken her şey burada.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
        {blogPosts && Array.isArray(blogPosts) && blogPosts.map(post => (
          <div key={post.id} className="group cursor-pointer flex flex-col" onClick={() => setSelectedPost(post)}>
            <div className="aspect-[4/3] rounded-3xl overflow-hidden mb-6">
              <img src={post.image} alt={post.title} className="size-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">{post.date}</span>
            </div>
            <h3 className="text-2xl font-display font-black italic mb-4 group-hover:text-primary transition-colors">{post.title}</h3>
            <p className="text-stone-500 leading-relaxed mb-6 flex-1">{post.excerpt}</p>
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-black uppercase tracking-widest text-stone-950 dark:text-white flex items-center gap-2 group-hover:text-primary transition-colors">
                DEVAMINI OKU <span className="material-symbols-outlined text-sm group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm" onClick={handleClose}>
          <div
            className="bg-white dark:bg-stone-950 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl custom-scrollbar relative mx-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 size-10 flex items-center justify-center bg-white/80 dark:bg-zinc-800/80 backdrop-blur rounded-full hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors z-10 text-stone-950 dark:text-white shadow-lg"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="aspect-[21/9] w-full relative">
              <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent"></div>
              <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 pr-6">
                <span className="inline-block text-[10px] sm:text-xs font-black uppercase tracking-widest text-stone-950 bg-primary px-3 py-1 rounded-full mb-3 sm:mb-5 drop-shadow-md">{selectedPost.date}</span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black italic text-white drop-shadow-lg leading-tight">{selectedPost.title}</h2>
              </div>
            </div>
            <div className="p-6 md:p-12">
              <div className="prose dark:prose-invert max-w-none text-lg text-stone-600 dark:text-stone-300 font-medium leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
