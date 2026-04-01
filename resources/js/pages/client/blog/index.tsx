import { Head, Link, router } from '@inertiajs/react';
import { Search, Calendar, User, Eye, Tag, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';

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

export default function BlogIndex({ posts, categories, tags, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get('/blog', { ...filters, search }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                });
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [search, filters]);

    const handleFilter = (type: 'category' | 'tag', slug: string) => {
        const newFilters = { ...filters };

        if (newFilters[type] === slug) {
            delete newFilters[type];
        } else {
            newFilters[type] = slug;
        }

        router.get('/blog', newFilters as any, { preserveScroll: true });
    };

    const clearFilters = () => {
        router.get('/blog');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Blog', href: '/blog' }]}>
            <Head title="Blog & News" />

            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-black tracking-tight mb-4">The Brass Monkey Blog</h1>
                    <p className="text-lg text-muted-foreground">Expert repair tips, local news, promotions, and stories from the shop floor.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Filters */}
                    <div className="space-y-8">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search articles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 h-12 rounded-2xl border-border/40 focus:ring-bm-gold/20 focus:border-bm-gold/50"
                            />
                        </div>

                        {(filters.category || filters.tag || filters.search) && (
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-muted-foreground">Active Filters</span>
                                <Button variant="link" size="sm" onClick={clearFilters} className="text-red-500 cursor-pointer h-auto p-0">Clear All</Button>
                            </div>
                        )}

                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Categories</h3>
                            <div className="flex flex-col gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleFilter('category', cat.slug)}
                                        className={`flex items-center cursor-pointer justify-between px-3 py-2 rounded-xl text-sm transition-colors ${filters.category === cat.slug
                                            ? 'bg-bm-gold text-black font-bold shadow-md shadow-bm-gold/20'
                                            : 'hover:bg-muted font-medium text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <span>{cat.name}</span>
                                        <Badge variant="secondary" className={`text-[10px] ${filters.category === cat.slug ? 'bg-black/10 text-black hover:bg-black/20' : ''}`}>
                                            {cat.posts_count}
                                        </Badge>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Popular Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <Badge
                                        key={tag.id}
                                        variant={filters.tag === tag.slug ? "default" : "outline"}
                                        className={`cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filters.tag === tag.slug
                                            ? 'bg-foreground text-background hover:bg-foreground/90'
                                            : 'hover:bg-muted'
                                            }`}
                                        onClick={() => handleFilter('tag', tag.slug)}
                                    >
                                        {tag.name}
                                        <span className="ml-1.5 opacity-50 font-normal">({tag.posts_count})</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Post Grid */}
                    <div className="lg:col-span-3">
                        {posts.data.length === 0 ? (
                            <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-border/60 bg-muted/20">
                                <FileText className="size-12 text-muted-foreground/50 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">No posts found</h3>
                                <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                                <Button className="mt-6 rounded-xl" variant="outline" onClick={clearFilters}>Change Filters</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {posts.data.map(post => (
                                    <Link key={post.id} href={`/blog-article/${post.slug}`} className="group h-full">
                                        <Card className="flex flex-col h-full overflow-hidden rounded-3xl border border-border/40 hover:border-bm-gold/50 transition-all duration-300 hover:shadow-xl hover:shadow-bm-gold/10 bg-card hover:-translate-y-1">
                                            <div className="relative aspect-video overflow-hidden bg-muted">
                                                {post.featured_image_path ? (
                                                    <img
                                                        src={`/storage/${post.featured_image_path}`}
                                                        alt={post.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-bm-gold/5 group-hover:bg-bm-gold/10 transition-colors">
                                                        <FileText className="size-16 text-bm-gold/30" />
                                                    </div>
                                                )}

                                                {/* Categories Overlay */}
                                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                                    {post.is_featured && (
                                                        <Badge className="bg-bm-gold text-black font-bold uppercase tracking-wider text-[10px] shadow-sm">Featured</Badge>
                                                    )}
                                                    {post.categories.slice(0, 2).map((cat) => (
                                                        <Badge key={cat.id} variant="secondary" className="bg-background/90 backdrop-blur-sm text-foreground shadow-sm">
                                                            {cat.name}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <CardContent className="flex-1 p-6">
                                                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {new Date(post.published_at).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1.5"><Eye className="size-3.5" /> {post.view_count} views</span>
                                                </div>

                                                <h2 className="text-xl font-bold tracking-tight mb-3 line-clamp-2 group-hover:text-bm-gold transition-colors">
                                                    {post.title}
                                                </h2>

                                                <p className="text-sm text-muted-foreground/90 line-clamp-3 leading-relaxed mb-6">
                                                    {post.excerpt || 'Click to read more about this article...'}
                                                </p>
                                            </CardContent>

                                            <CardFooter className="p-6 pt-0 mt-auto border-t border-border/20 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-full bg-muted flex items-center justify-center border border-border/50 text-xs font-bold text-muted-foreground">
                                                        {post.author.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm font-semibold">{post.author.name}</span>
                                                </div>
                                                <div className="flex gap-1.5 opacity-60">
                                                    {post.tags.slice(0, 2).map(tag => (
                                                        <span key={tag.id} className="text-xs font-medium bg-muted px-2 py-1 rounded-md flex items-center gap-1">
                                                            <Tag className="size-2.5" />
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination wrapper if needed */}
                        {posts.last_page > 1 && (
                            <div className="mt-12 flex justify-center">
                                <div className="flex gap-2">
                                    {posts.links.map((link, i) => (
                                        <Button
                                            key={i}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            className={`rounded-xl ${link.active ? 'bg-bm-gold text-black hover:bg-bm-gold/90 border-transparent shadow-md' : 'shadow-sm'}`}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url, undefined, { preserveScroll: true })}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
