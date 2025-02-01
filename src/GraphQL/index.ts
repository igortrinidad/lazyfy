export const mapArrayToGraphQL = (array: any[], key: string | null = null) => {
  const items = array.map((item) => `"${ key ? item[key] : item }"`).join(',')
  return `[${ items }]`
}


export const GraphQLHelpers = {
  mapArrayToGraphQL
}