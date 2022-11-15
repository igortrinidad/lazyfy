export interface BookInterface {
  id: string
  title: string
  category: string
}

export const books: BookInterface[] = [
  { id: '1', title: 'Clean Code', category: 'Programming' },
  { id: '2', title: 'Clean Archtecture', category: 'Programming' },
  { id: '3', title: 'How to become bilionaire writting js libraries', category: 'Self help' },
]

export const fruits: string[] = ['strawberry', 'watermelon', 'pineapple']