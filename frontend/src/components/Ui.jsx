import { ArrowDownLeft, ArrowLeft, ArrowUpLeft, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LoadingScreen({ label = 'در حال بارگذاری…' }) {
  return (
    <div className="loading-screen" dir="rtl">
      <div className="loading-brand"><span className="brand-mark">ر</span> روند</div>
      <LoaderCircle size={25} className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function SectionIntro({ eyebrow, title, copy, link, linkText = 'همه‌ی نوشته‌ها' }) {
  return (
    <div className="section-intro">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {link && <Link className="text-link" to={link}>{linkText}<ArrowUpLeft size={17} /></Link>}
    </div>
  );
}

export function PersianDate({ date, className = '' }) {
  if (!date) return null;
  const formatted = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date(date));
  return <time className={className} dateTime={date}>{formatted}</time>;
}

export function BackLink({ to = '/', children = 'بازگشت به صفحه‌ی اصلی' }) {
  return <Link className="back-link" to={to}><ArrowLeft size={16} />{children}</Link>;
}
