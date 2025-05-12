from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Text
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .core import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)  # 👈 Agregado

    created_objectives = relationship("TrainObjective", back_populates="creator")
    created_completions = relationship("Completion", back_populates="creator")


class TrainObjective(Base):
    __tablename__ = 'train_objectives'

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(120), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    creator = relationship("User", back_populates="created_objectives")

    completions = relationship("Completion", back_populates="train_objective")
    training_jobs = relationship("TrainingJob", back_populates="train_objective")


class Completion(Base):
    __tablename__ = 'completions'

    id = Column(Integer, primary_key=True)
    prompt = Column(Text, nullable=False)
    output = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    train_objective_id = Column(Integer, ForeignKey("train_objectives.id"), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    train_objective = relationship("TrainObjective", back_populates="completions")
    creator = relationship("User", back_populates="created_completions")


class TrainingJob(Base):
    __tablename__ = 'training_jobs'

    id = Column(Integer, primary_key=True)
    model_from = Column(String, nullable=False)
    status = Column(String, default="queued", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    train_objective_id = Column(Integer, ForeignKey("train_objectives.id"), nullable=False)
    train_objective = relationship("TrainObjective", back_populates="training_jobs")
