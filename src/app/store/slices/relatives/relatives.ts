import { createSlice } from '@reduxjs/toolkit'
import { State } from '../../store';
import { IRelative } from './relative';


export const relativesSlice = createSlice({
  name: 'relatives',
  initialState: <IRelative[]>[
    { key: 0, name: "Александр", lastName: "Шишмарёв", middleName: "Иванович", gender: "M", wifeKeys: [1] },
    { key: 1, name: "Елена", lastName: "Михайлик/Шишмарёва", middleName: "Ивановна", gender: "F", husbandKeys: [0] },
    { key: 2, name: "Ольга", lastName: "Шишмарёва/Клачкова/Орлова", middleName: "Александровна", gender: "F", motherKey: 1, fatherKey: 0, husbandKeys: [4, 7] },
    { key: 3, name: "Иван", lastName: "Шишмарёв", middleName: "Александрович", gender: "M", motherKey: 1, fatherKey: 0 },
    { key: 4, name: "Алексей", lastName: "Орлов", middleName: "Владимирович", gender: "M", wifeKeys: [2] },
    { key: 5, name: "Алина", lastName: "Орлова", middleName: "Алексеевна", gender: "F", motherKey: 2, fatherKey: 4 },
    { key: 6, name: "Антон", lastName: "Орлов", middleName: "Алексеевич", gender: "M", motherKey: 2, fatherKey: 4 },
    { key: 7, name: "Сергей", lastName: "Клачков", middleName: "Евгеньевич", gender: "M", wifeKeys: [2] },
    { key: 8, name: "Валерий", lastName: "Клачков", middleName: "Валентинович", gender: "M", motherKey: 2, fatherKey: 7 },
  ],
  reducers: {
   
  }
})

export const selectRelatives = (state: State) => state.relatives;
export const relativesReducer = relativesSlice.reducer;