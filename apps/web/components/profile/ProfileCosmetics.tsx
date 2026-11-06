"use client";

import { profile } from "@/lib/content";
import {
  PROFILE_AURAS,
  PROFILE_BACKDROPS,
  PROFILE_ITEMS,
  type ProfileTheme,
} from "@/lib/profile-theme";
import { updateProfileThemeAction } from "@/lib/profile-actions";

const copy = profile.cosmetics;

function OptionGroup({
  name,
  label,
  options,
  value,
  onSelect,
}: {
  name: "aura" | "item" | "backdrop";
  label: string;
  options: readonly string[];
  value: string;
  onSelect: (value: string) => void;
}) {
  const labels: Record<string, string> =
    name === "aura"
      ? copy.auras
      : name === "item"
        ? copy.items
        : copy.backdrops;

  return (
    <fieldset>
      <legend className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-steel">
        {label}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="theme-option">
            <input
              type="radio"
              name={name}
              value={option}
              checked={option === value}
              onChange={() => onSelect(option)}
              className="sr-only"
            />
            <span>{labels[option] ?? option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Примерочная: аура, вещь и фон. Изменения сразу уходят в сцену,
 * а кнопка «Примерить» сохраняет образ в profile_theme.
 */
export function ProfileCosmetics({
  theme,
  saved,
  onChange,
}: {
  theme: ProfileTheme;
  saved: boolean;
  onChange: (theme: ProfileTheme) => void;
}) {
  const randomize = (): void => {
    const random = <T extends string>(items: readonly T[], current: T): T => {
      const pool = items.filter((item) => item !== current);
      return pool[Math.floor(Math.random() * pool.length)] ?? current;
    };

    onChange({
      aura: random(PROFILE_AURAS, theme.aura),
      item: random(PROFILE_ITEMS, theme.item),
      backdrop: random(PROFILE_BACKDROPS, theme.backdrop),
    });
  };

  return (
    <section
      id="oblik"
      className="border border-graphite bg-concrete/70 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-2xl uppercase">{copy.title}</h2>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-steel">
            {copy.preview}
          </span>
          {saved ? (
            <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-gold-apple">
              {copy.saved}
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-steel">
        {copy.subtitle}
      </p>
      <p className="mt-1 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-gold-apple">
        {copy.live}
      </p>

      <form action={updateProfileThemeAction} className="mt-5 space-y-5">
        <OptionGroup
          name="aura"
          label={copy.auraLabel}
          options={PROFILE_AURAS}
          value={theme.aura}
          onSelect={(aura) =>
            onChange({ ...theme, aura: aura as ProfileTheme["aura"] })
          }
        />
        <OptionGroup
          name="item"
          label={copy.itemLabel}
          options={PROFILE_ITEMS}
          value={theme.item}
          onSelect={(item) =>
            onChange({ ...theme, item: item as ProfileTheme["item"] })
          }
        />
        <OptionGroup
          name="backdrop"
          label={copy.backdropLabel}
          options={PROFILE_BACKDROPS}
          value={theme.backdrop}
          onSelect={(backdrop) =>
            onChange({
              ...theme,
              backdrop: backdrop as ProfileTheme["backdrop"],
            })
          }
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="border border-gold-apple/50 bg-gold-apple/10 px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-gold-apple transition-colors hover:bg-gold-apple/20"
          >
            {copy.save}
          </button>
          <button
            type="button"
            onClick={randomize}
            className="border border-graphite px-4 py-2.5 font-mono text-[0.55rem] uppercase tracking-[0.22em] text-steel transition-colors hover:border-gold-apple/50 hover:text-ash"
          >
            {copy.random}
          </button>
        </div>
      </form>
    </section>
  );
}
