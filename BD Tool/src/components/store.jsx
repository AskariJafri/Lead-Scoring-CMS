import { Password } from "@mui/icons-material";
import { create } from "zustand";

export const useStore = create((set) => ({
  columns: [],
  csvData: [],
  icpData: {},
  weights: {},
  scores: [],
  appBarHeading: "",
  selectedColumns: [],
  loading: false,
  filename: "",
  setFilename: (newState) => set({ filename: newState }),
  setLoading: (newState) => set({ loading: newState }),
  setColumns: (newState) => set({ columns: newState }),
  setCsvData: (newState) => set({ csvData: newState }),
  setIcpData: (newState) => set({ icpData: newState }),
  setWeights: (newState) => set({ weights: newState }),
  setScores: (newScores) => set((state) => ({ scores: newScores.length?[...state.scores, ...newScores].sort((a, b) =>b.total_score  - a.total_score):[] })),
  setAppBarHeading: (newState) => set({ appBarHeading: newState }),
  setSelectedColumns: (newState) => set({ selectedColumns: newState }),
}));

export const loginStore = create((set) => ({
  username: "",
  password: "",
  setUsername: (newState) => set({ username: newState }),
  setPassword: (newState) => set({ password: newState }),
}));


