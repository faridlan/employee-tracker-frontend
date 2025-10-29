export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  products?: Product[];
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}
