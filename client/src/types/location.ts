
export interface Drop {
  exp: number;
  money: number;
  items?: string[]; // IDs of items
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  hp: number;
  image: string;
  drops: Drop;
}

export interface Zone {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  monsters: string[]; // IDs of monsters
  connectedTo: string[]; // IDs of cities or other zones
}
