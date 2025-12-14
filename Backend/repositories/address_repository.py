"""Address repository for database operations."""
from sqlalchemy.orm import Session
from typing import List, Type
from models.address import AddressModel
from repositories.base_repository_impl import BaseRepositoryImpl
from schemas import AddressSchema


class AddressRepository(BaseRepositoryImpl):
    """Repository for Address entity database operations."""

    def __init__(self, db: Session):
        super().__init__(AddressModel, AddressSchema, db)

    def get_by_client_id(self, client_id: int, skip: int = 0, limit: int = 100) -> List[Type[AddressModel]]:
        """
        Get all addresses for a specific client from the database.
        """
        return self.db.query(self.model).filter(self.model.client_id == client_id).offset(skip).limit(limit).all()
