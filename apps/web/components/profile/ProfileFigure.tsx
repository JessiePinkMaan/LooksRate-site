import { cn } from "@loxrate/ui";

import type { ProfileTheme } from "@/lib/profile-theme";

type ProfileFigureProps = {
  theme: ProfileTheme;
  variant: "self" | "friend";
  name: string;
  rank: string;
  asset: "a" | "b";
  className?: string;
};

/**
 * Силуэт человека в темноте. Один и тот же силуэт для себя и друзей:
 * отличается только свет, вещь и подпись — как в их собственных профилях.
 */
export function ProfileFigure({
  theme,
  variant,
  name,
  rank,
  asset,
  className,
}: ProfileFigureProps) {
  return (
    <figure
      className={cn("profile-figure", className)}
      data-variant={variant}
      data-aura={theme.aura}
      data-item={theme.item}
    >
      <span className="profile-figure-aura" aria-hidden />
      <div className="profile-figure-body">
        <img
          src={`/assets/founder-${asset}.svg`}
          alt=""
          draggable={false}
        />
        {theme.item === "none" ? null : (
          <span
            className={`profile-item profile-item-${theme.item}`}
            aria-hidden
          />
        )}
      </div>
      <figcaption className="profile-figure-caption">
        <span className="profile-figure-name">{name}</span>
        <span className="profile-figure-rank">{rank}</span>
      </figcaption>
    </figure>
  );
}
