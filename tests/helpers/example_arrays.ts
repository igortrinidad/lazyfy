export interface BookInterface {
  id: string
  title: string
  category: string
}

export const books: BookInterface[] = [
  { id: '1', title: 'Clean Code', category: 'Programming' },
  { id: '2', title: 'Clean Archtecture', category: 'Programming' },
  { id: '3', title: 'How to become bilionaire writting js libraries', category: 'Self help' },
  { id: '4', title: 'Refactor', category: 'Programming' },
  { id: '5', title: 'The Pragmatic Programmer: Your Journey to Mastery', category: 'Programming' },
  { id: '6', title: 'Design Patterns: Elements of Reusable Object-Oriented Software', category: 'Programming' },
  { id: '7', title: 'Structure and Interpretation of Computer Programs', category: 'Programming' },
  { id: '8', title: 'Scrum', category: 'Programming' },
]

export const fruits: string[] = ['strawberry', 'watermelon', 'pineapple']


export const building_stocks = [
  {
      "jurisdiction_id": 2,
      "climate_zone_prefix": 2,
      "type_prototype_id": 1,
      "year": 2024,
      "construction_implementation_type_id": 1,
      "units": 20,
      "building_height_id": 1,
      "growth_rate": 0.79
  },
  {
      "jurisdiction_id": 2,
      "climate_zone_prefix": 2,
      "type_prototype_id": 1,
      "year": 2025,
      "construction_implementation_type_id": 1,
      "units": 68,
      "building_height_id": 2,
      "growth_rate": 0.79
  },
  {
      "jurisdiction_id": 3,
      "climate_zone_prefix": 3,
      "type_prototype_id": 69,
      "year": 2023,
      "construction_implementation_type_id": 2,
      "units": 500,
      "building_height_id": null,
      "growth_rate": 0
  },
  {
      "jurisdiction_id": 3,
      "climate_zone_prefix": 3,
      "type_prototype_id": 1,
      "year": 2023,
      "construction_implementation_type_id": 1,
      "units": 66,
      "building_height_id": 2,
      "growth_rate": 0.79
  },
]