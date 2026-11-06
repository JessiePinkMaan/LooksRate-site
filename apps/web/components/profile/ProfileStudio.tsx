"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import type { ProfileTheme } from "@/lib/profile-theme";

import { ProfileCosmetics } from "./ProfileCosmetics";
import { ProfileScene, type SceneFriend } from "./ProfileScene";

type ProfileStudioProps = {
  user: {
    name: string;
    rank: string;
    theme: ProfileTheme;
  };
  friends: SceneFriend[];
  saved: boolean;
  stats: ReactNode;
  friendsPanel: ReactNode;
  quote?: string;
};

/**
 * Клиентская связка «сцена + примерочная»: облик меняется вживую,
 * а сохранение по-прежнему уходит в серверный action.
 */
export function ProfileStudio({
  user,
  friends,
  saved,
  stats,
  friendsPanel,
  quote,
}: ProfileStudioProps) {
  const [theme, setTheme] = useState<ProfileTheme>(user.theme);
  const [justSaved, setJustSaved] = useState(saved);

  return (
    <>
      <div className="mt-8">
        <ProfileScene
          user={{ name: user.name, rank: user.rank, theme }}
          friends={friends}
          quote={quote}
        />
      </div>

      {stats}

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <ProfileCosmetics
          theme={theme}
          saved={justSaved}
          onChange={(next) => {
            setTheme(next);
            setJustSaved(false);
          }}
        />
        {friendsPanel}
      </div>
    </>
  );
}
