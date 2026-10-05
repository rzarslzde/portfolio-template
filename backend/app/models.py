from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class SiteProfile(Base):
    __tablename__ = "site_profile"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    name: Mapped[str] = mapped_column(String(160), default="", nullable=False)
    role: Mapped[str] = mapped_column(String(220), default="", nullable=False)
    hero_label: Mapped[str] = mapped_column(String(220), default="", nullable=False)
    tagline: Mapped[str] = mapped_column(String(700), default="", nullable=False)
    about: Mapped[str] = mapped_column(Text, default="", nullable=False)
    availability: Mapped[str] = mapped_column(String(220), default="", nullable=False)
    location: Mapped[str] = mapped_column(String(180), default="", nullable=False)
    email: Mapped[str] = mapped_column(String(240), default="", nullable=False)
    phone: Mapped[str] = mapped_column(String(80), default="", nullable=False)
    website: Mapped[str] = mapped_column(String(240), default="", nullable=False)
    avatar_url: Mapped[str] = mapped_column(String(600), default="", nullable=False)
    stats: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    social_links: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    education: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    experiences: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    skills: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    file_section_title: Mapped[str] = mapped_column(String(220), default="", nullable=False)
    file_section_description: Mapped[str] = mapped_column(String(700), default="", nullable=False)
    files: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    blog_title: Mapped[str] = mapped_column(String(220), default="", nullable=False)
    blog_description: Mapped[str] = mapped_column(String(700), default="", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(260), nullable=False)
    slug: Mapped[str] = mapped_column(String(300), unique=True, index=True, nullable=False)
    excerpt: Mapped[str] = mapped_column(String(700), default="", nullable=False)
    content: Mapped[str] = mapped_column(Text, default="", nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="یادداشت", nullable=False)
    cover_image: Mapped[str] = mapped_column(String(600), default="", nullable=False)
    reading_minutes: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(300), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
