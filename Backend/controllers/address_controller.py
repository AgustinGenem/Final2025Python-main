"""Address controller with proper dependency injection."""
from typing import Optional, List
from fastapi import Depends
from sqlalchemy.orm import Session

from controllers.base_controller_impl import BaseControllerImpl
from schemas import AddressSchema
from services.address_service import AddressService
from config.database import get_db


class AddressController(BaseControllerImpl):
    """Controller for Address entity with CRUD operations."""

    def __init__(self):
        super().__init__(
            schema=AddressSchema,
            service_factory=lambda db: AddressService(db),
            tags=["Addresses"]
        )

        # Override the get_all route to add client_id filtering
        @self.router.get("", response_model=List[AddressSchema])
        def get_all(
            client_id: Optional[int] = None,
            skip: int = 0,
            limit: int = 100,
            db: Session = Depends(get_db)
        ):
            """
            Get all addresses, with optional filtering by client_id.
            """
            service = self.service_factory(db)
            if client_id is not None:
                return service.get_by_client_id(client_id=client_id, skip=skip, limit=limit)
            return service.get_all(skip=skip, limit=limit)