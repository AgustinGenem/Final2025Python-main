"""Product repository for database operations."""
from typing import List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select

from models.product import ProductModel
from repositories.base_repository_impl import BaseRepositoryImpl
from schemas import ProductSchema


class ProductRepository(BaseRepositoryImpl):
    """Repository for Product entity database operations."""

    def __init__(self, db: Session):
        super().__init__(ProductModel, ProductSchema, db)

    def find_all(self, skip: int = 0, limit: int = 100) -> List[ProductSchema]:
        """
        Find all products with pagination and eagerly load categories.

        Overrides base method to implement eager loading for the 'category'
        relationship to prevent lazy loading issues during serialization.
        """
        from config.constants import PaginationConfig

        # Basic input validation from base class
        if skip < 0:
            raise ValueError("skip parameter must be >= 0")
        if limit < PaginationConfig.MIN_LIMIT:
            raise ValueError(
                f"limit parameter must be >= {PaginationConfig.MIN_LIMIT}"
            )
        if limit > PaginationConfig.MAX_LIMIT:
            limit = PaginationConfig.MAX_LIMIT

        # Eager load the 'category' relationship using joinedload
        stmt = (
            select(self.model)
            .options(joinedload(self.model.category))
            .offset(skip)
            .limit(limit)
        )
        
        models = self.session.scalars(stmt).unique().all()
        return [self.schema.model_validate(model) for model in models]