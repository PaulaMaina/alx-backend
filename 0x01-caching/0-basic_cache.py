#!/usr/bin/env python3
"""BasicCache Class"""
from base_caching import BaseCaching


class BasicCache(BaseCaching):
    """Inherits from BaseCaching and is a caching system"""
    def put(self, key, item):
        """Assigns item value to the cache_data dictionary"""
        if key is not None and item is not None:
            self.cache_data[key] = item

    def get(self, key):
        """Returns the value in selfl.cache_data linked to key"""
        return self.cache_data.get(key, None)
