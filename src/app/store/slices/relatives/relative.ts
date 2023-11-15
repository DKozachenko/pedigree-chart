export interface IRelative {
  key: number,
  name: string,
  lastName: string,
  middleName: string,
  s: "F" | "M",
  m?: number,
  f?: number,
  // TODO: переделать на просто массив
  ux?: number[] | number,
  // TODO: переделать на просто массив
  vir?: number[] | number
}