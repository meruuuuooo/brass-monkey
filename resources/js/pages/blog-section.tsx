import { Link, router } from '@inertiajs/react';
import {
    Search, Calendar, User, Eye, Tag, FileText,
    ArrowRight, ArrowUp, Facebook, ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
}

interface BlogTag {
    id: number;
    name: string;
    slug: string;
    posts_count: number;
}

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_path: string | null;
    published_at: string;
    view_count: number;
    author: { name: string };
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    is_featured: boolean;
}

interface PaginatedPosts {
    data: BlogPost[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    posts: PaginatedPosts;
    categories: BlogCategory[];
    tags: BlogTag[];
    filters: {
        category?: string;
        tag?: string;
        search?: string;
    };
}

export default function BlogSection({ posts, categories, tags, filters }: Props) {
    const [search, setSearch] = useState(filters?.search || '');
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                router.get('/', { ...filters, search }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search, filters]);

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 500);
        };
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFilter = (type: 'category' | 'tag', slug: string) => {
        const newFilters = { ...filters };

        if (newFilters[type] === slug) {
            delete newFilters[type];
        } else {
            newFilters[type] = slug;
        }

        router.get('/', newFilters as any, { preserveScroll: true, preserveState: true });
    };

    const clearFilters = () => {
        router.get('/', {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <section id="blogs" className="bg-bm-dark py-32 border-t border-bm-border/5 relative overflow-hidden">

            <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16 relative">
                    <div className="mb-6 inline-flex items-center rounded-full border border-bm-gold/30 bg-bm-gold/5 px-4 py-1.5 backdrop-blur-sm">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bm-gold">Insights & Guides</span>
                    </div>
                    <h1 className="font-serif text-5xl font-bold tracking-tight mb-6">Our Latest Articles</h1>
                    <p className="text-lg font-medium leading-relaxed text-bm-muted/90">Expert repair tips, local news, promotions, and stories from the shop floor.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Filters */}
                    <div className="space-y-10 lg:sticky lg:top-32 lg:h-max">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-bm-muted" />
                            <input
                                type="text"
                                placeholder="Search articles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 h-12 rounded-xl border border-bm-white/10 bg-bm-white/5 text-sm text-bm-white placeholder:text-bm-muted focus:outline-none focus:border-bm-gold focus:ring-1 focus:ring-bm-gold transition-all"
                            />
                        </div>

                        {(filters?.category || filters?.tag || filters?.search) && (
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-bm-muted uppercase tracking-widest">Active Filters</span>
                                <button onClick={clearFilters} className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition-colors cursor-pointer">Clear All</button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-[0.2em] text-[11px] text-bm-gold">Categories</h3>
                            {(categories && categories.length > 0) ? (
                                <div className="flex flex-col gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleFilter('category', cat.slug)}
                                            className={`cursor-pointer flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-all border ${filters?.category === cat.slug
                                                ? 'bg-bm-gold/10 border-bm-gold/30 text-bm-gold shadow-sm'
                                                : 'bg-bm-white/5 border-bm-white/10 text-bm-muted hover:bg-bm-white/10 hover:text-bm-white hover:border-bm-white/20'
                                                }`}
                                        >
                                            <span className="font-bold">{cat.name}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${filters?.category === cat.slug ? 'bg-bm-gold/20 text-bm-gold' : 'bg-bm-white/10 text-bm-muted'}`}>
                                                {cat.posts_count}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm font-medium text-bm-muted/50 py-2 border border-bm-white/5 border-dashed rounded-lg text-center bg-bm-white/5">No categories found</div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-[0.2em] text-[11px] text-bm-gold">Popular Tags</h3>
                            {(tags && tags.length > 0) ? (
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <button
                                            key={tag.id}
                                            onClick={() => handleFilter('tag', tag.slug)}
                                            className={`cursor-pointer px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${filters?.tag === tag.slug
                                                ? 'bg-bm-gold text-bm-dark border-bm-gold shadow-md'
                                                : 'bg-bm-white/5 border-bm-white/10 text-bm-muted hover:bg-bm-white/10 hover:text-bm-white hover:border-bm-white/20'
                                                }`}
                                        >
                                            {tag.name} <span className="opacity-60 ml-1">({tag.posts_count})</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm font-medium text-bm-muted/50 py-2 border border-bm-white/5 border-dashed rounded-lg text-center bg-bm-white/5 w-full">No tags found</div>
                            )}
                        </div>
                    </div>

                    {/* Articles Grid */}
                    <div className="lg:col-span-3">
                        {posts.data.length === 0 ? (
                            <div className="text-center py-24 px-6 rounded-3xl border border-dashed border-bm-white/10 bg-bm-white/5">
                                <FileText className="h-16 w-16 text-bm-white/20 mx-auto mb-6" />
                                <h3 className="font-serif text-2xl font-bold tracking-tight text-bm-white mb-2">No articles found</h3>
                                <p className="text-bm-muted font-medium mb-8">Try adjusting your filters or search query to find what you're looking for.</p>
                                <Button onClick={clearFilters} className="bg-bm-gold px-8 h-12 text-bm-dark font-bold hover:bg-bm-gold-hover transition-all hover:scale-105 active:scale-95 rounded-lg shadow-xl shadow-bm-gold/20">
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2">
                                {posts.data.map(post => (
                                    <Link key={post.id} href={`/blog-article/${post.slug}`} className="group flex flex-col h-full rounded-3xl border border-bm-white/10 bg-bm-white/2 overflow-hidden hover:border-bm-gold/30 hover:bg-bm-white/4 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-bm-gold/10">
                                        <div className="relative aspect-4/3 overflow-hidden bg-bm-dark/50">
                                            {post.featured_image_path ? (
                                                <img src={`/storage/${post.featured_image_path}`} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileText className="h-12 w-12 text-bm-white/10" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-linear-to-t from-bm-dark via-transparent to-transparent opacity-60" />
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                {post.categories?.slice(0, 2).map((cat: any) => (
                                                    <span key={cat.id} className="rounded-full bg-bm-dark/80 px-3 py-1 font-bold tracking-widest uppercase text-[10px] text-bm-gold backdrop-blur-md">
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col p-6 lg:p-8">
                                            <div className="mb-4 flex items-center gap-4 text-xs font-bold text-bm-muted uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-bm-gold" /> {new Date(post.published_at).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1.5"><User className="h-3 w-3 text-bm-gold" /> {post.author?.name}</span>
                                            </div>
                                            <h3 className="mb-4 font-serif text-xl font-bold tracking-tight text-bm-white group-hover:text-bm-gold transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            <p className="mt-auto text-sm font-medium leading-relaxed text-bm-muted line-clamp-3">
                                                {post.excerpt ?? 'Click to read more about this article...'}
                                            </p>

                                            {post.tags && post.tags.length > 0 && (
                                                <div className="mt-6 pt-5 border-t border-bm-white/10 flex flex-wrap gap-2">
                                                    {post.tags.slice(0, 3).map((tag: any) => (
                                                        <span key={tag.id} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-bm-muted bg-bm-white/5 border border-bm-white/10 hover:border-bm-gold/50 hover:text-bm-white px-2.5 py-1 rounded-md transition-colors">
                                                            <Tag className="h-3 w-3 text-bm-gold/70" /> {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="mt-16 flex justify-center">
                                <div className="flex gap-2">
                                    {posts.links.map((link, i) => {
                                        const isLastOrFirst = i === 0 || i === posts.links.length - 1;

                                        return (
                                            <button
                                                key={i}
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, undefined, { preserveScroll: true })}
                                                className={`hidden md:inline-flex h-10 min-w-10 items-center justify-center rounded-lg border text-sm font-bold transition-all ${link.active
                                                    ? 'bg-bm-gold border-bm-gold text-bm-dark shadow-lg shadow-bm-gold/20'
                                                    : 'bg-bm-white/5 border-bm-white/10 text-bm-muted hover:bg-bm-white/10 hover:text-bm-white hover:border-bm-white/30'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} ${isLastOrFirst ? '!inline-flex' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
