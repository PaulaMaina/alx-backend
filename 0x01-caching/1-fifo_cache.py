#!/usr/bin/env python3
"""FIFOCache Class"""
from base_caching import BaseCaching
from collections import OrderedDict


class FIFOCache(BaseCaching):
    """Inherits from BaseCaching and is a caching system"""
    def __init__(self):
        super().__init__()
        self.cache_data = OrderedDict()

    def put(self, key, item):
        """Assigns item value to the cache_data dictionary"""
        if key is None or item is None:
            return

        if len(self.cache_data) > BaseCaching.MAX_ITEMS:
            first_key, _ = self.cache_data.popitem(last=False)
            print(f"DISCARD: {first_key}")

        self.cache_data[key] = item

    def get(self, key):
        """Returns the value in selfl.cache_data linked to key"""
        return self.cache_data.get(key, None)
