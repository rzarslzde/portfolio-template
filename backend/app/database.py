import os
from collections.abc import Generator

from sqlalchemy import URL, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# DATABASE_URL is useful for local development and managed database providers.
# Compose uses URL.create from individual fields so special characters in the
# database password do not need to be escaped inside a URL string.
_database_url = os.getenv("DATABASE_URL")
if _database_url:
    engine = create_engine(_database_url, pool_pre_ping=True)
else:
    engine = create_engine(
        URL.create(
            drivername="postgresql+psycopg",
            username=os.getenv("DB_USER", "portfolio"),
            password=os.getenv("DB_PASSWORD", "portfolio-dev-password"),
            host=os.getenv("DB_HOST", "db"),
            port=int(os.getenv("DB_PORT", "5432")),
            database=os.getenv("DB_NAME", "portfolio"),
        ),
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
