import { Figure } from './figure.type'

export interface IDiagramConfig {
  male: {
    figureType: Figure,
    figureBackgroundColor: string
  },
  female: {
    figureType: Figure,
    figureBackgroundColor: string
  },
  figureSize: number,
  figureBorderColor: string,
  linkColor: string,
  mariageLinkColor: string,
  label: {
    textColor: string,
    backgroundColor: string,
    borderColor: string
  }
  selectedNodeColor: string
}