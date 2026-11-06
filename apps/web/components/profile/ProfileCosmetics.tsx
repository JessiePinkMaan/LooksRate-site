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
}: {
  name: "aura" | "item" | "backdrop";
  label: string;
  options: readonly string[];
  value: string;
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
              defaultChecked={option === value}
              className="sr-only"
            />
            <span>{labels[option] ?? option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Примерочная: аура, вещь и фон. Сохраняется в profile_theme. */
export function ProfileCosmetics({
  theme,
  saved,
}: {
  theme: ProfileTheme;
  saved: boolean;
}) {
  return (
    <section
      id="oblik"
      className="border border-graphite bg-concrete/70 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-2xl uppercase">{copy.title}</h2>
        {saved ? (
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.22em] text-gold-apple">
            {copy.saved}
          </span>
        ) : null}
      </div>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-steel">
        {copy.subtitle}
      </p>

      <form action={updateProfileThemeAction} className="mt-5 space-y-5">
        <OptionGroup
          name="aura"
          label={copy.auraLabel}
          options={PROFILE_AURAS}
          value={theme.aura}
        />
        <OptionGroup
          name="item"
          label={copy.itemLabel}
          options={PROFILE_ITEMS}
          value={theme.item}
        />
        <OptionGroup
          name="backdrop"
          label={copy.backdropLabel}
          options={PROFILE_BACKDROPS}
          value={theme.backdrop}
        />

        <button
          type="submit"
          className="border border-gold-apple/50 bg-gold-apple/10 px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-gold-apple transition-colors hover:bg-gold-apple/20"
        >
          {copy.save}
        </button>
      </form>
    </section>
  );
}
