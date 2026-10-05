import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownLeft, ArrowLeft, ArrowUpLeft, BarChart3, BookOpenText, Check,
  ChevronDown, CircleHelp, Clock3, ExternalLink, Eye, FileArchive, FileImage,
  FilePlus2, FileText, Globe2, GraduationCap, ImagePlus, LayoutDashboard,
  Link2, LogOut, Mail, Menu, MessageSquareText, MoreHorizontal, Pencil,
  Plus, Save, Settings2, ShieldCheck, Sparkles, Trash2, Upload, UserRound,
  UsersRound, BriefcaseBusiness, X, LockKeyhole, LoaderCircle,
} from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getApiBase, request, resolveAsset, uploadAsset } from '../api';
import { useSite } from '../context';
import { PersianDate } from '../components/Ui';
import RichTextEditor from '../components/RichTextEditor';

const navItems = [
  { to: '/admin', label: 'نمای کلی', icon: LayoutDashboard, end: true },
  { to: '/admin/profile', label: 'اطلاعات صفحه‌ی اصلی', icon: UserRound },
  { to: '/admin/files', label: 'فایل‌های نمونه‌کار', icon: FileText },
  { to: '/admin/posts', label: 'مدیریت نوشته‌ها', icon: BookOpenText },
  { to: '/admin/settings', label: 'امنیت و تنظیمات', icon: Settings2 },
];

const pageNames = {
  '/admin': ['نمای کلی', 'خلاصه‌ای از وضعیت سایت و دسترسی‌های سریع'],
  '/admin/profile': ['اطلاعات صفحه‌ی اصلی', 'معرفی و مسیر حرفه‌ای‌تان را از اینجا مدیریت کنید'],
  '/admin/files': ['فایل‌های نمونه‌کار', 'فایل‌های قابل‌دریافت و عنوان بخش را مدیریت کنید'],
  '/admin/posts': ['مدیریت نوشته‌ها', 'پیش‌نویس‌ها، نوشته‌های منتشرشده و ویرایشگر فارسی'],
  '/admin/settings': ['امنیت و تنظیمات', 'مدیریت امن دسترسی به پنل مدیریت'],
};

export function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim(), password }),
      });
      localStorage.setItem('ravand_admin_token', result.access_token);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page" dir="rtl">
      <div className="login-layout">
        <section className="login-form-side">
          <Link to="/" className="login-brand"><span className="brand-mark">ر</span><span><strong>روند</strong><small>مدیریت نمونه‌کار</small></span></Link>
          <div className="login-form-wrap">
            <div className="login-icon"><LockKeyhole size={21} /></div>
            <span className="eyebrow">خوش برگشتید</span>
            <h1>ورود به پنل مدیریت</h1>
            <p className="login-subtitle">برای مدیریت صفحه‌ی شخصی و نوشته‌ها وارد شوید.</p>
            <form onSubmit={handleSubmit} className="login-form">
              <label className="field"><span>نام کاربری</span><input dir="ltr" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="admin" required /></label>
              <label className="field"><span>گذرواژه</span><input dir="ltr" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="گذرواژه‌ی شما" required /></label>
              {error && <div className="form-alert form-alert-error" role="alert">{error}</div>}
              <button className="button button-primary login-submit" type="submit" disabled={busy}>
                {busy ? <LoaderCircle className="spinner" size={17} /> : <span>ورود به پنل</span>}
                {!busy && <ArrowLeft size={17} />}
              </button>
            </form>
            <Link to="/" className="login-back"><ArrowDownLeft size={15} />بازگشت به وب‌سایت</Link>
          </div>
          <p className="login-legal">دسترسی این بخش فقط برای مدیر سایت مجاز است.</p>
        </section>
        <aside className="login-art-side">
          <div className="login-art-orbit login-orbit-one" /><div className="login-art-orbit login-orbit-two" />
          <div className="login-art-content">
            <div className="login-art-badge"><ShieldCheck size={15} />محیط مدیریت امن</div>
            <h2>فضایی برای ساختن<br /><em>روایت حرفه‌ای شما.</em></h2>
            <p>از یک پنل، همه‌چیز را به‌روز نگه دارید؛ از معرفی خودتان تا نوشته‌هایی که دوست دارید به اشتراک بگذارید.</p>
            <div className="login-mini-preview">
              <div className="mini-preview-top"><span className="mini-preview-dots"><i /><i /><i /></span><span>پیش‌نمایش صفحه</span><Globe2 size={15} /></div>
              <div className="mini-preview-content"><div className="mini-preview-avatar">ر</div><div><span className="mini-lines mini-line-long" /><span className="mini-lines mini-line-short" /><span className="mini-preview-cta" /></div></div>
              <div className="mini-preview-bottom"><span>شخصی، دقیق، همیشه به‌روز</span><Sparkles size={15} /></div>
            </div>
          </div>
          <span className="login-art-footer">یک تجربه‌ی فارسی، از ابتدا تا انتها</span>
        </aside>
      </div>
    </main>
  );
}

export function AdminShell() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const current = pageNames[location.pathname] || pageNames['/admin'];
  const { site } = useSite();

  function logout() {
    localStorage.removeItem('ravand_admin_token');
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-app" dir="rtl">
      <aside className={`admin-sidebar${mobileMenu ? ' admin-sidebar-open' : ''}`}>
        <Link className="admin-brand" to="/admin"><span className="brand-mark">ر</span><span><strong>روند</strong><small>مدیریت نمونه‌کار</small></span></Link>
        <div className="sidebar-label">فضای کاری</div>
        <nav className="admin-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setMobileMenu(false)} className={({ isActive }) => `admin-nav-link${isActive ? ' active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{label === 'مدیریت نوشته‌ها' && <span className="nav-count">مدیریت</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-help"><span className="help-icon"><CircleHelp size={17} /></span><strong>به راهنمایی نیاز دارید؟</strong><p>مستندات راه‌اندازی و نکته‌های کاربردی در دسترس شماست.</p><a href="https://github.com/" target="_blank" rel="noreferrer">مشاهده‌ی راهنما<ArrowUpLeft size={14} /></a></div>
        <div className="sidebar-bottom"><span className="sidebar-status-dot" /><span>سایت فعال و در دسترس</span></div>
      </aside>
      {mobileMenu && <button className="sidebar-scrim" onClick={() => setMobileMenu(false)} aria-label="بستن منو" />}
      <div className="admin-main-column">
        <header className="admin-topbar">
          <div className="admin-topbar-title"><button className="admin-mobile-menu" onClick={() => setMobileMenu((open) => !open)} aria-label="بازکردن منو"><Menu size={20} /></button><div><span className="admin-crumb">پنل مدیریت <span>/</span> {current[0]}</span><h1>{current[0]}</h1></div></div>
          <div className="admin-topbar-actions"><a className="preview-link" href="/" target="_blank" rel="noreferrer"><Eye size={16} /><span>مشاهده‌ی سایت</span><ExternalLink size={13} /></a><span className="topbar-divider" /><button className="admin-logout" onClick={logout}><LogOut size={16} /><span>خروج</span></button><span className="admin-user-avatar">{site?.name?.charAt(0) || 'م'}</span></div>
        </header>
        <main className="admin-content"><Outlet /></main>
        <footer className="admin-footer"><span>روند · فضای مدیریت شما</span><span>ساخته‌شده برای زبان فارسی <Sparkles size={13} /></span></footer>
      </div>
    </div>
  );
}

function AdminPageIntro({ title, description, action }) {
  return <div className="admin-page-intro"><div><h2>{title}</h2><p>{description}</p></div>{action}</div>;
}

export function AdminOverview() {
  const { site, refreshSite } = useSite();
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([request('/admin/posts'), site ? Promise.resolve(site) : refreshSite()])
      .then(([result]) => setAllPosts(result))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [refreshSite, site]);

  const published = allPosts.filter((post) => post.is_published).length;
  const drafts = allPosts.length - published;
  const metrics = [
    { label: 'کل نوشته‌ها', value: allPosts.length, icon: BookOpenText, color: 'mint', note: 'نوشته‌ی ثبت‌شده' },
    { label: 'منتشرشده', value: published, icon: Globe2, color: 'lavender', note: 'قابل‌مشاهده برای همه' },
    { label: 'پیش‌نویس‌ها', value: drafts, icon: Pencil, color: 'peach', note: 'در انتظار انتشار' },
    { label: 'فایل‌های نمونه‌کار', value: site?.files?.length || 0, icon: FileText, color: 'blue', note: 'برای دریافت و مشاهده' },
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="welcome-banner">
        <div className="welcome-content"><span className="welcome-kicker"><Sparkles size={15} />فضای شما، آماده‌ی روایت است</span><h2>روز بخیر، {site?.name?.split(' ')[0] || 'مدیر'} <span>👋</span></h2><p>صفحه‌ی شخصی‌تان را تازه نگه دارید؛ تغییرها بلافاصله روی وب‌سایت دیده می‌شوند.</p><Link to="/admin/profile" className="welcome-link">به‌روزرسانی صفحه‌ی اصلی<ArrowLeft size={16} /></Link></div>
        <div className="welcome-art"><div className="welcome-art-circle"><span>ر</span></div><div className="welcome-art-orbit" /><span className="welcome-art-spark spark-a">✳</span><span className="welcome-art-spark spark-b">✦</span><span className="welcome-art-caption">روایت شما، با جزئیات</span></div>
      </div>
      {error && <div className="form-alert form-alert-error">{error}</div>}
      <div className="dashboard-metrics">
        {metrics.map(({ label, value, icon: Icon, color, note }) => <div className="metric-card" key={label}><div className={`metric-icon ${color}`}><Icon size={18} /></div><div className="metric-number">{loading ? '—' : Number(value).toLocaleString('fa-IR')}</div><strong>{label}</strong><small>{note}</small></div>)}
      </div>
      <div className="dashboard-columns">
        <section className="admin-panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">آخرین فعالیت‌ها</span><h3>نوشته‌های شما</h3></div><Link to="/admin/posts" className="small-text-link">مدیریت همه<ArrowLeft size={15} /></Link></div>
          {loading ? <div className="panel-loading"><span className="spinner" />در حال دریافت نوشته‌ها…</div> : allPosts.length ? <div className="recent-post-list">{allPosts.slice(0, 4).map((post) => <div className="recent-post" key={post.id}><span className={`recent-post-icon ${post.is_published ? 'published' : ''}`}><MessageSquareText size={17} /></span><div className="recent-post-info"><strong>{post.title}</strong><span>{post.category} · <PersianDate date={post.created_at} /></span></div><span className={`status-badge ${post.is_published ? 'status-live' : 'status-draft'}`}><i />{post.is_published ? 'منتشرشده' : 'پیش‌نویس'}</span></div>)}</div> : <p className="empty-admin-copy">هنوز نوشته‌ای ندارید. اولین یادداشت‌تان را بسازید.</p>}
        </section>
        <section className="admin-panel quick-actions-panel"><div className="panel-heading"><div><span className="eyebrow">دسترسی سریع</span><h3>از کجا شروع کنیم؟</h3></div><span className="quick-spark"><Sparkles size={19} /></span></div>
          <div className="quick-actions"><Link to="/admin/profile" className="quick-action"><span className="quick-action-icon green"><UserRound size={18} /></span><span><strong>ویرایش معرفی من</strong><small>اطلاعات، مهارت‌ها و مسیر کاری</small></span><ArrowLeft size={16} /></Link><Link to="/admin/files" className="quick-action"><span className="quick-action-icon orange"><FilePlus2 size={18} /></span><span><strong>افزودن نمونه‌کار</strong><small>رزومه و فایل‌های منتخب شما</small></span><ArrowLeft size={16} /></Link><Link to="/admin/posts" className="quick-action"><span className="quick-action-icon blue"><Pencil size={18} /></span><span><strong>نوشتن یادداشت تازه</strong><small>ویرایشگر فارسی و انتشار نوشته</small></span><ArrowLeft size={16} /></Link></div>
        </section>
      </div>
      <div className="dashboard-tip"><span><Sparkles size={17} /></span><p><strong>یک پیشنهاد کوچک</strong> هر چند وقت یک‌بار رزومه، پیوندهای اجتماعی و نوشته‌های تازه‌تان را به‌روز کنید تا صفحه‌ی شما زنده بماند.</p><a href="/" target="_blank" rel="noreferrer">مشاهده‌ی صفحه<ArrowUpLeft size={15} /></a></div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder = '', type = 'text', help, dir, multiline = false, rows = 4, className = '', required = false, ...inputProps }) {
  return (
    <label className={`field${className ? ` ${className}` : ''}`}>
      <span>{label}{required && <i className="required-mark">*</i>}</span>
      {multiline ? <textarea rows={rows} value={value ?? ''} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} dir={dir} required={required} {...inputProps} /> : <input type={type} value={value ?? ''} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} dir={dir} required={required} {...inputProps} />}
      {help && <small className="field-helper">{help}</small>}
    </label>
  );
}

function SaveBar({ busy, onSave, label = 'ذخیره‌ی تغییرات' }) {
  return <button className="button button-primary save-button" type="submit" disabled={busy} onClick={onSave}>{busy ? <LoaderCircle className="spinner" size={17} /> : <Save size={17} />}{busy ? 'در حال ذخیره…' : label}</button>;
}

function UploadButton({ accept, label = 'بارگذاری فایل', icon: Icon = Upload, onUploaded }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setBusy(true);
    try {
      const result = await uploadAsset(file);
      await onUploaded(result, file);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  }
  return <span className="upload-control"><input ref={input} type="file" accept={accept} onChange={handleFile} hidden /><button type="button" className="button button-secondary upload-button" onClick={() => input.current?.click()} disabled={busy}>{busy ? <LoaderCircle className="spinner" size={16} /> : <Icon size={16} />}{busy ? 'در حال بارگذاری…' : label}</button>{error && <small className="upload-error">{error}</small>}</span>;
}

function PanelHeading({ icon: Icon, title, copy, action }) {
  return <div className="form-panel-heading"><span className="form-panel-icon"><Icon size={18} /></span><div><h3>{title}</h3>{copy && <p>{copy}</p>}</div>{action}</div>;
}

function RepeaterTitle({ number, title, onRemove }) {
  return <div className="repeater-title"><span className="repeater-number">{String(number).padStart(2, '۰')}</span><strong>{title || 'مورد تازه'}</strong><button type="button" className="icon-button danger-icon" onClick={onRemove} aria-label="حذف"><Trash2 size={16} /></button></div>;
}

export function ProfileEditor() {
  const { setSite } = useSite();
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    request('/admin/site').then(setDraft).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const patch = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const patchList = (field, index, key, value) => patch(field, (draft[field] || []).map((item, i) => i === index ? { ...item, [key]: value } : item));
  const add = (field, item) => patch(field, [...(draft[field] || []), item]);
  const remove = (field, index) => patch(field, (draft[field] || []).filter((_, i) => i !== index));

  async function save(event) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await request('/admin/site', { method: 'PUT', body: JSON.stringify(draft) });
      setDraft(result); setSite(result); setMessage('تغییرات با موفقیت ذخیره شد.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  if (loading) return <div className="admin-loading"><span className="spinner" />در حال دریافت اطلاعات…</div>;
  if (!draft) return <div className="form-alert form-alert-error">{error || 'اطلاعات صفحه بارگذاری نشد.'}</div>;

  return (
    <form className="admin-editor-page" onSubmit={save}>
      <AdminPageIntro title="روایت حرفه‌ای شما" description="اطلاعات این بخش در صفحه‌ی اصلی نمایش داده می‌شود. هر زمان بخواهید می‌توانید آن‌ها را تغییر دهید." action={<SaveBar busy={busy} />} />
      {message && <div className="form-alert form-alert-success"><Check size={17} />{message}</div>}
      {error && <div className="form-alert form-alert-error">{error}</div>}

      <section className="form-panel">
        <PanelHeading icon={UserRound} title="معرفی و تصویر" copy="اولین چیزی که مخاطب از صفحه‌ی شما می‌بیند." />
        <div className="profile-intro-grid">
          <div className="profile-avatar-card">
            <div className="profile-avatar-preview">{draft.avatar_url ? <img src={resolveAsset(draft.avatar_url)} alt="پیش‌نمایش تصویر" /> : <span>{draft.name?.charAt(0) || 'ر'}</span>}</div>
            <div><strong>تصویر پروفایل</strong><p>تصویر مربعی یا پرتره · JPG، PNG یا WebP</p><UploadButton accept=".jpg,.jpeg,.png,.webp" label="انتخاب تصویر" icon={ImagePlus} onUploaded={(result) => patch('avatar_url', result.url)} /></div>
          </div>
          <Field label="نشانی تصویر (اختیاری)" value={draft.avatar_url} onChange={(value) => patch('avatar_url', value)} placeholder="https://…" dir="ltr" className="field-ltr" />
        </div>
        <div className="form-grid">
          <Field label="نام و نام خانوادگی" value={draft.name} onChange={(value) => patch('name', value)} placeholder="نام شما" required />
          <Field label="عنوان شغلی" value={draft.role} onChange={(value) => patch('role', value)} placeholder="برای نمونه: طراح محصول و توسعه‌دهنده‌ی رابط کاربری" required />
          <Field label="عبارت معرفی کوتاه" value={draft.hero_label} onChange={(value) => patch('hero_label', value)} placeholder="سلام، من … هستم" />
          <Field label="پیام وضعیت همکاری" value={draft.availability} onChange={(value) => patch('availability', value)} placeholder="برای همکاری‌های تازه آماده‌ام" />
          <Field className="field-full" label="معرفی کوتاه صفحه‌ی اصلی" value={draft.tagline} onChange={(value) => patch('tagline', value)} placeholder="در یک یا دو جمله بگویید چه کاری انجام می‌دهید…" multiline rows={3} />
          <Field className="field-full" label="درباره‌ی من" value={draft.about} onChange={(value) => patch('about', value)} placeholder="داستان حرفه‌ای، رویکرد و علاقه‌مندی‌های‌تان…" multiline rows={5} />
        </div>
      </section>

      <section className="form-panel">
        <PanelHeading icon={Mail} title="راه‌های ارتباطی" copy="راه‌های ارتباطی شما در صفحه‌ی اصلی و بخش معرفی نمایش داده می‌شوند." />
        <div className="form-grid">
          <Field label="ایمیل" type="email" value={draft.email} onChange={(value) => patch('email', value)} placeholder="hello@example.com" dir="ltr" className="field-ltr" />
          <Field label="شماره‌ی تماس" value={draft.phone} onChange={(value) => patch('phone', value)} placeholder="+98 …" dir="ltr" className="field-ltr" />
          <Field label="شهر و کشور" value={draft.location} onChange={(value) => patch('location', value)} placeholder="تهران، ایران" />
          <Field label="وب‌سایت" value={draft.website} onChange={(value) => patch('website', value)} placeholder="example.com" dir="ltr" className="field-ltr" />
        </div>
        <div className="subsection-heading"><div><h4>پیوندهای اجتماعی</h4><p>لینک شبکه‌هایی که دوست دارید با مخاطبان به اشتراک بگذارید.</p></div><button type="button" className="button button-quiet button-small" onClick={() => add('social_links', { label: '', url: '', icon: '' })}><Plus size={15} />افزودن پیوند</button></div>
        <div className="repeater-list compact-repeater">
          {(draft.social_links || []).map((item, index) => <div className="repeater-card repeater-social" key={`social-${index}`}><RepeaterTitle number={index + 1} title={item.label || 'پیوند اجتماعی'} onRemove={() => remove('social_links', index)} /><div className="form-grid"><Field label="عنوان" value={item.label} onChange={(value) => patchList('social_links', index, 'label', value)} placeholder="لینکدین" /><Field label="نشانی" value={item.url} onChange={(value) => patchList('social_links', index, 'url', value)} placeholder="https://…" dir="ltr" className="field-ltr" /></div></div>)}
          {!draft.social_links?.length && <div className="repeater-empty">هنوز پیوندی اضافه نشده است.</div>}
        </div>
      </section>

      <section className="form-panel">
        <PanelHeading icon={BarChart3} title="چند نکته از مسیر شما" copy="آمارهای کوتاه کنار معرفی شما قرار می‌گیرند." />
        <div className="repeater-grid">
          {(draft.stats || []).map((item, index) => <div className="repeater-card" key={`stats-${index}`}><RepeaterTitle number={index + 1} title={item.label || 'نکته‌ی کوتاه'} onRemove={() => remove('stats', index)} /><div className="form-grid"><Field label="مقدار" value={item.value} onChange={(value) => patchList('stats', index, 'value', value)} placeholder="۸+" /><Field label="توضیح" value={item.label} onChange={(value) => patchList('stats', index, 'label', value)} placeholder="سال تجربه" /></div></div>)}
          <button type="button" className="add-repeater-card" onClick={() => add('stats', { value: '', label: '' })}><span><Plus size={19} /></span><strong>افزودن نکته</strong><small>مثل سال تجربه یا پروژه‌ها</small></button>
        </div>
      </section>

      <section className="form-panel">
        <PanelHeading icon={BriefcaseBusiness} title="تجربه‌های کاری" copy="از تازه‌ترین تجربه شروع کنید؛ ترتیب نمایش براساس همین فهرست است." />
        <div className="repeater-grid">
          {(draft.experiences || []).map((item, index) => <div className="repeater-card repeater-large" key={`experience-${index}`}><RepeaterTitle number={index + 1} title={item.title || 'تجربه‌ی کاری'} onRemove={() => remove('experiences', index)} /><div className="form-grid"><Field label="عنوان شغلی" value={item.title} onChange={(value) => patchList('experiences', index, 'title', value)} placeholder="طراح محصول" /><Field label="شرکت یا مجموعه" value={item.company} onChange={(value) => patchList('experiences', index, 'company', value)} placeholder="نام مجموعه" /><Field label="بازه‌ی زمانی" value={item.period} onChange={(value) => patchList('experiences', index, 'period', value)} placeholder="۱۴۰۱ — اکنون" /><Field className="field-full" label="شرح کوتاه" value={item.description} onChange={(value) => patchList('experiences', index, 'description', value)} placeholder="نقش و دستاوردهای اصلی…" multiline rows={3} /></div></div>)}
          <button type="button" className="add-repeater-card" onClick={() => add('experiences', { title: '', company: '', period: '', description: '' })}><span><Plus size={19} /></span><strong>افزودن تجربه</strong><small>نقش و دستاوردهای کاری</small></button>
        </div>
      </section>

      <section className="form-panel">
        <PanelHeading icon={GraduationCap} title="تحصیلات" copy="دوره‌ها و مدرک‌های مرتبط با مسیر حرفه‌ای‌تان." />
        <div className="repeater-grid">
          {(draft.education || []).map((item, index) => <div className="repeater-card repeater-large" key={`education-${index}`}><RepeaterTitle number={index + 1} title={item.title || 'دوره‌ی آموزشی'} onRemove={() => remove('education', index)} /><div className="form-grid"><Field label="مدرک یا دوره" value={item.title} onChange={(value) => patchList('education', index, 'title', value)} placeholder="کارشناسی ارشد طراحی" /><Field label="دانشگاه یا مؤسسه" value={item.place} onChange={(value) => patchList('education', index, 'place', value)} placeholder="نام مجموعه" /><Field label="بازه‌ی زمانی" value={item.period} onChange={(value) => patchList('education', index, 'period', value)} placeholder="۱۳۹۸ — ۱۴۰۰" /><Field className="field-full" label="توضیح کوتاه" value={item.description} onChange={(value) => patchList('education', index, 'description', value)} placeholder="تمرکز یا دستاورد مرتبط…" multiline rows={3} /></div></div>)}
          <button type="button" className="add-repeater-card" onClick={() => add('education', { title: '', place: '', period: '', description: '' })}><span><Plus size={19} /></span><strong>افزودن تحصیلات</strong><small>مدرک، دانشگاه یا دوره</small></button>
        </div>
      </section>

      <section className="form-panel">
        <PanelHeading icon={Sparkles} title="مهارت‌ها" copy="درصد هر مهارت فقط یک نمایش بصری است و نشان‌دهنده‌ی سطح رسمی نیست." />
        <div className="repeater-list skill-admin-list">
          {(draft.skills || []).map((item, index) => <div className="skill-admin-row" key={`skill-${index}`}><Field label="نام مهارت" value={item.name} onChange={(value) => patchList('skills', index, 'name', value)} placeholder="طراحی تجربه‌ی کاربری" /><label className="skill-range-field"><span>نمایش بصری <b>{Number(item.level || 0).toLocaleString('fa-IR')}٪</b></span><input type="range" min="0" max="100" value={item.level || 0} onChange={(event) => patchList('skills', index, 'level', Number(event.target.value))} /></label><button type="button" className="icon-button danger-icon" onClick={() => remove('skills', index)} aria-label="حذف مهارت"><Trash2 size={16} /></button></div>)}
          <button type="button" className="button button-quiet button-small add-inline" onClick={() => add('skills', { name: '', level: 70 })}><Plus size={15} />افزودن مهارت</button>
        </div>
      </section>

      <section className="form-panel">
        <PanelHeading icon={BookOpenText} title="تنظیمات وبلاگ" copy="عنوان و توضیح صفحه‌ی نوشته‌ها از اینجا قابل تغییر است." />
        <div className="form-grid">
          <Field className="field-full" label="عنوان صفحه‌ی وبلاگ" value={draft.blog_title} onChange={(value) => patch('blog_title', value)} placeholder="یادداشت‌هایی از مسیر" />
          <Field className="field-full" label="توضیح وبلاگ" value={draft.blog_description} onChange={(value) => patch('blog_description', value)} placeholder="درباره‌ی طراحی، ساخت محصول و چیزهایی که در مسیر یاد می‌گیریم." multiline rows={3} />
        </div>
      </section>
      <div className="form-bottom-actions"><span><ShieldCheck size={15} />تغییرات پس از ذخیره بلافاصله روی سایت اعمال می‌شوند.</span><SaveBar busy={busy} label="ذخیره‌ی همه‌ی تغییرات" /></div>
    </form>
  );
}

function fileIcon(file) {
  const extension = (file.filename || file.url || '').split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp'].includes(extension) ? FileImage : extension === 'zip' ? FileArchive : FileText;
}
function bytesLabel(bytes) {
  if (!bytes) return 'فایل پیوست‌شده';
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('fa-IR')} کیلوبایت` : `${(bytes / (1024 * 1024)).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت`;
}

export function FilesEditor() {
  const { setSite } = useSite();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    request('/admin/site').then(setForm).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const patchFile = (index, key, value) => setForm((current) => ({ ...current, files: current.files.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  async function save(event) {
    event.preventDefault(); setBusy(true); setError(''); setSuccess('');
    try {
      const result = await request('/admin/site', { method: 'PUT', body: JSON.stringify({ file_section_title: form.file_section_title, file_section_description: form.file_section_description, files: form.files }) });
      setForm((current) => ({ ...current, ...result })); setSite(result); setSuccess('بخش فایل‌های نمونه‌کار به‌روز شد.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function addFile(result, file) {
    setForm((current) => ({ ...current, files: [...(current.files || []), {
      title: file.name.replace(/\.[^.]+$/, ''), description: '', url: result.url,
      filename: result.filename, original_name: result.original_name, size: result.size,
      file_type: result.file_type,
    }] }));
    setSuccess('فایل بارگذاری شد؛ عنوان و توضیح آن را کامل کنید و تغییرات را ذخیره کنید.');
  }

  if (loading) return <div className="admin-loading"><span className="spinner" />در حال دریافت فایل‌ها…</div>;
  if (!form) return <div className="form-alert form-alert-error">{error || 'اطلاعات بارگذاری نشد.'}</div>;

  return (
    <form className="admin-editor-page" onSubmit={save}>
      <AdminPageIntro title="گالری فایل‌های منتخب" description="فایل‌ها در یک اسلایدر در صفحه‌ی اصلی نمایش داده می‌شوند. فایل‌های تازه را بارگذاری کنید و عنوان و توضیح مناسب برایشان بنویسید." action={<SaveBar busy={busy} />} />
      {success && <div className="form-alert form-alert-success"><Check size={17} />{success}</div>}{error && <div className="form-alert form-alert-error">{error}</div>}
      <section className="form-panel">
        <PanelHeading icon={Settings2} title="عنوان بخش" copy="عنوان و توضیح کوتاه بالای اسلایدر عمومی نمایش داده می‌شود." />
        <div className="form-grid"><Field className="field-full" label="عنوان" value={form.file_section_title} onChange={(value) => setForm((current) => ({ ...current, file_section_title: value }))} placeholder="چیزهایی برای دیدن و خواندن" /><Field className="field-full" label="توضیح" value={form.file_section_description} onChange={(value) => setForm((current) => ({ ...current, file_section_description: value }))} placeholder="رزومه، مطالعه‌های موردی و فایل‌های منتخب…" multiline rows={3} /></div>
      </section>
      <section className="form-panel">
        <div className="file-admin-heading"><PanelHeading icon={FileText} title={`فایل‌های شما (${(form.files || []).length.toLocaleString('fa-IR')})`} copy="هر فایل می‌تواند عنوان، توضیح و پیوند دریافت داشته باشد." /><UploadButton accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.odt,.xls,.xlsx,.ods,.ppt,.pptx,.txt,.csv,.zip" label="بارگذاری فایل" icon={Upload} onUploaded={addFile} /></div>
        <div className="admin-file-list">
          {(form.files || []).map((file, index) => {
            const Icon = fileIcon(file);
            return <article className="admin-file-card" key={`${file.filename || file.url}-${index}`}>
              <div className="admin-file-preview">{file.file_type === 'image' && file.url ? <img src={resolveAsset(file.url)} alt="" /> : <Icon size={25} />}</div>
              <div className="admin-file-details"><div className="admin-file-meta"><span>{(file.filename || file.original_name || '').split('.').pop()?.toUpperCase() || 'فایل'}</span><i />{bytesLabel(file.size)}</div><Field label="عنوان نمایشی" value={file.title} onChange={(value) => patchFile(index, 'title', value)} placeholder="عنوان فایل" required /><Field label="توضیح کوتاه" value={file.description} onChange={(value) => patchFile(index, 'description', value)} placeholder="این فایل شامل چیست؟" /><div className="admin-file-url" dir="ltr"><Link2 size={14} /><span>{file.url}</span><a href={resolveAsset(file.url)} target="_blank" rel="noreferrer" aria-label="مشاهده‌ی فایل"><ExternalLink size={13} /></a></div></div>
              <button type="button" className="icon-button danger-icon file-delete" onClick={() => setForm((current) => ({ ...current, files: current.files.filter((_, i) => i !== index) }))} aria-label="حذف فایل"><Trash2 size={17} /></button>
            </article>;
          })}
          {!(form.files || []).length && <div className="admin-files-empty"><div><FilePlus2 size={24} /></div><strong>هنوز فایلی بارگذاری نشده</strong><p>PDF رزومه، مطالعه‌ی موردی یا هر فایل مرتبط دیگری اضافه کنید.</p><UploadButton accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.odt,.xls,.xlsx,.ods,.ppt,.pptx,.txt,.csv,.zip" label="بارگذاری اولین فایل" onUploaded={addFile} /></div>}
        </div>
      </section>
      <div className="form-bottom-actions"><span><ShieldCheck size={15} />حداکثر حجم هر فایل ۲۵ مگابایت است.</span><SaveBar busy={busy} label="ذخیره‌ی تغییرات فایل‌ها" /></div>
    </form>
  );
}

function slugFromTitle(value) {
  return value.trim().toLocaleLowerCase('fa').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0, 280);
}

function emptyPost() {
  return { id: null, title: '', slug: '', excerpt: '', content: '<p></p>', category: 'یادداشت', cover_image: '', reading_minutes: 4, is_published: false };
}

export function BlogManager() {
  const { refreshPosts } = useSite();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('list');
  const [post, setPost] = useState(emptyPost());
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all');

  async function loadPosts() {
    setLoading(true);
    try { setPosts(await request('/admin/posts')); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadPosts(); }, []);

  const filteredPosts = useMemo(() => filter === 'all' ? posts : posts.filter((item) => filter === 'published' ? item.is_published : !item.is_published), [posts, filter]);
  const publishedCount = posts.filter((item) => item.is_published).length;

  function startNew() { setPost(emptyPost()); setSlugTouched(false); setError(''); setSuccess(''); setView('edit'); }
  function startEdit(item) { setPost({ ...item }); setSlugTouched(true); setError(''); setSuccess(''); setView('edit'); }
  function patch(key, value) {
    setPost((current) => ({ ...current, [key]: value, ...(key === 'title' && !slugTouched ? { slug: slugFromTitle(value) } : {}) }));
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    const payload = {
      title: post.title.trim(), slug: post.slug.trim() || slugFromTitle(post.title),
      excerpt: post.excerpt.trim(), content: post.content,
      category: post.category.trim() || 'یادداشت', cover_image: post.cover_image,
      reading_minutes: Number(post.reading_minutes) || 4, is_published: Boolean(post.is_published),
    };
    try {
      const result = await request(post.id ? `/admin/posts/${post.id}` : '/admin/posts', { method: post.id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      await loadPosts();
      await refreshPosts().catch(() => {});
      setPost(result); setSlugTouched(true); setView('list'); setSuccess(result.is_published ? 'نوشته ذخیره و منتشر شد.' : 'نوشته به‌عنوان پیش‌نویس ذخیره شد.');
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function togglePublished(item) {
    setError(''); setSuccess('');
    try {
      const updated = await request(`/admin/posts/${item.id}`, { method: 'PUT', body: JSON.stringify({ is_published: !item.is_published }) });
      setPosts((current) => current.map((row) => row.id === updated.id ? updated : row));
      await refreshPosts().catch(() => {});
      setSuccess(updated.is_published ? 'نوشته منتشر شد.' : 'نوشته به پیش‌نویس تبدیل شد.');
    } catch (err) { setError(err.message); }
  }

  async function deletePost(item) {
    if (!window.confirm(`نوشته‌ی «${item.title}» حذف شود؟ این کار قابل بازگشت نیست.`)) return;
    setError(''); setSuccess('');
    try {
      await request(`/admin/posts/${item.id}`, { method: 'DELETE' });
      setPosts((current) => current.filter((row) => row.id !== item.id));
      await refreshPosts().catch(() => {});
      setSuccess('نوشته حذف شد.');
    } catch (err) { setError(err.message); }
  }

  async function setCover(result) { patch('cover_image', result.url); }

  return (
    <div className="admin-editor-page posts-manager">
      <AdminPageIntro title={view === 'edit' ? (post.id ? 'ویرایش نوشته' : 'نوشتن یادداشت تازه') : 'همه‌ی نوشته‌ها'} description={view === 'edit' ? 'متن‌تان را با ویرایشگر راست‌چین بنویسید و قبل از انتشار پیش‌نمایش آن را ببینید.' : 'مقاله‌ها و یادداشت‌های وبلاگ را بنویسید، بازبینی و منتشر کنید.'} action={view === 'edit' ? <button className="button button-secondary" onClick={() => { setView('list'); setError(''); }}><ArrowLeft size={16} />بازگشت به فهرست</button> : <button className="button button-primary" onClick={startNew}><Plus size={17} />نوشته‌ی تازه</button>} />
      {success && <div className="form-alert form-alert-success"><Check size={17} />{success}</div>}{error && <div className="form-alert form-alert-error">{error}</div>}
      {view === 'edit' ? (
        <form className="post-editor-layout" onSubmit={save}>
          <div className="post-editor-main">
            <section className="form-panel post-main-panel">
              <Field label="عنوان نوشته" value={post.title} onChange={(value) => patch('title', value)} placeholder="عنوانی روشن و به‌یادماندنی…" required className="post-title-field" />
              <div className="slug-field"><span className="slug-prefix" dir="ltr">/blog/</span><Field label="نشانی نوشته" value={post.slug} onChange={(value) => { setSlugTouched(true); patch('slug', slugFromTitle(value)); }} placeholder="نشانی-نوشته" dir="ltr" className="field-ltr" help="برای پیوند کوتاه و خوانا از حروف فارسی یا لاتین استفاده کنید." /></div>
              <Field label="خلاصه‌ی نوشته" value={post.excerpt} onChange={(value) => patch('excerpt', value)} placeholder="در یک یا دو جمله بگویید این نوشته درباره‌ی چیست…" multiline rows={3} />
              <div className="editor-heading"><div><h3>متن نوشته</h3><p>جهت نوشتار راست‌به‌چپ است؛ متن را با ابزارهای قالب‌بندی ویرایش کنید.</p></div><span className="rtl-indicator">فارسی · راست‌چین</span></div>
              <RichTextEditor value={post.content} onChange={(value) => patch('content', value)} label="متن نوشته" helper="برای خوانایی بهتر، نوشته را به بخش‌های کوتاه تقسیم کنید." />
            </section>
          </div>
          <aside className="post-editor-sidebar">
            <section className="form-panel post-publish-panel"><PanelHeading icon={Globe2} title="وضعیت انتشار" />
              <label className={`publish-toggle${post.is_published ? ' is-published' : ''}`}><input type="checkbox" checked={Boolean(post.is_published)} onChange={(event) => patch('is_published', event.target.checked)} /><span className="toggle-track"><i /></span><span><strong>{post.is_published ? 'منتشرشده' : 'پیش‌نویس'}</strong><small>{post.is_published ? 'این نوشته برای همه قابل مشاهده است.' : 'این نوشته فقط در پنل مدیریت دیده می‌شود.'}</small></span></label>
              <Field label="دسته‌بندی" value={post.category} onChange={(value) => patch('category', value)} placeholder="طراحی محصول" />
              <Field label="زمان مطالعه (دقیقه)" type="number" min="1" max="90" value={post.reading_minutes} onChange={(value) => patch('reading_minutes', value)} />
              <button type="submit" className="button button-primary post-save-button" disabled={saving}>{saving ? <LoaderCircle className="spinner" size={17} /> : <Save size={17} />}{saving ? 'در حال ذخیره…' : post.is_published ? 'ذخیره و انتشار' : 'ذخیره‌ی پیش‌نویس'}</button>
            </section>
            <section className="form-panel cover-panel"><PanelHeading icon={ImagePlus} title="تصویر روی جلد" copy="تصویر افقی با نسبت ۱۶:۹ نتیجه‌ی بهتری دارد." />
              {post.cover_image ? <div className="cover-upload-preview"><img src={resolveAsset(post.cover_image)} alt="پیش‌نمایش جلد" /><button type="button" className="icon-button danger-icon" onClick={() => patch('cover_image', '')} aria-label="حذف تصویر جلد"><Trash2 size={16} /></button></div> : <div className="cover-empty"><ImagePlus size={23} /><span>بدون تصویر جلد</span><small>از طرح پیش‌فرض استفاده می‌شود</small></div>}
              <UploadButton accept=".jpg,.jpeg,.png,.webp" label={post.cover_image ? 'جایگزینی تصویر' : 'بارگذاری تصویر'} icon={Upload} onUploaded={setCover} />
              <Field label="یا نشانی تصویر" value={post.cover_image} onChange={(value) => patch('cover_image', value)} placeholder="https://…" dir="ltr" className="field-ltr" />
            </section>
          </aside>
        </form>
      ) : (
        <>
          <div className="posts-toolbar"><div className="post-filter-tabs"><button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>همه <span>{posts.length.toLocaleString('fa-IR')}</span></button><button className={filter === 'published' ? 'selected' : ''} onClick={() => setFilter('published')}>منتشرشده <span>{publishedCount.toLocaleString('fa-IR')}</span></button><button className={filter === 'draft' ? 'selected' : ''} onClick={() => setFilter('draft')}>پیش‌نویس <span>{(posts.length - publishedCount).toLocaleString('fa-IR')}</span></button></div><div className="posts-toolbar-note"><ShieldCheck size={15} />نوشته‌های پیش‌نویس در سایت نمایش داده نمی‌شوند.</div></div>
          {loading ? <div className="admin-loading"><span className="spinner" />در حال دریافت نوشته‌ها…</div> : filteredPosts.length ? <div className="admin-post-list">{filteredPosts.map((item) => <article className="admin-post-row" key={item.id}><div className="admin-post-cover">{item.cover_image ? <img src={resolveAsset(item.cover_image)} alt="" /> : <span><BookOpenText size={21} /></span>}</div><div className="admin-post-info"><div className="admin-post-meta"><span>{item.category}</span><i /><PersianDate date={item.created_at} /></div><h3>{item.title}</h3><p>{item.excerpt || 'برای این نوشته هنوز خلاصه‌ای وارد نشده است.'}</p><div className="admin-post-submeta"><Clock3 size={13} />{Number(item.reading_minutes || 4).toLocaleString('fa-IR')} دقیقه مطالعه <span />{item.is_published ? <Link to={`/blog/${encodeURIComponent(item.slug)}`} target="_blank">مشاهده‌ی نوشته<ExternalLink size={12} /></Link> : <span className="draft-hint">هنوز منتشر نشده</span>}</div></div><span className={`status-badge ${item.is_published ? 'status-live' : 'status-draft'}`}><i />{item.is_published ? 'منتشرشده' : 'پیش‌نویس'}</span><div className="admin-post-actions"><button type="button" className="icon-button" onClick={() => startEdit(item)} title="ویرایش"><Pencil size={16} /></button><button type="button" className={`icon-button ${item.is_published ? 'unpublish-icon' : 'publish-icon'}`} onClick={() => togglePublished(item)} title={item.is_published ? 'انتقال به پیش‌نویس' : 'انتشار'}>{item.is_published ? <Globe2 size={16} /> : <ArrowUpLeft size={16} />}</button><button type="button" className="icon-button danger-icon" onClick={() => deletePost(item)} title="حذف"><Trash2 size={16} /></button></div></article>)}</div> : <div className="empty-posts admin-empty-posts"><div><BookOpenText size={25} /></div><strong>نوشته‌ای در این فهرست نیست</strong><p>یک نوشته‌ی تازه بسازید یا فیلتر دیگری انتخاب کنید.</p><button className="button button-primary" onClick={startNew}><Plus size={16} />نوشتن یادداشت تازه</button></div>}
        </>
      )}
    </div>
  );
}

export function SettingsEditor() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function changePassword(event) {
    event.preventDefault();
    setError(''); setSuccess('');
    if (newPassword.length < 12) {
      setError('گذرواژه‌ی تازه باید دست‌کم ۱۲ نویسه داشته باشد.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('گذرواژه‌ی تازه و تکرار آن یکسان نیستند.');
      return;
    }
    setBusy(true);
    try {
      await request('/auth/password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setSuccess('گذرواژه با موفقیت تغییر کرد.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const apiUrl = getApiBase();
  return (
    <div className="admin-editor-page settings-page">
      <AdminPageIntro title="امنیت حساب مدیر" description="گذرواژه‌ی پنل را به‌روز نگه دارید و پیکربندی اتصال سایت را بررسی کنید." />
      {success && <div className="form-alert form-alert-success"><Check size={17} />{success}</div>}
      {error && <div className="form-alert form-alert-error">{error}</div>}
      <div className="settings-grid">
        <section className="form-panel">
          <PanelHeading icon={LockKeyhole} title="تغییر گذرواژه" copy="برای امنیت بیشتر از یک گذرواژه‌ی منحصربه‌فرد استفاده کنید." />
          <form className="password-change-form" onSubmit={changePassword}>
            <Field label="گذرواژه‌ی فعلی" type="password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" required />
            <Field label="گذرواژه‌ی تازه" type="password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" help="حداقل ۱۲ نویسه." required />
            <Field label="تکرار گذرواژه‌ی تازه" type="password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" required />
            <button className="button button-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle size={17} className="spinner" /> : <ShieldCheck size={17} />}{busy ? 'در حال به‌روزرسانی…' : 'ذخیره‌ی گذرواژه‌ی تازه'}</button>
          </form>
        </section>
        <section className="form-panel api-settings-panel">
          <PanelHeading icon={Globe2} title="اتصال وب‌سایت به API" copy="نشانی API از متغیر محیطی زمان اجرا خوانده می‌شود." />
          <div className="api-url-preview"><span className="api-connection-dot" /><div><small>API URL فعال</small><strong dir="ltr">{apiUrl}</strong></div><span className="api-ok">پیکربندی‌شده</span></div>
          <div className="settings-info"><span><CircleHelp size={16} /></span><p>برای تغییر نشانی، مقدار <code>API_URL</code> را در فایل <code>.env</code> یا تنظیمات محیط استقرار تغییر دهید و کانتینر وب را دوباره راه‌اندازی کنید. مقدار پیش‌فرض <code>/api</code> از پراکسی داخلی Docker Compose استفاده می‌کند.</p></div>
          <div className="settings-security-note"><ShieldCheck size={16} /><span>نشست مدیریت با توکن امضاشده و زمان‌دار محافظت می‌شود.</span></div>
        </section>
      </div>
    </div>
  );
}
