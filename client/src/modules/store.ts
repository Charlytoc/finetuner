import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest } from "./lib";

type User = {
  id: string;
  username: string;
  email: string;
  token: string;
};
export type APIStatus = "ERROR" | "SUCCESS" | "QUEUED";

type Sentence = {
  hash: string;
  sentence: string;
  status: APIStatus;
};

type StoreState = {
  user: User | null;
  sentence: Sentence | null;
  warning: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  setSentence: (sentence: Sentence | null) => void;
  setWarning: (warning: string | null) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      sentence: null,
      warning: null,
      setSentence: (sentence: Sentence | null) => set({ sentence }),
      setWarning: (warning: string | null) => set({ warning }),
      login: async (username: string, password: string) => {
        const user = await loginRequest(username, password);
        console.log(user, "user");

        set({
          user: {
            id: "1",
            username,
            email: "john.doe@example.com",
            token: "1234567890",
          },
        });
      },
      logout: () => {
        set({ user: null });
        set({ sentence: null });
      },
    }),
    {
      name: "app-store",
    }
  )
);
