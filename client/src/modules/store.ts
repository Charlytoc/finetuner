import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginRequest } from "./lib";

type User = {
  id: string;
  username: string;
  email: string;
  token: string;
};

type Sentence = {
  hash: string;
  sentence: string;
  status: "ERROR" | "SUCCESS";
};

type StoreState = {
  user: User | null;
  sentence: Sentence | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  setSentence: (sentence: Sentence) => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      user: null,
      sentence: null,
      setSentence: (sentence: Sentence) => set({ sentence }),
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
      },
    }),
    {
      name: "app-store",
    }
  )
);
