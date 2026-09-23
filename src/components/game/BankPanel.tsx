"use client";

import { useState } from "react";
import { useGameStore } from "@/lib/store";
import { formatNumber } from "@/lib/utils";

export function BankPanel() {
  const bankSavings = useGameStore((s) => s.town?.bankSavings || 0);
  const coins = useGameStore((s) => s.coins);
  const bankDeposit = useGameStore((s) => s.bankDeposit);
  const bankWithdraw = useGameStore((s) => s.bankWithdraw);
  const enqueueNotification = useGameStore((s) => s.enqueueNotification);
  const [amount, setAmount] = useState(100);

  const handleDeposit = () => {
    const r = bankDeposit(amount);
    enqueueNotification(r.message, {
      type: r.ok ? "success" : "error",
    });
  };

  const handleWithdraw = () => {
    const r = bankWithdraw(amount);
    enqueueNotification(r.message, {
      type: r.ok ? "success" : "error",
    });
  };

  const quick = [100, 500, 1000, 5000];

  return (
    <div className="glass-card p-3 mb-3">
      <h3 className="shop-section-title">
        <span>🏦</span> Bank Tani
      </h3>
      <div className="flex justify-between text-xs mb-2">
        <span className="text-[var(--text-secondary)]">Saldo Bank</span>
        <span className="font-bold text-[var(--gold-deep)]">
          {formatNumber(bankSavings, "id-ID")} 💰
        </span>
      </div>
      <div className="flex justify-between text-xs mb-3">
        <span className="text-[var(--text-secondary)]">Kantong</span>
        <span className="font-bold">{formatNumber(coins, "id-ID")} 💰</span>
      </div>
      <div className="text-[11px] text-[var(--text-secondary)] mb-2">
        Bunga 2% per hari game. Aman & menguntungkan!
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {quick.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setAmount(q)}
            className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border min-h-[2rem] ${
              amount === q
                ? "bg-[var(--gold)] border-[var(--gold-deep)]"
                : "bg-white/40 border-white/60"
            }`}
          >
            {formatNumber(q, "id-ID")}
          </button>
        ))}
      </div>
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
        className="w-full rounded-lg border border-white/60 bg-white/50 px-3 py-2 text-sm mb-2 min-h-[2.75rem]"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDeposit}
          className="flex-1 rounded-lg bg-emerald-500 border border-emerald-600 text-white font-bold text-xs py-2.5 min-h-[2.75rem]"
        >
          💰 Simpan
        </button>
        <button
          type="button"
          onClick={handleWithdraw}
          className="flex-1 rounded-lg bg-sky-500 border border-sky-600 text-white font-bold text-xs py-2.5 min-h-[2.75rem]"
        >
          💵 Tarik
        </button>
      </div>
    </div>
  );
}
