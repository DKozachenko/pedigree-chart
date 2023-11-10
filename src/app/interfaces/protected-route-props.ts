export interface IProtectedRouteProps {
  condition: boolean,
  redirectPath: string,
  children: JSX.Element | JSX.Element[]
}