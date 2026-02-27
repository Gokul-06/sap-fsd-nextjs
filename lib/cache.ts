/**
 * LRU Cache with TTL — O(1) get/put using Doubly-Linked List + HashMap
 *
 * Data Structures:
 *   - HashMap (Map<K, Node>) for O(1) key lookup
 *   - Doubly-Linked List for O(1) eviction of least-recently-used entries
 *   - Each node stores value + expiry timestamp for TTL support
 *
 * Complexity:
 *   get()  → O(1)
 *   set()  → O(1)
 *   evict  → O(1) — removes tail of linked list
 */

interface CacheNode<K, V> {
  key: K;
  value: V;
  expiresAt: number;
  prev: CacheNode<K, V> | null;
  next: CacheNode<K, V> | null;
}

export class LRUCache<K, V> {
  private map: Map<K, CacheNode<K, V>>;
  private head: CacheNode<K, V> | null = null; // Most recently used
  private tail: CacheNode<K, V> | null = null; // Least recently used
  private maxSize: number;
  private ttlMs: number;

  constructor(options: { maxSize: number; ttlMs: number }) {
    this.map = new Map();
    this.maxSize = options.maxSize;
    this.ttlMs = options.ttlMs;
  }

  /**
   * Get value by key — O(1)
   * Returns undefined if key doesn't exist or is expired
   */
  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;

    // Check TTL expiry
    if (Date.now() > node.expiresAt) {
      this.removeNode(node);
      this.map.delete(key);
      return undefined;
    }

    // Move to head (most recently used)
    this.moveToHead(node);
    return node.value;
  }

  /**
   * Set key-value pair — O(1)
   * Evicts LRU entry if at capacity
   */
  set(key: K, value: V, customTtlMs?: number): void {
    const existing = this.map.get(key);

    if (existing) {
      // Update existing node
      existing.value = value;
      existing.expiresAt = Date.now() + (customTtlMs ?? this.ttlMs);
      this.moveToHead(existing);
      return;
    }

    // Create new node
    const node: CacheNode<K, V> = {
      key,
      value,
      expiresAt: Date.now() + (customTtlMs ?? this.ttlMs),
      prev: null,
      next: null,
    };

    this.map.set(key, node);
    this.addToHead(node);

    // Evict LRU if over capacity
    if (this.map.size > this.maxSize) {
      this.evictLRU();
    }
  }

  /**
   * Check if key exists and is not expired — O(1)
   */
  has(key: K): boolean {
    const node = this.map.get(key);
    if (!node) return false;
    if (Date.now() > node.expiresAt) {
      this.removeNode(node);
      this.map.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete a key — O(1)
   */
  delete(key: K): boolean {
    const node = this.map.get(key);
    if (!node) return false;
    this.removeNode(node);
    this.map.delete(key);
    return true;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.map.clear();
    this.head = null;
    this.tail = null;
  }

  /**
   * Current number of entries (including potentially expired)
   */
  get size(): number {
    return this.map.size;
  }

  // ─── Doubly-Linked List Operations (all O(1)) ────────────────

  private addToHead(node: CacheNode<K, V>): void {
    node.prev = null;
    node.next = this.head;

    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }
  }

  private removeNode(node: CacheNode<K, V>): void {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    node.prev = null;
    node.next = null;
  }

  private moveToHead(node: CacheNode<K, V>): void {
    if (node === this.head) return;
    this.removeNode(node);
    this.addToHead(node);
  }

  private evictLRU(): void {
    if (!this.tail) return;
    const evicted = this.tail;
    this.removeNode(evicted);
    this.map.delete(evicted.key);
  }
}

// ─── Pre-built Cache Instances ──────────────────────────────────

/** Classification results — keyed by text hash, TTL 1 hour */
export const classifyCache = new LRUCache<string, unknown>({
  maxSize: 500,
  ttlMs: 60 * 60 * 1000, // 1 hour
});

/** Feedback rules — keyed by module:processArea, TTL 5 minutes */
export const feedbackRulesCache = new LRUCache<string, unknown>({
  maxSize: 100,
  ttlMs: 5 * 60 * 1000, // 5 minutes
});

/** Template listings — keyed by filter combo, TTL 1 minute */
export const templateCache = new LRUCache<string, unknown>({
  maxSize: 50,
  ttlMs: 60 * 1000, // 1 minute
});

/** Document extraction — keyed by SHA-256 hash, TTL 24 hours */
export const documentCache = new LRUCache<string, unknown>({
  maxSize: 200,
  ttlMs: 24 * 60 * 60 * 1000, // 24 hours
});

/** CALM projects — keyed by "projects", TTL 2 minutes */
export const calmCache = new LRUCache<string, unknown>({
  maxSize: 50,
  ttlMs: 2 * 60 * 1000, // 2 minutes
});

// ─── Utility: Hash function for cache keys ──────────────────────

/**
 * Simple string hash for cache keys (FNV-1a variant)
 * Not cryptographic — just fast and well-distributed
 */
export function hashString(str: string): string {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime, keep as uint32
  }
  return hash.toString(36);
}
