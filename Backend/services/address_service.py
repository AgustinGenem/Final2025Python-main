
"""Address service for CRUD operations."""
from sqlalchemy.orm import Session
from typing import List
from models.address import AddressModel
from repositories.address_repository import AddressRepository
from schemas import AddressSchema
from services.base_service_impl import BaseServiceImpl


class AddressService(BaseServiceImpl):
    def __init__(self, db: Session):
        super().__init__(
            repository_class=AddressRepository,
            model=AddressModel,
            schema=AddressSchema,
            db=db
        )

    def get_by_client_id(self, client_id: int, skip: int = 0, limit: int = 100) -> List[AddressSchema]:
        """
        Get all addresses for a specific client.
        """
        return self.repository.get_by_client_id(client_id=client_id, skip=skip, limit=limit)
