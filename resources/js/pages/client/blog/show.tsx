import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Calendar, User, Eye, Tag, ArrowLeft, MessageCircle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Swal from 'sweetalert2';

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
    const { auth } = usePage().props;

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

    return (
        <AppLayout breadcrumbs={[
            { title: 'Blog', href: '/blog' },
            { title: post.title, href: '#' }
        ]}>
            <Head title={post.meta_title || post.title} />
            {post.meta_description ? (
                <Head>
                    <meta name="description" content={post.meta_description} />
                </Head>
            ) : null}

            <article className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                <header className="mb-10 text-center space-y-6">
                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {post.categories.map(cat => (
                            <Link key={cat.id} href={`/blog?category=${cat.slug}`}>
                                <Badge variant="secondary" className="px-3 py-1 font-bold tracking-widest uppercase text-[10px] hover:bg-bm-gold hover:text-black transition-colors cursor-pointer">
                                    {cat.name}
                                </Badge>
                            </Link>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] max-w-3xl mx-auto">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-muted-foreground pt-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background shadow-sm">
                            <div className="size-6 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {post.author.avatar ? (
                                    <img src={post.author.avatar} alt={post.author.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="size-3 text-foreground" />
                                )}
                            </div>
                            <span className="text-foreground">{post.author.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            {new Date(post.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="size-4" />
                            {post.view_count} views
                        </div>
                    </div>
                </header>

                {post.featured_image_path && (
                    <div className="rounded-[2.5rem] overflow-hidden border border-border/40 shadow-2xl mb-16 aspect-21/9 bg-muted">
                        <img
                            src={`/storage/${post.featured_image_path}`}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="max-w-3xl mx-auto">
                    <div
                        className="prose prose-lg dark:prose-invert prose-headings:font-black prose-headings:tracking-tight prose-a:text-bm-gold hover:prose-a:underline prose-img:rounded-3xl prose-img:shadow-xl max-w-none text-[1.1rem] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {post.tags.length > 0 && (
                        <div className="mt-16 pt-8 border-t border-border/40 flex items-center gap-4 flex-wrap">
                            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Tag className="size-4" /> Tags:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                                        <Badge variant="outline" className="px-3 py-1 font-medium hover:bg-bm-gold hover:text-black hover:border-bm-gold transition-colors cursor-pointer">
                                            {tag.name}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* COMMENTS SECTION */}
                    <div className="mt-20 pt-10 border-t-2 border-border/30">
                        <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                            <MessageCircle className="size-6 text-bm-gold" />
                            Comments ({post.approved_comments?.length || 0})
                        </h3>

                        {auth.user ? (
                            <form onSubmit={handleComment} className="mb-12 bg-muted/30 border border-border/50 p-6 rounded-3xl">
                                <h4 className="font-semibold mb-4 text-sm">Leave a comment</h4>
                                <Textarea
                                    value={data.body}
                                    onChange={e => setData('body', e.target.value)}
                                    placeholder="What are your thoughts on this?"
                                    className="min-h-[120px] rounded-2xl bg-background border-border/40 focus:border-bm-gold/50 focus:ring-bm-gold/20 resize-y mb-4"
                                    required
                                />
                                {errors.body && <p className="text-sm text-red-500 mb-4">{errors.body}</p>}
                                <Button type="submit" disabled={processing || !data.body.trim()} className="rounded-xl px-8 bg-bm-gold hover:bg-bm-gold/90 text-black font-bold">
                                    Post Comment
                                </Button>
                            </form>
                        ) : (
                            <div className="mb-12 bg-muted/30 border border-border/50 p-6 rounded-3xl text-center">
                                <MessageCircle className="size-10 text-muted-foreground/30 mx-auto mb-3" />
                                <h4 className="font-semibold mb-2">Want to join the conversation?</h4>
                                <p className="text-muted-foreground text-sm mb-4">Please log in or create an account to leave a comment.</p>
                                <Button asChild className="rounded-xl bg-foreground text-background font-bold">
                                    <Link href="/login">Log In to Comment</Link>
                                </Button>
                            </div>
                        )}

                        <div className="space-y-6">
                            {(!post.approved_comments || post.approved_comments.length === 0) ? (
                                <p className="text-muted-foreground text-center py-8 italic bg-muted/10 rounded-2xl border border-dashed border-border/40">No comments yet. Be the first to share your thoughts!</p>
                            ) : (
                                post.approved_comments.map(comment => (
                                    <div key={comment.id} className="flex gap-4 p-5 rounded-2xl bg-card border border-border/40 shadow-sm">
                                        <div className="size-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border border-border/60">
                                            {comment.author.avatar ? (
                                                <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-muted-foreground text-xs">{comment.author.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline justify-between mb-1">
                                                <h5 className="font-bold text-sm tracking-tight">{comment.author.name}</h5>
                                                <span className="text-xs text-muted-foreground opacity-70 font-medium">
                                                    {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{comment.body}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* RELATED POSTS */}
                {related.length > 0 && (
                    <div className="mt-24 pt-16 border-t border-border/30">
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-black mb-3">Keep Reading</h3>
                            <p className="text-muted-foreground">More articles you might enjoy</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {related.map(rel => (
                                <Link key={rel.id} href={`/blog/${rel.slug}`} className="group">
                                    <div className="rounded-3xl overflow-hidden border border-border/40 bg-card hover:border-bm-gold/50 transition-colors h-full flex flex-col shadow-sm hover:shadow-xl hover:shadow-bm-gold/5 hover:-translate-y-1 duration-300">
                                        <div className="aspect-16/10 bg-muted relative overflow-hidden">
                                            {rel.featured_image_path ? (
                                                <img src={`/storage/${rel.featured_image_path}`} alt={rel.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FileText className="size-8 text-muted-foreground/30" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex gap-2 flex-wrap mb-3">
                                                {rel.categories.slice(0, 1).map(cat => (
                                                    <span key={cat.id} className="text-[9px] uppercase tracking-widest font-black text-bm-gold">
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <h4 className="font-bold text-lg leading-tight group-hover:text-bm-gold transition-colors line-clamp-3 mb-4">
                                                {rel.title}
                                            </h4>
                                            <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                <div className="size-5 rounded-full bg-muted flex items-center justify-center border border-border/50 shrink-0">
                                                    <span className="font-bold text-[8px]">{rel.author.name.charAt(0)}</span>
                                                </div>
                                                <span className="truncate">{rel.author.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </article>
        </AppLayout>
    );
}
