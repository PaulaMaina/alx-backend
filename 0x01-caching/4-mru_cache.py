#!/usr/bin/env python3
"""MRUCache Class"""
from base_caching import BaseCaching
from collections import OrderedDict


class MRUCache(BaseCaching):
    """Inherits from BaseCaching and is a caching system"""
    def __init__(self):
        """Initializes the class"""
        super().__init__()
        self.cache_data = OrderedDict()

    def put(self, key, item):
        """Assigns item value to the cache_data dictionary"""
        if key is None or item is None:
            return

        if key not in self.cache_data:
            if len(self.cache_data) + 1 > BaseCaching.MAX_ITEMS:
                mru_key, _ = self.cache_data.popitem(False)
                print(f"DISCARD: {mru_key}")
            self.cache_data[key] = item
            self.cache_data.move_to_end(key, last=False)
        else:
            self.cache_data[key] = item

    def get(self, key):
        """Returns the value in selfl.cache_data linked to key"""
        if key is not None and key in self.cache_data:
            self.cache_data.move_to_end(key, last=False)
        return self.cache_data.get(key, None)
