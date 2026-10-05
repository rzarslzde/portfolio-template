import os
import re
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import bleach
from bleach.css_sanitizer import CSSSanitizer
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine, get_db
from .models import AdminUser, BlogPost, SiteProfile, utc_now
from .schemas import (
    AdminLogin,
    AdminLoginResponse,
    AdminPasswordUpdate,
    BlogPostCreate,
    BlogPostOut,
    BlogPostUpdate,
    SiteProfileOut,
    SiteProfileUpdate,
    UploadResponse,
)
from .security import create_access_token, get_current_admin, hash_password, verify_password

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(Path(__file__).resolve().parent.parent / "uploads")))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Ravand Portfolio API",
    description="API for a Persian-first, editable portfolio and blog.",
    version="1.0.0",
)

origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

_ALLOWED_TAGS = set(bleach.sanitizer.ALLOWED_TAGS) | {
    "p", "h1", "h2", "h3", "h4", "blockquote", "ul", "ol", "li",
    "strong", "em", "s", "del", "hr", "br", "pre", "code",
}
_ALLOWED_ATTRIBUTES = {
    "a": ["href", "title", "target", "rel"],
    "p": ["style"],
    "h1": ["style"],
    "h2": ["style"],
    "h3": ["style"],
    "blockquote": ["style"],
}
_CSS_SANITIZER = CSSSanitizer(allowed_css_properties=["text-align"])
_ALLOWED_EXTENSIONS = {
    ".pdf", ".png", ".jpg", ".jpeg", ".webp", ".doc", ".docx", ".odt",
    ".xls", ".xlsx", ".ods", ".ppt", ".pptx", ".txt", ".csv", ".zip",
}
_MAX_UPLOAD_BYTES = 25 * 1024 * 1024
_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}


def clean_rich_text(value: str) -> str:
    return bleach.clean(
        value,
        tags=_ALLOWED_TAGS,
        attributes=_ALLOWED_ATTRIBUTES,
        protocols={"http", "https", "mailto"},
        strip=True,
        css_sanitizer=_CSS_SANITIZER,
    )


def make_slug(title: str) -> str:
    slug = re.sub(r"[^\w]+", "-", title.strip().lower(), flags=re.UNICODE).strip("-_")
    return slug[:280] or f"post-{uuid.uuid4().hex[:10]}"


def seed_initial_content() -> None:
    db = SessionLocal()
    try:
        if db.query(SiteProfile).filter(SiteProfile.id == 1).first() is None:
            profile = SiteProfile(
                id=1,
                name="آوا نادری",
                role="طراح محصول و توسعه‌دهنده‌ی رابط کاربری",
                hero_label="سلام، من آوا هستم",
                tagline="به آدم‌ها کمک می‌کنم با تجربه‌های دیجیتال ساده، فکرشده و در دسترس ارتباط بهتری با فناوری داشته باشند.",
                about=(
                    "من یک طراح محصول و توسعه‌دهنده‌ی فرانت‌اند هستم که در نقطه‌ی تلاقیِ طراحی، "
                    "فناوری و نیازهای واقعی آدم‌ها کار می‌کنم. در سال‌های گذشته با تیم‌های کوچک و "
                    "بزرگ همراه بوده‌ام تا ایده‌های پیچیده را به محصول‌هایی روشن و قابل استفاده تبدیل کنیم. "
                    "به جزئیات اهمیت می‌دهم، اما همیشه تصویر بزرگ‌تر را هم در نظر دارم."
                ),
                availability="برای همکاری‌های تازه آماده‌ام",
                location="تهران، ایران",
                email="hello@avanaderi.ir",
                phone="+98 912 345 6789",
                website="avanaderi.ir",
                avatar_url="",
                stats=[
                    {"value": "۸+", "label": "سال تجربه"},
                    {"value": "۲۴", "label": "پروژه‌ی انجام‌شده"},
                    {"value": "۱۲", "label": "مقاله‌ی منتشرشده"},
                ],
                social_links=[
                    {"label": "لینکدین", "url": "https://linkedin.com/", "icon": "linkedin"},
                    {"label": "گیت‌هاب", "url": "https://github.com/", "icon": "github"},
                    {"label": "اینستاگرام", "url": "https://instagram.com/", "icon": "instagram"},
                ],
                education=[
                    {
                        "title": "کارشناسی ارشد طراحی صنعتی",
                        "place": "دانشگاه هنر تهران",
                        "period": "۱۳۹۴ — ۱۳۹۶",
                        "description": "تمرکز بر طراحی انسان‌محور و روش‌های پژوهش تجربه‌ی کاربری.",
                    },
                    {
                        "title": "کارشناسی مهندسی کامپیوتر",
                        "place": "دانشگاه علم و صنعت ایران",
                        "period": "۱۳۹۰ — ۱۳۹۴",
                        "description": "آشنایی عمیق با مبانی نرم‌افزار و ساخت محصول‌های دیجیتال.",
                    },
                ],
                experiences=[
                    {
                        "title": "طراح ارشد محصول",
                        "company": "استودیو هزاردستان",
                        "period": "۱۴۰۱ — اکنون",
                        "description": "هدایت تجربه‌ی محصول از پژوهش و ایده‌پردازی تا طراحی نهایی و همراهی با تیم توسعه.",
                    },
                    {
                        "title": "طراح محصول و توسعه‌دهنده‌ی فرانت‌اند",
                        "company": "راهکارهای ابری آبان",
                        "period": "۱۳۹۷ — ۱۴۰۱",
                        "description": "طراحی و پیاده‌سازی داشبوردهای سازمانی با تمرکز بر دسترس‌پذیری و زبان فارسی.",
                    },
                    {
                        "title": "طراح رابط کاربری",
                        "company": "آژانس دیجیتال آبانگان",
                        "period": "۱۳۹۵ — ۱۳۹۷",
                        "description": "ساخت تجربه‌های یکپارچه‌ی وب و موبایل برای کسب‌وکارهای نوپا.",
                    },
                ],
                skills=[
                    {"name": "طراحی تجربه‌ی کاربری", "level": 92},
                    {"name": "طراحی رابط کاربری", "level": 88},
                    {"name": "React و فرانت‌اند", "level": 82},
                    {"name": "پژوهش محصول", "level": 78},
                    {"name": "سیستم‌های طراحی", "level": 86},
                ],
                file_section_title="چیزهایی برای دیدن و خواندن",
                file_section_description="رزومه، مطالعه‌های موردی و فایل‌هایی که بخشی از مسیر کاری من را روایت می‌کنند.",
                files=[],
                blog_title="یادداشت‌هایی از مسیر",
                blog_description="درباره‌ی طراحی، ساخت محصول و چیزهایی که در مسیر یاد می‌گیریم.",
            )
            db.add(profile)

        if db.query(AdminUser).filter(AdminUser.username == os.getenv("ADMIN_USERNAME", "admin")).first() is None:
            db.add(
                AdminUser(
                    username=os.getenv("ADMIN_USERNAME", "admin"),
                    password_hash=hash_password(os.getenv("ADMIN_PASSWORD", "change-me-now")),
                )
            )

        if db.query(BlogPost).count() == 0:
            now = datetime.now(timezone.utc)
            demo_posts = [
                {
                    "title": "چرا زبان فارسی باید از روز اول در طراحی محصول باشد؟",
                    "slug": "persian-first-product-design",
                    "excerpt": "پشتیبانی از فارسی فقط راست‌چین‌کردن صفحه نیست؛ یک نگاه کامل به زبان، فرهنگ و شیوه‌ی استفاده‌ی آدم‌هاست.",
                    "category": "طراحی محصول",
                    "reading_minutes": 5,
                    "days_ago": 4,
                    "content": """
<p>وقتی از تجربه‌ی فارسی‌زبان حرف می‌زنیم، معمولاً اولین چیزی که به ذهن می‌رسد راست‌چین‌کردن صفحه است. اما زبان فقط جهت حرکت چشم نیست؛ زبان، شکل فکرکردن و ارتباط‌گرفتن ما با محصول را هم می‌سازد.</p>
<h2>راست‌چین‌بودن، نقطه‌ی شروع است</h2>
<p>چیدمان راست‌به‌چپ باید از ابتدا در ساختار محصول دیده شود: از ترتیب منوها و آیکن‌ها تا رفتار فیلدهای فرم، نمایش تاریخ و ترکیب متن فارسی و لاتین. اگر این موضوع را به انتهای پروژه موکول کنیم، معمولاً با وصله‌هایی روبه‌رو می‌شویم که تجربه را ناهماهنگ می‌کنند.</p>
<blockquote><p>یک محصول خوب ترجمه نمی‌شود؛ برای آدم‌هایی که از آن استفاده می‌کنند طراحی می‌شود.</p></blockquote>
<h2>جزئیات کوچک، تفاوت بزرگ</h2>
<p>انتخاب قلم خوانا، فاصله‌گذاری درست، استفاده‌ی آگاهانه از اعداد فارسی و امکان نوشتن واژه‌های انگلیسی در متن راست‌چین، همگی روی احساس راحتی کاربر اثر دارند. این‌ها جزئیات تزئینی نیستند؛ بخشی از کیفیت محصول‌اند.</p>
<p>بهترین زمان برای فکرکردن به زبان فارسی، همان روز اول است؛ وقتی هنوز می‌توانیم تصمیم‌های درست را ساده و طبیعی بگیریم.</p>
""",
                },
                {
                    "title": "رزومه‌ی خوب، فهرست کارها نیست",
                    "slug": "a-resume-is-a-story",
                    "excerpt": "چطور با انتخاب درست جزئیات، مسیری روشن از تجربه‌ها و توانایی‌هایمان بسازیم؟",
                    "category": "مسیر شغلی",
                    "reading_minutes": 4,
                    "days_ago": 12,
                    "content": """
<p>رزومه قرار نیست تمام زندگی حرفه‌ای ما را در چند صفحه جا بدهد. کار رزومه این است که به مخاطب کمک کند خیلی زود بفهمد چه مسئله‌هایی را حل می‌کنیم و در چه مسیری رشد کرده‌ایم.</p>
<h2>از نتیجه بگویید، نه فقط از وظیفه</h2>
<p>به‌جای نوشتن یک فهرست طولانی از مسئولیت‌ها، درباره‌ی تغییری حرف بزنید که ایجاد کرده‌اید. چه چیزی پس از همکاری شما بهتر شد؟ از چه داده‌ای برای ارزیابی آن استفاده کردید؟ اگر عدد دقیقی ندارید، یک مثال روشن هم می‌تواند تصویر خوبی بسازد.</p>
<ul><li>هر تجربه را با یک جمله‌ی روشن معرفی کنید.</li><li>جزئیاتی را نگه دارید که به فرصت بعدی مربوط‌اند.</li><li>برای خواندن آسان، به فضای خالی و سلسله‌مراتب بصری اهمیت دهید.</li></ul>
<p>رزومه‌ی خوب تصویری صادقانه و منسجم از شماست؛ نه نمایشی پرزرق‌وبرق از همه‌چیزهایی که تا امروز انجام داده‌اید.</p>
""",
                },
                {
                    "title": "سیستم طراحی؛ زبان مشترک تیم‌های محصول",
                    "slug": "design-system-shared-language",
                    "excerpt": "یک سیستم طراحی زمانی ارزشمند است که تصمیم‌گیری را آسان‌تر کند، نه این‌که فقط کتابخانه‌ای از کامپوننت‌ها باشد.",
                    "category": "طراحی و توسعه",
                    "reading_minutes": 6,
                    "days_ago": 23,
                    "content": """
<p>سیستم طراحی را می‌شود مثل یک زبان مشترک دید؛ زبانی که کمک می‌کند طراح، توسعه‌دهنده و مدیر محصول درباره‌ی تجربه‌ای که می‌سازند دقیق‌تر گفت‌وگو کنند.</p>
<h2>از مسئله شروع کنید</h2>
<p>ساختن کامپوننت‌ها وسوسه‌برانگیز است، اما پیش از آن باید بفهمیم چه چیزی قرار است ساده‌تر شود. آیا تیم‌ها تصمیم مشابهی را چند بار می‌گیرند؟ آیا محصول‌ها از نظر بصری از هم دور شده‌اند؟ پاسخ روشن به این سؤال‌ها مسیر سیستم را تعیین می‌کند.</p>
<h2>کمتر، اما قابل استفاده‌تر</h2>
<p>یک مجموعه‌ی کوچک از الگوهای مستند و پرکاربرد، از کتابخانه‌ای بزرگ که کسی به آن سر نمی‌زند ارزشمندتر است. هر جزء باید مثال واقعی، محدودیت‌ها و دلیل وجودش را داشته باشد.</p>
<p>سیستم طراحی محصول نهایی نیست؛ ابزاری زنده است که با یادگیری تیم تغییر می‌کند و رشد می‌کند.</p>
""",
                },
            ]
            for item in demo_posts:
                db.add(
                    BlogPost(
                        title=item["title"],
                        slug=item["slug"],
                        excerpt=item["excerpt"],
                        content=clean_rich_text(item["content"]),
                        category=item["category"],
                        reading_minutes=item["reading_minutes"],
                        is_published=True,
                        created_at=now - timedelta(days=item["days_ago"]),
                        updated_at=now - timedelta(days=item["days_ago"]),
                    )
                )
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    seed_initial_content()


@app.get("/api/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@app.get("/api/public/site", response_model=SiteProfileOut)
def get_public_site(db: Session = Depends(get_db)) -> SiteProfile:
    profile = db.query(SiteProfile).filter(SiteProfile.id == 1).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="اطلاعات سایت پیدا نشد.")
    return profile


@app.get("/api/public/posts", response_model=list[BlogPostOut])
def get_public_posts(db: Session = Depends(get_db)) -> list[BlogPost]:
    return (
        db.query(BlogPost)
        .filter(BlogPost.is_published.is_(True))
        .order_by(BlogPost.created_at.desc(), BlogPost.id.desc())
        .all()
    )


@app.get("/api/public/posts/{slug}", response_model=BlogPostOut)
def get_public_post(slug: str, db: Session = Depends(get_db)) -> BlogPost:
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.is_published.is_(True)).first()
    if post is None:
        raise HTTPException(status_code=404, detail="این نوشته پیدا نشد.")
    return post


@app.post("/api/auth/login", response_model=AdminLoginResponse)
def login(payload: AdminLogin, db: Session = Depends(get_db)) -> AdminLoginResponse:
    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="نام کاربری یا گذرواژه نادرست است.")
    return AdminLoginResponse(access_token=create_access_token(user.username), username=user.username)


@app.get("/api/auth/me")
def current_admin(admin: AdminUser = Depends(get_current_admin)) -> dict[str, str]:
    return {"username": admin.username}


@app.post("/api/auth/password")
def update_admin_password(
    payload: AdminPasswordUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin),
) -> dict[str, str]:
    if not verify_password(payload.current_password, admin.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="گذرواژه‌ی فعلی درست نیست.")
    admin.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "گذرواژه با موفقیت تغییر کرد."}


@app.get("/api/admin/site", response_model=SiteProfileOut)
def get_admin_site(
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
) -> SiteProfile:
    profile = db.query(SiteProfile).filter(SiteProfile.id == 1).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="اطلاعات سایت پیدا نشد.")
    return profile


@app.put("/api/admin/site", response_model=SiteProfileOut)
def update_site(
    payload: SiteProfileUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
) -> SiteProfile:
    profile = db.query(SiteProfile).filter(SiteProfile.id == 1).first()
    if profile is None:
        raise HTTPException(status_code=404, detail="اطلاعات سایت پیدا نشد.")
    for key, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(profile, key, value)
    profile.updated_at = utc_now()
    db.commit()
    db.refresh(profile)
    return profile


@app.get("/api/admin/posts", response_model=list[BlogPostOut])
def get_admin_posts(
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
) -> list[BlogPost]:
    return db.query(BlogPost).order_by(BlogPost.created_at.desc(), BlogPost.id.desc()).all()


@app.post("/api/admin/posts", response_model=BlogPostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    payload: BlogPostCreate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
) -> BlogPost:
    values = payload.model_dump()
    values["slug"] = make_slug(values.get("slug") or values["title"])
    values["content"] = clean_rich_text(values["content"])
    post = BlogPost(**values)
    db.add(post)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="این نشانی قبلاً برای نوشته‌ی دیگری استفاده شده است.") from error
    db.refresh(post)
    return post


@app.put("/api/admin/posts/{post_id}", response_model=BlogPostOut)
def update_post(
    post_id: int,
    payload: BlogPostUpdate,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
) -> BlogPost:
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="نوشته پیدا نشد.")
    values: dict[str, Any] = payload.model_dump(exclude_unset=True)
    if "title" in values and "slug" not in values:
        values["slug"] = make_slug(values["title"])
    if values.get("slug"):
        values["slug"] = make_slug(values["slug"])
    if "content" in values and values["content"] is not None:
        values["content"] = clean_rich_text(values["content"])
    for key, value in values.items():
        if value is not None:
            setattr(post, key, value)
    post.updated_at = utc_now()
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=409, detail="این نشانی قبلاً برای نوشته‌ی دیگری استفاده شده است.") from error
    db.refresh(post)
    return post


@app.delete("/api/admin/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    _admin: AdminUser = Depends(get_current_admin),
) -> None:
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="نوشته پیدا نشد.")
    db.delete(post)
    db.commit()


@app.post("/api/admin/uploads", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    _admin: AdminUser = Depends(get_current_admin),
) -> UploadResponse:
    original_name = Path(file.filename or "file").name
    extension = Path(original_name).suffix.lower()
    if extension not in _ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=415, detail="این نوع فایل پشتیبانی نمی‌شود.")

    stored_name = f"{uuid.uuid4().hex}{extension}"
    destination = UPLOAD_DIR / stored_name
    size = 0
    try:
        with destination.open("wb") as output:
            while True:
                chunk = await file.read(1024 * 1024)
                if not chunk:
                    break
                size += len(chunk)
                if size > _MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="حجم فایل باید کمتر از ۲۵ مگابایت باشد.")
                output.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    return UploadResponse(
        url=f"/uploads/{stored_name}",
        filename=stored_name,
        original_name=original_name,
        size=size,
        file_type="image" if extension in _IMAGE_EXTENSIONS else "document",
    )
