export interface Genre {
  id_genre: number;
  name_genre: string;
  igdb_genre_id?: number;
  igdb_slug?: string;
  status?: boolean;
}

export interface Manufacturer {
  id_manufacturer: number;
  name_manufacturer: string;
  status?: boolean;
}

export interface Console {
  id_console: number;
  name_console: string;
  manufacturer_id?: number;
  manufacturer?: Manufacturer;
  status?: boolean;
}
