import { createSlice } from '@reduxjs/toolkit'
import { State } from '../../store';
import { IRelative } from '.';


export const relativesSlice = createSlice({
  name: 'relatives',
  initialState: <IRelative[]>[
    { key: 0, name: "Александр", lastName: "Шишмарёв", middleName: "Иванович", s: "M", ux: 1 },
    { key: 1, name: "Елена", lastName: "Михайлик/Шишмарёва", middleName: "Ивановна", s: "F", vir: 0 },
    { key: 2, name: "Ольга", lastName: "Шишмарёва/Клачкова/Орлова", middleName: "Александровна", s: "F", m: 1, f: 0, vir: [4, 7] },
    { key: 3, name: "Иван", lastName: "Шишмарёв", middleName: "Александрович", s: "M", m: 1, f: 0 },
    { key: 4, name: "Алексей", lastName: "Орлов", middleName: "Владимирович", s: "M", ux: 2 },
    { key: 5, name: "Алина", lastName: "Орлова", middleName: "Алексеевна", s: "F", m: 2, f: 4 },
    { key: 6, name: "Антон", lastName: "Орлов", middleName: "Алексеевич", s: "M", m: 2, f: 4 },
    { key: 7, name: "Сергей", lastName: "Клачков", middleName: "Евгеньевич", s: "M", ux: 2 },
    { key: 8, name: "Валерий", lastName: "Клачков", middleName: "Валентинович", s: "M", m: 2, f: 7 },
  ],
  reducers: {
   
  }
})

export const selectRelatives = (state: State) => state.relatives;
export const relativesReducer = relativesSlice.reducer;