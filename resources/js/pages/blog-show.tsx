import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Calendar, User, Eye, Tag, ArrowLeft, MessageCircle, FileText, ArrowUp, Instagram, Twitter, Linkedin, Facebook, ArrowRight } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Swal from 'sweetalert2';
import { login } from '@/routes';

interface BlogComment {
    id: number;
    body: string;
    created_at: string;
    author: {
        name: string;
        avatar?: string;
    };
}

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    featured_image_path: string | null;
    published_at: string;
    view_count: number;
    author: { name: string; avatar?: string };
    categories: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    approved_comments: BlogComment[];
    meta_title: string | null;
    meta_description: string | null;
}

interface Props {
    post: BlogPost;
    related: Omit<BlogPost, 'content' | 'approved_comments'>[];
}

export default function BlogShow({ post, related }: Props) {
    const { auth } = usePage().props as { auth: { user: any } };

    const { data, setData, post: submitComment, processing, reset, errors } = useForm({
        body: '',
    });

    const handleComment = (e: React.FormEvent) => {
        e.preventDefault();
        submitComment(`/blog/${post.slug}/comment`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                Swal.fire({
                    icon: 'success',
                    title: 'Comment submitted!',
                    text: 'Your comment is pending approval from the admin.',
                    confirmButtonColor: '#ffc107',
                });
            },
        });
    };

    const [showBackToTop, setShowBackToTop] = useState(false);
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

    return (
        <div className="min-h-screen bg-bm-dark text-bm-white selection:bg-bm-gold/30 selection:text-bm-white">
            <Head title={`${post.meta_title || post.title} | Brass Monkey`} />
            {post.meta_description ? (
                <Head>
                    <meta name="description" content={post.meta_description} />
                </Head>
            ) : null}

            {/* Navigation */}
            <header className="fixed top-0 z-50 w-full border-b border-bm-border/10 bg-bm-dark/80 backdrop-blur-md">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <AppLogoIcon className="h-10 w-auto transition-transform duration-300 group-hover:scale-110 text-bm-gold" />
                            <span className="font-serif text-xl font-bold tracking-tight text-bm-white">Brass Monkey</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-8">
                        <nav className="hidden items-center gap-6 lg:flex">
                            {[
                                { name: 'Track Order', href: '/#track-order' },
                                { name: 'Services', href: '/#services' },
                                { name: 'Blog', href: '/#blogs' },
                                { name: 'About', href: '/#about' },
                                { name: 'Product', href: '/#product' }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-[13px] font-bold text-bm-muted transition-colors hover:text-bm-gold uppercase tracking-wider"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-6 border-l border-bm-white/10 pl-8">
                            {auth && auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="text-[13px] font-bold text-bm-white transition-colors hover:text-bm-gold uppercase tracking-wider"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={login()}
                                    className="text-[13px] font-bold text-bm-white transition-colors hover:text-bm-gold uppercase tracking-wider"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-24 pb-16">
                <article className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 mt-10">
                    <div className="mb-10">
                        <Link href="/#blogs" className="inline-flex items-center text-sm font-bold text-bm-muted hover:text-bm-gold uppercase tracking-wider transition-colors group">
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back to Articles
                        </Link>
                    </div>

                    <header className="mb-12 text-center space-y-6">
                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            {post.categories.map(cat => (
                                <Link key={cat.id} href={`/?category=${cat.slug}#blogs`}>
                                    <span className="px-3 py-1.5 rounded-full border border-bm-white/10 bg-bm-white/5 font-bold tracking-widest uppercase text-[10px] text-bm-muted hover:bg-bm-gold hover:text-bm-dark hover:border-bm-gold transition-colors cursor-pointer">
                                        {cat.name}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <h1 className="font-serif text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight leading-[1.2] max-w-3xl mx-auto text-bm-white">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-bm-muted pt-6">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-bm-white/10 bg-bm-white/5 shadow-sm">
                                <div className="h-6 w-6 rounded-full bg-bm-white/10 flex items-center justify-center overflow-hidden">
                                    {post.author.avatar ? (
                                        <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="h-3 w-3 text-bm-white/70" />
                                    )}
                                </div>
                                <span className="text-bm-white font-bold">{post.author.name}</span>
                            </div>
                            <div className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold">
                                <Calendar className="h-3 w-3 text-bm-gold" />
                                {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-2 uppercase tracking-widest text-[10px] font-bold">
                                <Eye className="h-3 w-3 text-bm-gold" />
                                {post.view_count} views
                            </div>
                        </div>
                    </header>

                    {post.featured_image_path && (
                        <div className="rounded-3xl overflow-hidden border border-bm-white/10 shadow-2xl shadow-bm-gold/5 mb-16 aspect-21/9 bg-bm-dark">
                            <img
                                src={`/storage/${post.featured_image_path}`}
                                alt={post.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="max-w-[800px] mx-auto">
                        <div
                            className="prose prose-lg prose-invert prose-p:text-bm-white/80 prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-a:text-bm-gold hover:prose-a:underline prose-img:rounded-3xl prose-img:shadow-xl max-w-none text-[1.15rem] leading-relaxed text-bm-white/90"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {post.tags.length > 0 && (
                            <div className="mt-16 pt-8 border-t border-bm-white/10 flex items-center gap-4 flex-wrap">
                                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bm-gold flex items-center gap-2">
                                    <Tag className="h-4 w-4" /> Tags:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <Link key={tag.id} href={`/?tag=${tag.slug}#blogs`}>
                                            <span className="px-3 py-1.5 border border-bm-white/10 bg-bm-white/5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-bm-muted hover:bg-bm-gold hover:text-bm-dark hover:border-bm-gold transition-colors cursor-pointer">
                                                {tag.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* COMMENTS SECTION */}
                        <div className="mt-20 pt-10 border-t border-bm-white/10">
                            <h3 className="font-serif text-3xl font-bold mb-8 flex items-center gap-3 text-bm-white">
                                <MessageCircle className="h-6 w-6 text-bm-gold" />
                                Comments ({post.approved_comments?.length || 0})
                            </h3>

                            {auth && auth.user ? (
                                <form onSubmit={handleComment} className="mb-12 bg-bm-white/5 border border-bm-white/10 p-8 rounded-3xl">
                                    <h4 className="font-bold text-[11px] tracking-[0.2em] uppercase mb-4 text-bm-gold">Leave a comment</h4>
                                    <Textarea
                                        value={data.body}
                                        onChange={e => setData('body', e.target.value)}
                                        placeholder="What are your thoughts on this?"
                                        className="min-h-[120px] rounded-2xl bg-bm-dark/50 border-bm-white/10 focus:border-bm-gold focus:ring-1 focus:ring-bm-gold text-bm-white placeholder:text-bm-muted/50 mb-6 text-base"
                                        required
                                    />
                                    {errors.body && <p className="text-[11px] font-bold text-red-400 uppercase tracking-wider mb-4">{errors.body}</p>}
                                    <Button type="submit" disabled={processing || !data.body.trim()} className="rounded-xl px-10 h-12 bg-bm-gold hover:bg-bm-gold-hover text-bm-dark font-bold shadow-lg shadow-bm-gold/20 transition-all active:scale-95 uppercase tracking-widest text-[11px]">
                                        Post Comment
                                    </Button>
                                </form>
                            ) : (
                                <div className="mb-12 bg-bm-white/5 border border-bm-white/10 p-10 rounded-3xl text-center">
                                    <MessageCircle className="h-12 w-12 text-bm-white/20 mx-auto mb-6" />
                                    <h4 className="font-serif text-2xl font-bold mb-3 text-bm-white">Want to join the conversation?</h4>
                                    <p className="text-bm-muted text-base mb-8">Please log in or create an account to leave a comment.</p>
                                    <Button asChild className="rounded-xl px-10 h-12 bg-bm-gold hover:bg-bm-gold-hover text-bm-dark border border-bm-gold transition-all font-bold uppercase tracking-widest text-[11px]">
                                        <Link href={login()}>Log In to Comment</Link>
                                    </Button>
                                </div>
                            )}

                            <div className="space-y-6">
                                {(!post.approved_comments || post.approved_comments.length === 0) ? (
                                    <p className="text-bm-muted text-center py-10 italic bg-bm-white/2 rounded-2xl border border-dashed border-bm-white/10 font-medium">No comments yet. Be the first to share your thoughts!</p>
                                ) : (
                                    post.approved_comments.map(comment => (
                                        <div key={comment.id} className="flex gap-5 p-6 rounded-2xl bg-bm-white/2 border border-bm-white/10 shadow-sm">
                                            <div className="h-12 w-12 rounded-full bg-bm-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-bm-white/10">
                                                {comment.author.avatar ? (
                                                    <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="font-bold text-bm-muted text-sm uppercase">{comment.author.name.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-baseline justify-between mb-3 border-b border-bm-white/5 pb-3">
                                                    <h5 className="font-bold text-base tracking-tight text-bm-white">{comment.author.name}</h5>
                                                    <span className="text-[10px] uppercase tracking-[0.2em] text-bm-muted/70 font-bold">
                                                        {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <p className="text-[15px] text-bm-white/80 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RELATED POSTS */}
                    {related.length > 0 && (
                        <div className="mt-32 pt-20 border-t border-bm-white/10">
                            <div className="text-center mb-16">
                                <div className="mb-6 inline-flex items-center rounded-full border border-bm-gold/30 bg-bm-gold/5 px-4 py-1.5 backdrop-blur-sm">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-bm-gold">More Articles</span>
                                </div>
                                <h3 className="font-serif text-4xl font-bold mb-4 text-bm-white">Keep Reading</h3>
                                <p className="text-bm-muted text-lg">Discover more insights and stories</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                                {related.map(rel => (
                                    <Link key={rel.id} href={`/blog-article/${rel.slug}`} className="group h-full flex flex-col rounded-3xl border border-bm-white/10 bg-bm-white/2 overflow-hidden hover:border-bm-gold/30 hover:bg-bm-white/4 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-bm-gold/10 relative">
                                        <div className="aspect-[4/3] bg-bm-dark/50 relative overflow-hidden">
                                            {rel.featured_image_path ? (
                                                <img src={`/storage/${rel.featured_image_path}`} alt={rel.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileText className="h-12 w-12 text-bm-white/10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="flex gap-2 flex-wrap mb-4">
                                                {rel.categories.slice(0, 2).map(cat => (
                                                    <span key={cat.id} className="text-[10px] uppercase tracking-[0.2em] font-bold text-bm-gold">
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <h4 className="font-serif font-bold text-xl leading-tight group-hover:text-bm-gold transition-colors line-clamp-3 mb-6 text-bm-white">
                                                {rel.title}
                                            </h4>
                                            <div className="mt-auto flex items-center gap-3 text-[11px] text-bm-muted font-bold uppercase tracking-widest">
                                                <div className="h-6 w-6 rounded-full bg-bm-white/10 flex items-center justify-center border border-bm-white/5 shrink-0">
                                                    <span className="font-bold text-[9px]">{rel.author.name.charAt(0)}</span>
                                                </div>
                                                <span className="truncate">{rel.author.name}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </article>
            </main>

            {/* Footer */}
            <footer className="bg-[#120E0A] py-24 border-t border-bm-gold/5 relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-bm-gold rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid gap-16 lg:grid-cols-4 md:grid-cols-2">
                        {/* Column 1: Brand & Social */}
                        <div className="space-y-8">
                            <Link href="/" className="flex items-center gap-3 group">
                                <AppLogoIcon className="h-12 w-auto text-bm-gold transition-transform duration-500 group-hover:rotate-[360deg]" />
                                <span className="font-serif text-3xl font-bold tracking-tight text-bm-white">Brass Monkey</span>
                            </Link>
                            <p className="text-bm-muted text-sm leading-relaxed font-medium">
                                Redefining mechanical excellence since 2008. We combine heritage craftsmanship with future-ready precision to maintain the world's most critical systems.
                            </p>
                            <div className="flex gap-4">
                                {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
                                    <a key={i} href="#" className="h-10 w-10 flex items-center justify-center rounded-lg bg-bm-white/5 border border-bm-white/10 text-bm-muted hover:text-bm-gold hover:border-bm-gold/30 hover:bg-bm-gold/5 transition-all duration-300">
                                        <Icon className="h-5 w-5" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Track Service */}
                        <div>
                            <h4 className="font-bold text-bm-white mb-8 uppercase tracking-[0.2em] text-xs text-bm-gold/80">Track Your Service</h4>
                            <p className="text-bm-muted text-sm mb-6 font-medium">Have a tracking ID? Monitor your mechanical restoration live.</p>
                            <Link
                                href="/#track-order"
                                className="inline-flex items-center gap-2 text-bm-gold font-bold text-sm hover:underline underline-offset-4 group"
                            >
                                Track Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {/* Column 3: Professional Services */}
                        <div>
                            <h4 className="font-bold text-bm-white mb-8 uppercase tracking-[0.2em] text-xs text-bm-gold/80">Our Services</h4>
                            <ul className="space-y-4">
                                {[
                                    'Precision Balancing',
                                    'Mechanical Restoration',
                                    'Performance Tuning',
                                    'Diagnostic Inspection',
                                    'Preventive Maintenance'
                                ].map((service) => (
                                    <li key={service}>
                                        <Link href="/#services" className="text-bm-muted text-sm transition-colors hover:text-bm-gold font-medium flex items-center gap-2 group">
                                            <div className="h-1 w-0 bg-bm-gold group-hover:w-2 transition-all duration-300" />
                                            {service}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Column 4: Newsletter */}
                        <div>
                            <h4 className="font-bold text-bm-white mb-8 uppercase tracking-[0.2em] text-xs text-bm-gold/80">Newsletter</h4>
                            <p className="text-bm-muted text-sm mb-6 font-medium">Join our mailing list for technical insights and project showcases.</p>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full bg-bm-white/5 border border-bm-white/10 rounded-lg h-12 px-4 text-sm text-bm-white focus:outline-none focus:border-bm-gold transition-colors placeholder:text-bm-muted/30"
                                />
                                <button className="absolute right-1 top-1 h-10 px-4 bg-bm-gold text-bm-dark rounded-md text-xs font-bold hover:bg-bm-gold-hover transition-colors">
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 pt-8 border-t border-bm-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[11px] font-bold tracking-widest text-bm-muted/30 uppercase">
                            © 2026 Brass Monkey Co. All Engineering Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 z-50 h-14 w-14 rounded-full bg-bm-gold text-bm-dark shadow-2xl shadow-bm-gold/20 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 hover:bg-bm-gold-hover group ${showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                    }`}
                aria-label="Back to top"
            >
                <ArrowUp className="h-6 w-6 transition-transform duration-300 group-hover:-translate-y-1" />
                <div className="absolute inset-0 rounded-full border-4 border-bm-gold/20 animate-ping" />
            </button>
        </div>
    );
}
