import { RegexHelpers } from "../../src"

test('Extract uuids v4 from string', () => {
  const text = "Here's a UUID v4 tag: e77f4e76-5435-48e5-a49d-50d5429b3655 and fd9ed62f-87fb-4a45-b9aa-ef554a7e6cb7 and 54fce589-be4e-4aa8-95a4-d3df809a52e1"
  expect(RegexHelpers.extractUuidsV4(text).length).toBe(3)
})

test('Extract uuids v7 from string', () => {
  const text = "Here's a UUID v7 tag: 01956430-f3b7-7e4a-8f3c-1a2b3c4d5e6f and 01956430-f3b7-7e4b-9f3c-1a2b3c4d5e6f and 01956430-f3b7-7e4c-af3c-1a2b3c4d5e6f"
  expect(RegexHelpers.extractUuidsV7(text).length).toBe(3)
})

test('Extract uuids v7 does not match v4 uuids', () => {
  const text = "UUID v4: e77f4e76-5435-48e5-a49d-50d5429b3655"
  expect(RegexHelpers.extractUuidsV7(text).length).toBe(0)
})

test('Extract uuids v4 does not match v7 uuids', () => {
  const text = "UUID v7: 01956430-f3b7-7e4a-8f3c-1a2b3c4d5e6f"
  expect(RegexHelpers.extractUuidsV4(text).length).toBe(0)
})