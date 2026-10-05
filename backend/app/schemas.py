from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class SiteProfileOut(ORMModel):
    id: int
    name: str
    role: str
    hero_label: str
    tagline: str
    about: str
    availability: str
    location: str
    email: str
    phone: str
    website: str
    avatar_url: str
    stats: list[dict[str, Any]]
    social_links: list[dict[str, Any]]
    education: list[dict[str, Any]]
    experiences: list[dict[str, Any]]
    skills: list[dict[str, Any]]
    file_section_title: str
    file_section_description: str
    files: list[dict[str, Any]]
    blog_title: str
    blog_description: str
    updated_at: datetime


class SiteProfileUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    hero_label: str | None = None
    tagline: str | None = None
    about: str | None = None
    availability: str | None = None
    location: str | None = None
    email: str | None = None
    phone: str | None = None
    website: str | None = None
    avatar_url: str | None = None
    stats: list[dict[str, Any]] | None = None
    social_links: list[dict[str, Any]] | None = None
    education: list[dict[str, Any]] | None = None
    experiences: list[dict[str, Any]] | None = None
    skills: list[dict[str, Any]] | None = None
    file_section_title: str | None = None
    file_section_description: str | None = None
    files: list[dict[str, Any]] | None = None
    blog_title: str | None = None
    blog_description: str | None = None


class AdminLogin(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=200)


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class AdminPasswordUpdate(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_password: str = Field(min_length=12, max_length=200)


class BlogPostOut(ORMModel):
    id: int
    title: str
    slug: str
    excerpt: str
    content: str
    category: str
    cover_image: str
    reading_minutes: int
    is_published: bool
    created_at: datetime
    updated_at: datetime


class BlogPostCreate(BaseModel):
    title: str = Field(min_length=1, max_length=260)
    slug: str | None = Field(default=None, max_length=300)
    excerpt: str = Field(default="", max_length=700)
    content: str = ""
    category: str = Field(default="یادداشت", max_length=100)
    cover_image: str = Field(default="", max_length=600)
    reading_minutes: int = Field(default=4, ge=1, le=90)
    is_published: bool = False


class BlogPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=260)
    slug: str | None = Field(default=None, max_length=300)
    excerpt: str | None = Field(default=None, max_length=700)
    content: str | None = None
    category: str | None = Field(default=None, max_length=100)
    cover_image: str | None = Field(default=None, max_length=600)
    reading_minutes: int | None = Field(default=None, ge=1, le=90)
    is_published: bool | None = None


class UploadResponse(BaseModel):
    url: str
    filename: str
    original_name: str
    size: int
    file_type: str
