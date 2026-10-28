import os
import json
import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Text,
    Integer,
    DateTime,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from .config import DATABASE_URL

logger = logging.getLogger("agent_office.database")

# Handle SQLite vs PostgreSQL connect_args
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AgentDB(Base):
    """Database model for storing customizable employee agents."""
    __tablename__ = "agents"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    title = Column(String(150), nullable=False)
    department = Column(String(100), nullable=False)
    avatar = Column(String(50), nullable=False)
    color = Column(String(20), nullable=False)
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=False)
    personality = Column(Text, nullable=True)
    level = Column(Integer, default=5)
    status = Column(String(50), default="READY")
    skills = Column(Text, default="[]")
    model = Column(String(100), default="default")
    effort = Column(String(50), default="medium")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self) -> Dict[str, Any]:
        try:
            skill_list = json.loads(self.skills) if self.skills else []
        except Exception:
            skill_list = []

        return {
            "id": self.id,
            "name": self.name,
            "title": self.title,
            "department": self.department,
            "avatar": self.avatar,
            "color": self.color,
            "tagline": self.tagline or "",
            "description": self.description or "",
            "system_prompt": self.system_prompt or "",
            "personality": self.personality or "",
            "level": self.level or 5,
            "status": self.status or "READY",
            "skills": skill_list,
            "model": self.model or "default",
            "effort": self.effort or "medium",
        }


def get_db():
    """FastAPI database dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def migrate_db():
    """Ensures new columns exist in the database without destroying existing data."""
    try:
        with engine.connect() as conn:
            if DATABASE_URL.startswith("sqlite"):
                cursor = conn.connection.cursor()
                cursor.execute("PRAGMA table_info(agents)")
                columns = [col[1] for col in cursor.fetchall()]
                if "skills" not in columns:
                    cursor.execute("ALTER TABLE agents ADD COLUMN skills TEXT DEFAULT '[]'")
                if "model" not in columns:
                    cursor.execute("ALTER TABLE agents ADD COLUMN model VARCHAR(100) DEFAULT 'default'")
                if "effort" not in columns:
                    cursor.execute("ALTER TABLE agents ADD COLUMN effort VARCHAR(50) DEFAULT 'medium'")
                conn.connection.commit()
    except Exception as e:
        logger.warning(f"Database migration note: {e}")


def init_db():
    """Initializes tables, migrates missing columns, and seeds default roles if empty."""
    Base.metadata.create_all(bind=engine)
    migrate_db()
    seed_default_agents()


def seed_default_agents():
    """Seeds default agents from roles metadata if table is empty, and backfills missing default skills."""
    from .roles import DEFAULT_ROLES_METADATA, DEFAULT_SYSTEM_PROMPTS, DEFAULT_SKILLS_AND_TRAITS, AgentRole

    db = SessionLocal()
    try:
        count = db.query(AgentDB).count()
        if count == 0:
            for role_enum, info in DEFAULT_ROLES_METADATA.items():
                role_id = role_enum.value
                traits = DEFAULT_SKILLS_AND_TRAITS.get(role_enum, {})
                agent = AgentDB(
                    id=role_id,
                    name=info.name,
                    title=info.title,
                    department=info.department,
                    avatar=info.avatar,
                    color=info.color,
                    tagline=info.tagline,
                    description=info.description,
                    system_prompt=DEFAULT_SYSTEM_PROMPTS.get(role_enum, ""),
                    personality=traits.get("personality", "Professional, diligent, and collaborative."),
                    level=traits.get("level", 5),
                    status="READY",
                    skills=json.dumps(traits.get("skills", [])),
                    model=traits.get("model", "default"),
                    effort=traits.get("effort", "medium"),
                )
                db.add(agent)
            db.commit()
        else:
            # Backfill default skills if any existing row has empty skills
            existing_agents = db.query(AgentDB).all()
            updated_any = False
            for agent in existing_agents:
                if not agent.skills or agent.skills == "[]":
                    try:
                        role_enum = AgentRole(agent.id)
                        default_skills = DEFAULT_SKILLS_AND_TRAITS.get(role_enum, {}).get("skills", [])
                        if default_skills:
                            agent.skills = json.dumps(default_skills)
                            updated_any = True
                    except ValueError:
                        pass
            if updated_any:
                db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding agents database: {e}")
    finally:
        db.close()


def db_get_all_agents() -> List[Dict[str, Any]]:
    """Fetches all agents from database."""
    db = SessionLocal()
    try:
        agents = db.query(AgentDB).all()
        return [a.to_dict() for a in agents]
    finally:
        db.close()


def db_get_agent(agent_id: str) -> Optional[Dict[str, Any]]:
    """Fetches a specific agent by ID."""
    db = SessionLocal()
    try:
        agent = db.query(AgentDB).filter(AgentDB.id == agent_id).first()
        return agent.to_dict() if agent else None
    finally:
        db.close()


def db_update_agent(agent_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Updates an agent's attributes and system prompt in the database."""
    db = SessionLocal()
    try:
        agent = db.query(AgentDB).filter(AgentDB.id == agent_id).first()
        if not agent:
            return None

        if "name" in updates and updates["name"] is not None:
            agent.name = updates["name"]
        if "title" in updates and updates["title"] is not None:
            agent.title = updates["title"]
        if "department" in updates and updates["department"] is not None:
            agent.department = updates["department"]
        if "avatar" in updates and updates["avatar"] is not None:
            agent.avatar = updates["avatar"]
        if "color" in updates and updates["color"] is not None:
            agent.color = updates["color"]
        if "tagline" in updates and updates["tagline"] is not None:
            agent.tagline = updates["tagline"]
        if "description" in updates and updates["description"] is not None:
            agent.description = updates["description"]
        if "system_prompt" in updates and updates["system_prompt"] is not None:
            agent.system_prompt = updates["system_prompt"]
        if "personality" in updates and updates["personality"] is not None:
            agent.personality = updates["personality"]
        if "level" in updates and updates["level"] is not None:
            agent.level = updates["level"]
        if "status" in updates and updates["status"] is not None:
            agent.status = updates["status"]
        if "skills" in updates and updates["skills"] is not None:
            agent.skills = json.dumps(updates["skills"])
        if "model" in updates and updates["model"] is not None:
            agent.model = updates["model"]
        if "effort" in updates and updates["effort"] is not None:
            agent.effort = updates["effort"]

        db.commit()
        db.refresh(agent)

        # Sync in-memory ROLES_METADATA cache
        from .roles import sync_roles_metadata_from_db
        sync_roles_metadata_from_db()

        return agent.to_dict()
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating agent {agent_id}: {e}")
        return None
    finally:
        db.close()


def db_reset_agent(agent_id: str) -> Optional[Dict[str, Any]]:
    """Resets an agent back to its factory default template."""
    from .roles import DEFAULT_ROLES_METADATA, DEFAULT_SYSTEM_PROMPTS, DEFAULT_SKILLS_AND_TRAITS, AgentRole

    try:
        role_enum = AgentRole(agent_id)
    except ValueError:
        return None

    default_info = DEFAULT_ROLES_METADATA.get(role_enum)
    default_prompt = DEFAULT_SYSTEM_PROMPTS.get(role_enum)
    default_traits = DEFAULT_SKILLS_AND_TRAITS.get(role_enum, {})

    if not default_info or not default_prompt:
        return None

    return db_update_agent(
        agent_id,
        {
            "name": default_info.name,
            "title": default_info.title,
            "department": default_info.department,
            "avatar": default_info.avatar,
            "color": default_info.color,
            "tagline": default_info.tagline,
            "description": default_info.description,
            "system_prompt": default_prompt,
            "personality": default_traits.get("personality", "Professional, diligent, and collaborative."),
            "level": default_traits.get("level", 5),
            "status": "READY",
            "skills": default_traits.get("skills", []),
            "model": default_traits.get("model", "default"),
            "effort": default_traits.get("effort", "medium"),
        },
    )
