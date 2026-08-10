"use client";

import { useState, useEffect } from "react";
import { MINERALS } from "@/lib/data/minerals";
import { SHOP_MINING } from "@/lib/data/shop";
import { motion } from "framer-motion";
import { ShopItemCard, ShopSectionTitle } from "@/components/ui/ShopItemCard";
import { GameAreaHeader, GameActionButton } from "@/components/ui/GameAreaHeader";
import { MarketBoard } from "@/components/game/MarketBoard";
import { QuestPanel } from "@/components/game/QuestPanel";
import { GAME_CONSTANTS } from "@/lib/constants";
import TabPage, { GameStage } from "@/components/ui/TabPage";
import SideDock from "@/components/ui/SideDock";
import { useMining } from "@/lib/hooks/useMining";
import { useMusic } from "@/lib/hooks/useSound";

const TARGET_TOOLS = new Set(["bom_kecil", "tali"]);

const FLOOR_META = {
  1: { name: "Lantai Dasar", emoji: "🪨", hazard: null },
  2: { name: "Koridor Gelap", emoji: "🕯️", hazard: "cave_in" },
  3: { name: "Gua Dalam", emoji: "🦇", hazard: "bats" },
  4: { name: "Terowongan Api", emoji: "🌋", hazard: "lava" },
  5: { name: "Kamar Harta", emoji: "👑", hazard: "gas" },
};

export default function TabMine() {
  const [isMounted, setIsMounted] = useState(false);
  const music = useMusic('mine');

  useEffect(() => {
    music.play();
    return () => music.stop();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  const {
    mining,
    inventory,
    selectedMiningTool,
    workers,
    autoMiner,
    shopAmounts,
    setShopAmounts,
    pickaxe,
    lanternActive,
    lanternSecs,
    ownedTools,
    setSelectedMiningTool,
    handleUseTool,
    handleMine,
    handleHireMiner,
    handleToggleAuto,
    handleShopBuy,
    getRegenProgress,
    handleUnlockSmeltery,
    handleSmelt,
  } = useMining();

  const [selectedFloor, setSelectedFloor] = useState(mining.currentFloor || 1);

  const canEnterFloor = (floor) => {
    if (floor > (mining.maxFloorReached || 1) + 1) return false;
    if (floor >= 3 && !lanternActive && mining.pickaxeLevel < 2) return false;
    return true;
  };

  const handleChangeFloor = (floor) => {
    if (!canEnterFloor(floor)) return;
    setSelectedFloor(floor);
  };

  const shopPanel = (
    <>
      <ShopSectionTitle icon="🛒">Shop Tambang</ShopSectionTitle>
      <div className="shop-grid">
        {SHOP_MINING.map((item) => {
          const amt = shopAmounts[item.id] || 1;
          return (
            <ShopItemCard
              key={item.id}
              icon={item.emoji}
              name={item.name}
              price={item.price}
              amount={amt}
              onDecrease={() =>
                setShopAmounts((p) => ({
                  ...p,
                  [item.id]: Math.max(1, amt - 1),
                }))
              }
              onIncrease={() =>
                setShopAmounts((p) => ({ ...p, [item.id]: amt + 1 }))
              }
              onBuy={() => handleShopBuy(item, amt)}
            />
          );
        })}
      </div>
    </>
  );

  const toolsPanel = (
    <>
      <ShopSectionTitle icon="⛏️">Alat Aktif</ShopSectionTitle>
      <div className="glass-card p-3 mb-3 flex justify-between items-center">
        <div>
          <div className="font-bold text-[var(--text-primary)] text-sm">
            {pickaxe.emoji} {pickaxe.name}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">
            Regen: {pickaxe.regen}
            {lanternActive ? " (senter aktif)" : ""}
          </div>
        </div>
        <span className="bg-[var(--primary-light)]/40 border border-[var(--primary)] text-[var(--text-primary)] text-xs px-2 py-1 rounded-full font-black">
          Lv {mining.pickaxeLevel}
        </span>
      </div>
      {lanternActive && (
        <div className="glass-card p-2 mb-3 text-center text-xs text-[var(--gold-deep)] font-bold">
          Senter aktif — {lanternSecs}s tersisa
        </div>
      )}

      <ShopSectionTitle icon="🧰">Peralatan Saya</ShopSectionTitle>
      <div className="glass-card rounded-xl p-2 mb-3 space-y-2">
        {ownedTools.length === 0 ? (
          <div className="text-center text-sm text-[var(--text-secondary)] italic font-bold py-2">
            Belum ada alat. Beli di tab Toko.
          </div>
        ) : (
          ownedTools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center justify-between gap-2 p-2 glass-card rounded-xl"
            >
              <div className="min-w-0 flex-1">
                <div className="font-bold text-[var(--text-primary)] text-xs flex items-center gap-1">
                  <span>{tool.emoji}</span>
                  <span className="truncate">{tool.name}</span>
                  <span className="text-[var(--gold-deep)] shrink-0">
                    ×{(inventory[tool.id] as any)?.qty ?? 0}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleUseTool(tool.id)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border-2 ${
                  selectedMiningTool === tool.id
                    ? "bg-[var(--gold)] text-[var(--text-primary)] border-[var(--gold-deep)]"
                    : "bg-white text-[var(--text-primary)] border-[var(--wood)]"
                }`}
              >
                {TARGET_TOOLS.has(tool.id) ? "Pilih" : "Pakai"}
              </button>
            </div>
          ))
        )}
      </div>
      {selectedMiningTool && (
        <button
          type="button"
          onClick={() => setSelectedMiningTool(null)}
          className="w-full mb-3 text-xs text-[var(--text-secondary)] underline font-bold rounded-lg"
        >
          Batal pilih alat
        </button>
      )}

      <ShopSectionTitle icon="🧑‍🌾">Pekerja</ShopSectionTitle>
      <button
        type="button"
        onClick={handleHireMiner}
        className={`w-full glass-card p-2 flex justify-between items-center text-left ${
          workers.miner ? "border-[var(--primary)] bg-[var(--primary)]/10" : ""
        }`}
      >
        <div>
          <div className="font-bold text-[var(--text-primary)] text-sm">
            Penambang Tarjo
          </div>
          <div className="text-[10px] text-[var(--text-secondary)]">
            Auto-Mine
          </div>
        </div>
        <span className="font-bold text-[var(--text-primary)] bg-[var(--gold)] px-2 py-0.5 rounded-full text-xs border border-[#FFF1B8]">
          {workers.miner
            ? "Dimiliki"
            : `${GAME_CONSTANTS.COSTS.WORKER_MINER.toLocaleString()} 💰`}
        </span>
      </button>

      {/* Smeltery Panel */}
      {mining.smeltery?.unlocked ? (
        <>
          <ShopSectionTitle icon="🔥">Smeltery</ShopSectionTitle>
          <div className="glass-card p-2 mb-2 text-xs">
            <div className="font-bold text-[var(--text-primary)] mb-1">
              Antrean Peleburan ({mining.smeltery.queue.length}/3)
            </div>
            {mining.smeltery.queue.length === 0 ? (
              <div className="text-[var(--text-secondary)] italic mb-2">
                Kosong — lelehkan mineral jadi batangan (jual lebih mahal).
              </div>
            ) : (
              mining.smeltery.queue.map((job, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 border-b border-white/10 last:border-0"
                >
                  <span>🔥 {job.recipe}</span>
                  <span className="text-[var(--gold-deep)]">
                    {job.completeAt
                      ? Math.ceil((job.completeAt - Date.now()) / 1000) + "s"
                      : "Selesai"}
                  </span>
                </div>
              ))
            )}
            {MINERALS.filter((m) => m.smeltRecipe).map((mineral) => (
              <button
                key={mineral.id}
                type="button"
                onClick={() => handleSmelt(mineral.id)}
                className="w-full mt-1 flex items-center justify-between gap-2 rounded-xl bg-[var(--primary-light)]/30 border border-[var(--primary)]/30 px-2 py-1.5 hover:bg-[var(--primary-light)]/50"
              >
                <span className="font-bold">
                  {mineral.emoji} {mineral.name} → {mineral.smeltRecipe.output}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)]">
                  ⏱️ {mineral.smeltRecipe.time}s
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <ShopSectionTitle icon="🔥">Smeltery</ShopSectionTitle>
          <div className="glass-card p-2 mb-3 text-xs">
            <p className="text-[var(--text-secondary)] mb-2">
              Lelehkan mineral jadi batangan yang lebih berharga.
            </p>
            <button
              type="button"
              onClick={handleUnlockSmeltery}
              className="w-full rounded-xl bg-[#ff9f43] border border-[#d97f2b] text-white font-bold text-xs py-2 shadow"
            >
              🔓 Buka Smeltery — 2.500💰 + 10⚫ Besi + 20🪨 Batu
            </button>
          </div>
        </>
      )}
    </>
  );

  const infoPanel = (
    <>
      <MarketBoard />
      <QuestPanel />
    </>
  );

  if (!isMounted) return null;

  return (
    <TabPage>
      <GameStage
        main={
          <div className="glass-panel p-3 sm:p-4 stage-play-area">
            <GameAreaHeader icon="⛏️" title="Area Pertambangan">
              <GameActionButton
                variant="miner"
                active={autoMiner}
                onClick={handleToggleAuto}
              >
                Auto: {autoMiner ? "ON" : "OFF"}
              </GameActionButton>
            </GameAreaHeader>

            {/* Floor Selector */}
            <div className="flex flex-wrap justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((floor) => {
                const meta = FLOOR_META[floor];
                const locked = !canEnterFloor(floor);
                const isCurrent = selectedFloor === floor;
                return (
                  <button
                    key={floor}
                    onClick={() => handleChangeFloor(floor)}
                    disabled={locked}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border-2 transition-all
                      ${
                        isCurrent
                          ? "bg-[var(--gold)] text-[var(--text-primary)] border-[var(--gold-deep)] shadow-sm"
                          : locked
                            ? "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50"
                            : "bg-[#5c5952] text-[var(--text-primary)] border-[#3d3b36] hover:bg-[#6b6861]"
                      }`}
                  >
                    <div className="text-xs">{meta.emoji}</div>
                    <div>{meta.name}</div>
                    {locked && <div className="text-[8px]">🔒</div>}
                  </button>
                );
              })}
            </div>

            {selectedMiningTool && (
              <div className="mb-2 text-center text-xs font-bold text-[var(--gold-deep)] bg-[var(--gold)]/20 rounded-xl py-1.5 px-3 border-2 border-[var(--gold)]">
                {SHOP_MINING.find((t) => t.id === selectedMiningTool)?.emoji}{" "}
                Klik petak untuk memakai alat
              </div>
            )}

            {/* Hazard Warning */}
            {FLOOR_META[selectedFloor]?.hazard && (
              <div className="mb-2 text-center text-[10px] font-bold text-red-400 bg-red-900/30 rounded-xl py-1 px-3 border border-red-500/30">
                ⚠️ Bahaya:{" "}
                {FLOOR_META[selectedFloor].hazard === "cave_in"
                  ? "Longsor"
                  : FLOOR_META[selectedFloor].hazard === "bats"
                    ? "Kelelawar"
                    : FLOOR_META[selectedFloor].hazard === "lava"
                      ? "Lava"
                      : "Gas Beracun"}
                {selectedFloor >= 3 && !lanternActive && (
                  <span> — Nyalakan senter untuk visibilitas!</span>
                )}
              </div>
            )}

            <div
              className="p-3 sm:p-4 field-frame relative stage-play-frame bg-cover bg-center"
              style={{ backgroundImage: "url('/img/backgrounds/mine_bg.png')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40 rounded-[22px] pointer-events-none" />
              <div className="game-plot-grid relative z-10">
                {mining.nodes.map((node) => {
                  const isReady = node.status === "ready";
                  const progress = getRegenProgress(node);
                  const mineral = MINERALS.find((m) => m.id === node.type);
                  const hasHazard = node.hazard && selectedFloor >= 3;

                  return (
                    <motion.button
                      key={node.id}
                      whileHover={{
                        scale: isReady || selectedMiningTool ? 1.05 : 1,
                      }}
                      whileTap={{
                        scale: isReady || selectedMiningTool ? 0.95 : 1,
                      }}
                      onClick={() => handleMine(node)}
                      disabled={!isReady && !selectedMiningTool}
                      className={`game-plot-cell border-b-4
                        ${
                          isReady
                            ? "bg-[#5c5952] border-[#3d3b36] hover:bg-[#6b6861] cursor-pointer"
                            : selectedMiningTool
                              ? "bg-[#3d3a35] border-[#5c5952] cursor-crosshair"
                              : "bg-[#1f1e1c] border-[#141312] cursor-not-allowed"
                        }
                        ${selectedMiningTool ? "ring-1 ring-orange-400/50" : ""}
                        ${hasHazard ? "ring-1 ring-red-500/50" : ""}
                      `}
                      title={
                        isReady && mineral
                          ? `${mineral.emoji} ${mineral.name}`
                          : undefined
                      }
                    >
                      {isReady ? (
                        <span className="plot-emoji">
                          {mineral?.emoji || "🪨"}
                        </span>
                      ) : (
                        <div className="w-full px-2 flex flex-col items-center">
                          <span className="text-xl opacity-30 mb-1">
                            {mineral?.emoji || "🪨"}
                          </span>
                          <div className="w-full progress-bar !h-1.5">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {hasHazard && (
                        <span className="absolute top-0 right-0 text-[10px]">
                          ⚠️
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        }
        side={
          <SideDock
            tabs={[
              { id: "toko", label: "Toko", emoji: "🛒", content: shopPanel },
              { id: "alat", label: "Alat", emoji: "⛏️", content: toolsPanel },
              { id: "info", label: "Info", emoji: "📋", content: infoPanel },
            ]}
          />
        }
      />
    </TabPage>
  );
}
