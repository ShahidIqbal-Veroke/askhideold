// localStorage Database System for Demo
// Provides CRUD operations with TypeScript safety

export class LocalStorageDB {
  private static instance: LocalStorageDB;
  
  static getInstance(): LocalStorageDB {
    if (!LocalStorageDB.instance) {
      LocalStorageDB.instance = new LocalStorageDB();
    }
    return LocalStorageDB.instance;
  }

  // Generic CRUD operations
  create<T extends { id: string }>(table: string, data: T): T {
    const items = this.getAll<T>(table);
    items.push(data);
    this.save(table, items);
    return data;
  }

  getAll<T>(table: string): T[] {
    const data = localStorage.getItem(`hedi_${table}`);
    return data ? JSON.parse(data) : [];
  }

  getById<T extends { id: string }>(table: string, id: string): T | null {
    const items = this.getAll<T>(table);
    return items.find(item => item.id === id) || null;
  }

  update<T extends { id: string }>(table: string, id: string, updates: Partial<T>): T | null {
    const items = this.getAll<T>(table);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    this.save(table, items);
    return items[index];
  }

  delete(table: string, id: string): boolean {
    const items = this.getAll(table);
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) return false;
    
    this.save(table, filteredItems);
    return true;
  }

  query<T>(table: string, predicate: (item: T) => boolean): T[] {
    const items = this.getAll<T>(table);
    return items.filter(predicate);
  }

  save<T>(table: string, data: T[]): void {
    localStorage.setItem(`hedi_${table}`, JSON.stringify(data));
  }

  clear(table: string): void {
    localStorage.removeItem(`hedi_${table}`);
  }

  clearAll(): void {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('hedi_'));
    keys.forEach(key => localStorage.removeItem(key));
  }

  // Relationship helpers
  getByField<T>(table: string, field: string, value: any): T[] {
    const items = this.getAll<T>(table);
    return items.filter(item => (item as any)[field] === value);
  }

  // Bulk operations
  bulkCreate<T extends { id: string }>(table: string, items: T[]): T[] {
    const existingItems = this.getAll<T>(table);
    const newItems = [...existingItems, ...items];
    this.save(table, newItems);
    return items;
  }

  // Search functionality
  search<T>(table: string, searchTerm: string, fields: string[]): T[] {
    const items = this.getAll<T>(table);
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return items.filter(item => 
      fields.some(field => {
        const value = (item as any)[field];
        return value && value.toString().toLowerCase().includes(lowerSearchTerm);
      })
    );
  }

  // Pagination
  paginate<T>(table: string, page: number, limit: number): { data: T[], total: number, totalPages: number } {
    const items = this.getAll<T>(table);
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const data = items.slice(startIndex, startIndex + limit);
    
    return { data, total, totalPages };
  }

  // Statistics
  count(table: string): number {
    return this.getAll(table).length;
  }

  // Data validation
  exists(table: string, id: string): boolean {
    return this.getById(table, id) !== null;
  }
}

export const db = LocalStorageDB.getInstance();