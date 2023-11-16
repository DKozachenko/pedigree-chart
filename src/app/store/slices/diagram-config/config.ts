import { createSlice } from '@reduxjs/toolkit'
import { State } from '../../store';
import { IDiagramConfig } from './diagram-config';

export const diagramConfigSlice = createSlice({
  name: 'relatives',
  initialState: <IDiagramConfig>{
    male: {
      figureType: "Square",
      figureBackgroundColor: "#b9d2fa"
    },
    female: {
      figureType: "Circle",
      figureBackgroundColor: "#faafd9"
    },
    figureSize: 40,
    figureBorderColor: "#696969",
    linkColor: "#696969",
    mariageLinkColor: "black",
    textColor: "black",
    selectedNodeColor: "#f3fc90"
  },
  reducers: {
   
  }
})

export const selectDiagramConfig = (state: State) => state.diagramConfig;
export const diagramConfigReducer = diagramConfigSlice.reducer;