"use client";

import { useActionState } from "react";

import { profile } from "@/lib/content";
import {
  sendFriendRequestAction,
  type FriendState,
} from "@/lib/profile-actions";

const EMPTY: FriendState = {};
const copy = profile.friends;

/** Поиск по логину и заявка в друзья. */
export function FriendSearch() {
  const [state, submit, pending] = useActionState(
    sendFriendRequestAction,
    EMPTY,
  );

  return (
    <div>
      <form action={submit} className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-steel">
            {copy.addPlaceholder}
          </span>
          <input
            name="username"
            required
            minLength={3}
            maxLength={24}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="fronka"
            className="mt-1 w-full border-0 border-b border-graphite bg-transparent py-2 font-mono text-sm text-ash outline-none transition-colors placeholder:text-steel/40 focus:border-gold-apple"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="border border-graphite px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.22em] text-ash transition-colors hover:border-gold-apple hover:text-gold-apple disabled:opacity-50"
        >
          {pending ? "…" : copy.add}
        </button>
      </form>

      {state.error ? (
        <p
          role="alert"
          className="mt-3 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-blood"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="mt-3 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-gold-apple"
        >
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
