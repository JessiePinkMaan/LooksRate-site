import { profile } from "@/lib/content";
import {
  removeFriendAction,
  respondFriendRequestAction,
} from "@/lib/profile-actions";
import type { ProfileAura } from "@/lib/profile-theme";

import { FriendSearch } from "./FriendSearch";

const copy = profile.friends;

export type FriendRow = {
  friendshipId: string;
  name: string;
  username: string;
  rank: string;
  aura: ProfileAura;
};

function FriendIdentity({ friend }: { friend: FriendRow }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span
        className="profile-friend-dot"
        data-aura={friend.aura}
        aria-hidden
      />
      <span className="min-w-0">
        <span className="block truncate font-heading text-lg uppercase leading-tight">
          {friend.name}
        </span>
        <span className="block font-mono text-[0.5rem] uppercase tracking-[0.2em] text-steel">
          @{friend.username} · {friend.rank}
        </span>
      </span>
    </span>
  );
}

function MiniButton({
  children,
  decision,
  id,
}: {
  children: string;
  decision: string;
  id: string;
}) {
  return (
    <form action={respondFriendRequestAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="decision" value={decision} />
      <button
        type="submit"
        className="border border-graphite px-3 py-1.5 font-mono text-[0.5rem] uppercase tracking-[0.18em] text-steel transition-colors hover:border-gold-apple hover:text-gold-apple"
      >
        {children}
      </button>
    </form>
  );
}

/** Список друзей и заявок. Силуэты в сцене — отдельно, по кнопке. */
export function FriendsPanel({
  accepted,
  incoming,
  outgoing,
}: {
  accepted: FriendRow[];
  incoming: FriendRow[];
  outgoing: FriendRow[];
}) {
  return (
    <section className="border border-graphite bg-concrete/70 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-2xl uppercase">{copy.title}</h2>
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-steel">
          {accepted.length} рядом
        </span>
      </div>

      <div className="mt-4">
        <FriendSearch />
      </div>

      {incoming.length > 0 ? (
        <div className="mt-6">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-gold-apple/80">
            {copy.requests}
          </p>
          <ul className="mt-3 space-y-3">
            {incoming.map((friend) => (
              <li
                key={friend.friendshipId}
                className="flex flex-wrap items-center justify-between gap-3 border border-graphite/70 p-3"
              >
                <span>
                  <FriendIdentity friend={friend} />
                  <span className="mt-1 block font-mono text-[0.5rem] uppercase tracking-[0.18em] text-steel">
                    {copy.incoming}
                  </span>
                </span>
                <span className="flex gap-2">
                  <MiniButton decision="accept" id={friend.friendshipId}>
                    {copy.accept}
                  </MiniButton>
                  <MiniButton decision="decline" id={friend.friendshipId}>
                    {copy.decline}
                  </MiniButton>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {outgoing.length > 0 ? (
        <div className="mt-6">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.28em] text-steel">
            {copy.outgoing}
          </p>
          <ul className="mt-3 space-y-2">
            {outgoing.map((friend) => (
              <li
                key={friend.friendshipId}
                className="flex items-center justify-between gap-3 border border-graphite/50 p-3"
              >
                <FriendIdentity friend={friend} />
                <form action={removeFriendAction}>
                  <input
                    type="hidden"
                    name="id"
                    value={friend.friendshipId}
                  />
                  <button
                    type="submit"
                    className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-steel transition-colors hover:text-blood"
                  >
                    {copy.remove}
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ul className="mt-6 space-y-2">
        {accepted.length > 0 ? (
          accepted.map((friend) => (
            <li
              key={friend.friendshipId}
              className="flex items-center justify-between gap-3 border border-graphite/70 p-3"
            >
              <FriendIdentity friend={friend} />
              <form action={removeFriendAction}>
                <input type="hidden" name="id" value={friend.friendshipId} />
                <button
                  type="submit"
                  className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-steel transition-colors hover:text-blood"
                >
                  {copy.remove}
                </button>
              </form>
            </li>
          ))
        ) : (
          <li className="border border-dashed border-graphite/60 p-4 text-sm leading-relaxed text-steel">
            {copy.empty}
          </li>
        )}
      </ul>
    </section>
  );
}
