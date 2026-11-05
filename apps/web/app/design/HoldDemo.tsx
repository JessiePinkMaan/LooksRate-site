"use client";

import { useState } from "react";

import { HoldButton } from "@loxrate/ui";

export function HoldDemo() {
  const [count, setCount] = useState(0);
  const [last, setLast] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <HoldButton
        ariaLabel="Удерживай, чтобы войти"
        onConfirm={() => {
          setCount((value) => value + 1);
          setLast(new Date().toLocaleTimeString("ru-RU"));
        }}
      >
        Удерживай, чтобы войти
      </HoldButton>
      <p className="font-mono text-xs text-steel">
        Подтверждений: {count}
        {last ? ` · последнее ${last}` : ""}
      </p>
    </div>
  );
}
