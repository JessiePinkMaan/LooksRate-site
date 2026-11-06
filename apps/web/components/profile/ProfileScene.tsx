"use client";

import { useState } from "react";

import { profile } from "@/lib/content";
import type { ProfileTheme } from "@/lib/profile-theme";

import { ProfileFigure } from "./ProfileFigure";

export type SceneFriend = {
  id: string;
  name: string;
  rank: string;
  theme: ProfileTheme;
  asset: "a" | "b";
};

type ProfileSceneProps = {
  user: {
    name: string;
    rank: string;
    theme: ProfileTheme;
  };
  friends: SceneFriend[];
};

/**
 * Профиль как сцена «Основателей», только один человек в центре.
 * Силуэт пользователя подсвечен золотом; друзья встают рядом со своим
 * светом и вещами и прячутся по кнопке.
 */
export function ProfileScene({ user, friends }: ProfileSceneProps) {
  const [showFriends, setShowFriends] = useState(false);
  const half = Math.ceil(friends.length / 2);
  const left = friends.slice(0, half);
  const right = friends.slice(half);

  return (
    <section
      className="profile-scene"
      data-backdrop={user.theme.backdrop}
      aria-label="Твой силуэт в подвале"
    >
      <div className="profile-floor" aria-hidden />
      <div className="profile-lamp" aria-hidden />
      <div className="profile-light" aria-hidden />

      <div className="profile-scene-head">
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.42em] text-steel">
          {profile.scene.eyebrow}
        </span>
        <span className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-gold-apple/80">
          {user.rank}
        </span>
      </div>

      <div className="profile-camera">
        <div
          className="profile-friend-cluster profile-friend-cluster-left"
          data-visible={showFriends ? "true" : "false"}
          aria-hidden={!showFriends}
        >
          {left.map((friend) => (
            <ProfileFigure
              key={friend.id}
              theme={friend.theme}
              variant="friend"
              name={friend.name}
              rank={friend.rank}
              asset={friend.asset}
            />
          ))}
        </div>

        <ProfileFigure
          theme={user.theme}
          variant="self"
          name={user.name}
          rank={user.rank}
          asset="a"
          className="profile-figure-self"
        />

        <div
          className="profile-friend-cluster profile-friend-cluster-right"
          data-visible={showFriends ? "true" : "false"}
          aria-hidden={!showFriends}
        >
          {right.map((friend) => (
            <ProfileFigure
              key={friend.id}
              theme={friend.theme}
              variant="friend"
              name={friend.name}
              rank={friend.rank}
              asset={friend.asset}
            />
          ))}
        </div>
      </div>

      <div className="profile-scene-foot">
        {showFriends && friends.length === 0 ? (
          <p className="text-sm text-steel">{profile.friends.empty}</p>
        ) : null}

        <button
          type="button"
          className="profile-friends-toggle"
          aria-pressed={showFriends}
          onClick={() => setShowFriends((current) => !current)}
        >
          {showFriends ? profile.friends.hide : profile.friends.show}
          <span className="profile-friends-count">{friends.length}</span>
        </button>
      </div>
    </section>
  );
}
