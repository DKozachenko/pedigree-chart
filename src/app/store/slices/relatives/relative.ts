export interface IRelative {
  key: number,
  name: string,
  lastName: string,
  middleName: string,
  gender: "F" | "M",
  motherKey?: number,
  fatherKey?: number,
  wifeKeys?: number[],
  husbandKeys?: number[]
}