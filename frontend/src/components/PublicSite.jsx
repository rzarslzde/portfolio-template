import { useEffect, useMemo, useState } from 'react';
import DOMPurify from 'dompurify';
import {
  ArrowDown, ArrowLeft, ArrowUpLeft, BriefcaseBusiness, CalendarDays,
  Check, ChevronLeft, ChevronRight, Download, ExternalLink, FileArchive,
  FileImage, FileText, Github, Globe2, Instagram, Linkedin, Mail, MapPin,
  Menu, MoveUpLeft, PenLine, Phone, Sparkles, X,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { request, resolveAsset } from '../api';
import { useSite } from '../context';
import { BackLink, PersianDate, SectionIntro } from './Ui';

function SocialIcon({ name, size = 17 }) {
  const normalized = (name || '').toLowerCase();
  if (normalized.includes('linkedin') || normalized.includes('لینک')) return <Linkedin size={size} />;
  if (normalized.includes('github') || normalized.includes('گیت')) return <Github size={size} />;
  if (normalized.includes('instagram') || normalized.includes('اینستا')) return <Instagram size={size} />;
  return <ExternalLink size={size} />;
}

function PageHeader({ site }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [location.pathname]);
  const isBlog = location.pathname.startsWith('/blog');

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" to="/" aria-label="صفحه‌ی اصلی">
          <span className="brand-mark">ر</span>
          <span className="brand-copy"><strong>{site.name}</strong><small>نمونه‌کار شخصی</small></span>
        </Link>
        <button className="mobile-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'بستن منو' : 'بازکردن منو'}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`main-nav${menuOpen ? ' main-nav-open' : ''}`} aria-label="ناوبری اصلی">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>خانه</NavLink>
          <a className="nav-link" href={isBlog ? '/#about' : '#about'}>درباره‌ی من</a>
          <a className="nav-link" href={isBlog ? '/#portfolio' : '#portfolio'}>نمونه‌کارها</a>
          <NavLink to="/blog" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>نوشته‌ها</NavLink>
        </nav>
        <a className="header-contact" href={`mailto:${site.email}`}>
          <span>بیایید گفت‌وگو کنیم</span><ArrowUpLeft size={16} />
        </a>
      </div>
    </header>
  );
}

export function PublicLayout() {
  const { site, siteLoading, siteError, refreshSite } = useSite();
  useEffect(() => {
    if (site?.name) document.title = `${site.name} | نمونه‌کار شخصی`;
  }, [site?.name]);
  if (siteLoading && !site) {
    return <div className="public-loading" dir="rtl"><span className="spinner" /><p>در حال آماده‌کردن صفحه…</p></div>;
  }
  if (!site) {
    return (
      <main className="connection-error" dir="rtl">
        <div className="connection-error-icon">!</div>
        <p className="eyebrow">اتصال به سرور</p>
        <h1>محتوا در دسترس نیست</h1>
        <p>{siteError || 'برای نمایش اطلاعات، ارتباط با API برقرار نشد.'}</p>
        <button className="button button-primary" onClick={() => refreshSite().catch(() => {})}>تلاش دوباره</button>
      </main>
    );
  }
  return (
    <div className="public-site" dir="rtl">
      <PageHeader site={site} />
      <Outlet />
      <PublicFooter site={site} />
    </div>
  );
}

function Hero({ site }) {
  const firstName = site.name?.trim().split(/\s+/)[0] || 'دوست';
  const [firstStat, secondStat] = site.stats || [];
  const socials = site.social_links || [];

  return (
    <section className="hero wrap" id="top">
      <div className="hero-copy">
        <div className="availability"><span className="availability-dot" />{site.availability || 'برای همکاری آماده‌ام'}</div>
        <p className="hero-kicker">{site.hero_label || `سلام، من ${firstName} هستم`}</p>
        <h1>{site.name}<span className="hero-period">.</span></h1>
        <p className="hero-role">{site.role}</p>
        <p className="hero-description">{site.tagline}</p>
        <div className="hero-actions">
          <a className="button button-primary" href={`mailto:${site.email}`}><Mail size={17} />شروع یک گفت‌وگو</a>
          <a className="button button-secondary" href="#portfolio">مرور نمونه‌کارها<ArrowDown size={16} /></a>
        </div>
        {socials.length > 0 && (
          <div className="hero-socials" aria-label="شبکه‌های اجتماعی">
            <span>من را پیدا کنید</span>
            <div className="social-list">
              {socials.map((item, index) => (
                <a key={`${item.label}-${index}`} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label} title={item.label}>
                  <SocialIcon name={item.icon || item.label} />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="hero-art" aria-label={`معرفی ${site.name}`}>
        <div className="hero-art-halo" />
        <div className="hero-art-grid" />
        <div className="hero-photo-card">
          <div className="photo-card-top"><span>پروفایل حرفه‌ای</span><span>۰۱ / ۰۳</span></div>
          <div className={`profile-portrait${site.avatar_url ? ' has-avatar' : ''}`}>
            {site.avatar_url ? <img src={resolveAsset(site.avatar_url)} alt={site.name} /> : <span>{site.name?.trim().charAt(0) || 'ر'}</span>}
            <div className="portrait-sparkle"><Sparkles size={21} /></div>
          </div>
          <div className="photo-card-bottom">
            <div><small>زمینه‌ی کاری</small><strong>{site.role}</strong></div>
            <span className="portrait-check"><Check size={16} /></span>
          </div>
        </div>
        <div className="floating-note note-experience"><span className="note-icon"><BriefcaseBusiness size={17} /></span><span><strong>{firstStat?.value || '۸+'}</strong><small>{firstStat?.label || 'سال تجربه'}</small></span></div>
        <div className="floating-note note-location"><MapPin size={16} /><span>{site.location}</span></div>
        <div className="art-index"><span>طراحی</span><i /> <span>توسعه</span></div>
      </div>
    </section>
  );
}

function StatsStrip({ stats = [] }) {
  if (!stats.length) return null;
  return (
    <section className="stats-strip wrap" aria-label="نکاتی درباره‌ی مسیر حرفه‌ای">
      <div className="stats-caption"><span className="stats-line" />چند عدد از مسیر من</div>
      <div className="stats-items">
        {stats.slice(0, 4).map((stat, index) => (
          <div className="stat-item" key={`${stat.label}-${index}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>
        ))}
      </div>
    </section>
  );
}

function AboutSection({ site }) {
  const entries = site.experiences || [];
  return (
    <section className="section-wrap about-section" id="about">
      <div className="wrap">
        <SectionIntro eyebrow="کمی درباره‌ی من" title="کار خوب، از کنجکاوی شروع می‌شود." copy="مسیر من میان طراحی و فناوری می‌گذرد؛ جایی که ایده‌های خوب به تجربه‌های ماندگار تبدیل می‌شوند." />
        <div className="about-grid">
          <div className="about-story">
            <div className="about-mark"><span>ر</span></div>
            <p className="about-lead">{site.about}</p>
            <div className="contact-chips">
              {site.location && <span><MapPin size={15} />{site.location}</span>}
              {site.email && <a href={`mailto:${site.email}`}><Mail size={15} />{site.email}</a>}
            </div>
          </div>
          <div className="about-aside">
            <div className="aside-stat"><span className="aside-number">{site.stats?.[1]?.value || '۲۴'}</span><div><strong>تجربه‌هایی با معنا</strong><small>در کنار تیم‌های مشتاق و مسئله‌های واقعی</small></div></div>
            <div className="aside-divider" />
            <div className="aside-stat"><span className="aside-number">{entries.length.toLocaleString('fa-IR').padStart(2, '۰')}</span><div><strong>مسیرهای حرفه‌ای</strong><small>هر کدام فرصتی برای یادگرفتن و بهترشدن</small></div></div>
            <a className="about-cta" href={`mailto:${site.email}`}>درباره‌ی پروژه‌تان صحبت کنیم<ArrowUpLeft size={17} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Timeline({ title, eyebrow, items = [], type }) {
  const Icon = type === 'experience' ? BriefcaseBusiness : PenLine;
  return (
    <div className="timeline-column">
      <div className="timeline-heading"><span className="timeline-heading-icon"><Icon size={18} /></span><div><span className="eyebrow">{eyebrow}</span><h3>{title}</h3></div></div>
      <div className="timeline-list">
        {items.map((item, index) => (
          <article className="timeline-item" key={`${item.title}-${index}`}>
            <span className="timeline-dot" />
            <div className="timeline-meta"><span>{item.period}</span><span className="timeline-index">۰{index + 1}</span></div>
            <h4>{item.title}</h4>
            <div className="timeline-place">{type === 'experience' ? item.company : item.place}</div>
            {item.description && <p>{item.description}</p>}
          </article>
        ))}
        {items.length === 0 && <p className="muted-empty">اطلاعات این بخش هنوز اضافه نشده است.</p>}
      </div>
    </div>
  );
}

function JourneySection({ site }) {
  return (
    <section className="section-wrap journey-section">
      <div className="wrap">
        <SectionIntro eyebrow="مسیر حرفه‌ای" title="هر تجربه، بخشی از داستان است." />
        <div className="journey-grid">
          <Timeline title="تجربه‌ی کاری" eyebrow="در میدان عمل" items={site.experiences || []} type="experience" />
          <Timeline title="تحصیلات" eyebrow="ریشه‌های یادگیری" items={site.education || []} type="education" />
        </div>
      </div>
    </section>
  );
}

function SkillsSection({ skills = [] }) {
  return (
    <section className="skills-section section-wrap">
      <div className="wrap skills-layout">
        <div className="skills-intro">
          <span className="eyebrow">جعبه‌ابزار من</span>
          <h2>ترکیبِ درستِ فکر و مهارت.</h2>
          <p>مهارت‌ها ابزارند؛ مهم‌تر از همه این است که بدانیم چه زمانی و برای چه مسئله‌ای از آن‌ها استفاده کنیم.</p>
          <div className="skills-note"><Sparkles size={17} /><span>همیشه در حال یادگیری چیزهای تازه</span></div>
        </div>
        <div className="skills-list">
          {skills.map((skill, index) => (
            <div className="skill-row" key={`${skill.name}-${index}`}>
              <div className="skill-name"><span>{skill.name}</span><span className="skill-level">{Number(skill.level || 0).toLocaleString('fa-IR')}٪</span></div>
              <div className="skill-track"><span style={{ width: `${Math.min(100, Math.max(0, Number(skill.level) || 0))}%` }} /></div>
            </div>
          ))}
          {skills.length === 0 && <p className="muted-empty">مهارت‌ها به‌زودی اینجا نمایش داده می‌شوند.</p>}
        </div>
      </div>
    </section>
  );
}

function getFileIcon(file) {
  const extension = (file.filename || file.url || '').split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) return FileImage;
  if (extension === 'zip') return FileArchive;
  return FileText;
}

function readableBytes(bytes) {
  if (!bytes) return 'فایل منتخب';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('fa-IR')} کیلوبایت`;
  return `${(bytes / (1024 * 1024)).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت`;
}

function FilesSection({ site }) {
  const files = site.files || [];
  const [active, setActive] = useState(0);
  const visibleFiles = useMemo(() => {
    if (!files.length) return [];
    return Array.from({ length: Math.min(3, files.length) }, (_, index) => files[(active + index) % files.length]);
  }, [active, files]);
  const move = (step) => setActive((current) => files.length ? (current + step + files.length) % files.length : 0);

  return (
    <section className="section-wrap files-section" id="portfolio">
      <div className="wrap">
        <SectionIntro eyebrow="فایل‌های منتخب" title={site.file_section_title || 'چیزهایی برای دیدن و خواندن'} copy={site.file_section_description} />
        {files.length > 0 ? (
          <>
            <div className="files-slider">
              {visibleFiles.map((file, index) => {
                const Icon = getFileIcon(file);
                const asset = resolveAsset(file.url);
                return (
                  <article className={`file-card file-card-${index + 1}`} key={`${file.filename || file.url}-${file.title}`}>
                    <div className="file-art"><span className="file-art-number">۰{(active + index + 1).toLocaleString('fa-IR')}</span><Icon size={30} strokeWidth={1.45} /><span className="file-art-dot" /></div>
                    <div className="file-card-body">
                      <div className="file-card-meta"><span>{(file.filename || '').split('.').pop()?.toUpperCase() || 'فایل'}</span><span>{readableBytes(file.size)}</span></div>
                      <h3>{file.title}</h3>
                      <p>{file.description || file.original_name || 'برای آشنایی بیشتر، این فایل را دریافت کنید.'}</p>
                      {asset ? <a className="file-download" href={asset} download><span>دریافت فایل</span><Download size={16} /></a> : <span className="file-download file-disabled">فایل در دسترس نیست</span>}
                    </div>
                  </article>
                );
              })}
            </div>
            {files.length > 1 && <div className="slider-controls"><span>{(active + 1).toLocaleString('fa-IR')}<i />{files.length.toLocaleString('fa-IR')}</span><div><button aria-label="فایل‌های قبلی" onClick={() => move(-1)}><ChevronRight size={18} /></button><button aria-label="فایل‌های بعدی" onClick={() => move(1)}><ChevronLeft size={18} /></button></div></div>}
          </>
        ) : (
          <div className="files-empty">
            <div className="empty-doc-stack"><span /><span /><span><FileText size={25} /></span></div>
            <div><strong>جای فایل‌های شما اینجاست</strong><p>رزومه، مطالعه‌ی موردی یا فایل‌های منتخب‌تان را از پنل مدیریت اضافه کنید.</p></div>
            <span className="empty-arrow"><ArrowDown size={17} /></span>
          </div>
        )}
      </div>
    </section>
  );
}

function PostCover({ post, compact = false }) {
  if (post.cover_image) {
    return <div className={`post-cover${compact ? ' post-cover-compact' : ''}`}><img src={resolveAsset(post.cover_image)} alt="" loading="lazy" /></div>;
  }
  const theme = (post.id || post.title?.length || 0) % 3;
  return (
    <div className={`post-cover post-cover-theme-${theme}${compact ? ' post-cover-compact' : ''}`} aria-hidden="true">
      <div className="cover-orbit orbit-one" /><div className="cover-orbit orbit-two" />
      <span className="cover-label">{post.category || 'یادداشت'}</span>
      <span className="cover-mark">ر</span>
      <span className="cover-decoration">{theme === 1 ? 'ط' : theme === 2 ? 'ف' : 'ی'}</span>
    </div>
  );
}

function BlogCard({ post, index = 0 }) {
  return (
    <article className={`blog-card blog-card-${index % 3}`}>
      <Link to={`/blog/${encodeURIComponent(post.slug)}`} className="blog-card-cover-link" aria-label={`خواندن ${post.title}`}>
        <PostCover post={post} />
        <span className="blog-card-arrow"><ArrowUpLeft size={19} /></span>
      </Link>
      <div className="blog-card-body">
        <div className="blog-meta"><span className="category-pill">{post.category || 'یادداشت'}</span><PersianDate date={post.created_at} /></div>
        <h3><Link to={`/blog/${encodeURIComponent(post.slug)}`}>{post.title}</Link></h3>
        <p>{post.excerpt}</p>
        <div className="blog-card-footer"><span>{Number(post.reading_minutes || 4).toLocaleString('fa-IR')} دقیقه مطالعه</span><Link to={`/blog/${encodeURIComponent(post.slug)}`} aria-label="ادامه‌ی مطلب"><ArrowLeft size={17} /></Link></div>
      </div>
    </article>
  );
}

function BlogPreview({ site, posts }) {
  const recent = posts.slice(0, 3);
  return (
    <section className="section-wrap blog-preview" id="writing">
      <div className="wrap">
        <SectionIntro eyebrow="از دفتر یادداشت" title={site.blog_title || 'یادداشت‌هایی از مسیر'} copy={site.blog_description} link="/blog" linkText="همه‌ی نوشته‌ها" />
        {recent.length ? <div className="blog-grid">{recent.map((post, index) => <BlogCard post={post} index={index} key={post.id} />)}</div> : <p className="muted-empty">هنوز نوشته‌ای منتشر نشده است.</p>}
      </div>
    </section>
  );
}

export function HomePage() {
  const { site, posts } = useSite();
  return (
    <main>
      <Hero site={site} />
      <StatsStrip stats={site.stats || []} />
      <AboutSection site={site} />
      <JourneySection site={site} />
      <SkillsSection skills={site.skills || []} />
      <FilesSection site={site} />
      <BlogPreview site={site} posts={posts} />
      <section className="closing-cta wrap">
        <div className="closing-mark"><Sparkles size={24} /></div>
        <div><span className="eyebrow">یک ایده در ذهن دارید؟</span><h2>بیایید چیزی ارزشمند بسازیم.</h2><p>اگر پروژه‌ای دارید یا فقط می‌خواهید درباره‌ی یک ایده حرف بزنید، خوشحال می‌شوم بشنوم.</p></div>
        <a className="button button-light" href={`mailto:${site.email}`}>شروع گفت‌وگو<ArrowUpLeft size={17} /></a>
      </section>
    </main>
  );
}

export function BlogIndex() {
  const { site, posts } = useSite();
  const [category, setCategory] = useState('همه');
  const categories = useMemo(() => ['همه', ...new Set(posts.map((post) => post.category).filter(Boolean))], [posts]);
  const filtered = category === 'همه' ? posts : posts.filter((post) => post.category === category);
  return (
    <main className="blog-page wrap">
      <div className="blog-page-heading">
        <div><span className="eyebrow">یادداشت‌ها و تجربه‌ها</span><h1>{site.blog_title || 'یادداشت‌هایی از مسیر'}</h1><p>{site.blog_description}</p></div>
        <span className="blog-count"><strong>{posts.length.toLocaleString('fa-IR')}</strong><small>نوشته</small></span>
      </div>
      <div className="category-filter" role="group" aria-label="دسته‌بندی نوشته‌ها">
        {categories.map((item) => <button key={item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      {filtered.length ? <div className="blog-grid blog-page-grid">{filtered.map((post, index) => <BlogCard post={post} index={index} key={post.id} />)}</div> : <div className="empty-posts"><PenLine size={24} /><p>هنوز نوشته‌ای در این دسته منتشر نشده است.</p></div>}
    </main>
  );
}

export function BlogDetail() {
  const { slug } = useParams();
  const { posts, site } = useSite();
  const cached = posts.find((post) => post.slug === slug);
  const [post, setPost] = useState(cached || null);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const existing = posts.find((item) => item.slug === slug);
    if (existing) {
      setPost(existing);
      setError('');
      setLoading(false);
    } else {
      setLoading(true);
      request(`/public/posts/${encodeURIComponent(slug)}`)
        .then((result) => { if (active) { setPost(result); setError(''); } })
        .catch((err) => { if (active) setError(err.message); })
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [slug, posts]);

  if (loading) return <main className="article-loading wrap"><span className="spinner" /><p>در حال بارگذاری نوشته…</p></main>;
  if (!post) return <main className="article-error wrap"><BackLink to="/blog" children="بازگشت به نوشته‌ها" /><h1>این نوشته پیدا نشد</h1><p>{error || 'ممکن است نوشته حذف شده باشد یا نشانی آن تغییر کرده باشد.'}</p></main>;

  const safeContent = DOMPurify.sanitize(post.content || '', {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 's', 'del', 'hr', 'br', 'pre', 'code', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'style'],
  });
  return (
    <main className="article-page wrap">
      <BackLink to="/blog" children="همه‌ی نوشته‌ها" />
      <article>
        <header className="article-header">
          <span className="category-pill">{post.category}</span>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="article-excerpt">{post.excerpt}</p>}
          <div className="article-byline"><span className="article-author"><span className="author-avatar">{site.name?.charAt(0)}</span><span><small>نویسنده</small><strong>{site.name}</strong></span></span><span className="article-byline-divider" /><span className="article-date"><CalendarDays size={15} /><PersianDate date={post.created_at} /></span><span className="article-reading"><span />{Number(post.reading_minutes || 4).toLocaleString('fa-IR')} دقیقه مطالعه</span></div>
        </header>
        <PostCover post={post} />
        <div className="article-content" dangerouslySetInnerHTML={{ __html: safeContent }} />
      </article>
      <div className="article-end"><span /><p>سپاس که تا اینجا همراه بودید</p><span /></div>
      <div className="article-author-card"><div className="author-avatar author-avatar-large">{site.name?.charAt(0)}</div><div><span>نویسنده</span><strong>{site.name}</strong><p>{site.role}</p></div><a href={`mailto:${site.email}`} aria-label="ارسال ایمیل"><Mail size={18} /></a></div>
    </main>
  );
}

export function NotFoundPage() {
  return <main className="not-found wrap"><span className="not-found-code">۴۰۴</span><h1>این صفحه پیدا نشد.</h1><p>شاید نشانی تغییر کرده باشد؛ از اینجا می‌توانید مسیرتان را پیدا کنید.</p><Link to="/" className="button button-primary">بازگشت به خانه<ArrowLeft size={17} /></Link></main>;
}

function PublicFooter({ site }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <div className="footer-brand"><span className="brand-mark">ر</span><div><strong>{site.name}</strong><span>ساخته‌شده با فکر، جزئیات و کمی قهوه.</span></div></div>
        <div className="footer-links"><Link to="/">خانه</Link><Link to="/blog">نوشته‌ها</Link><a href={`mailto:${site.email}`}>تماس</a><Link to="/admin/login" className="footer-admin">مدیریت</Link></div>
        <span className="footer-copy">© {new Date().getFullYear().toLocaleString('fa-IR')} · همه‌ی حقوق محفوظ است</span>
      </div>
    </footer>
  );
}
