"use client";

import { useEffect } from "react";
import { useGameStore } from "@/lib/store";
import { useTown } from "@/lib/hooks/useTown";
import { NPC_LIST } from "@/lib/data/npcs";
import { GameAreaHeader, GameActionButton } from "@/components/ui/GameAreaHeader";
import { MarketBoard } from "@/components/game/MarketBoard";
import { QuestPanel } from "@/components/game/QuestPanel";
import { TownShop } from "@/components/game/TownShop";
import { TownPlaza, FishingLake, FishCatchBoard } from "@/components/game/TownPlaza";
import { ProcessingPlant } from "@/components/game/ProcessingPlant";
import { OrderBoard } from "@/components/game/OrderBoard";
import { BankPanel } from "@/components/game/BankPanel";
import { MuseumPanel } from "@/components/game/MuseumPanel";
import TabPage, { GameStage } from "@/components/ui/TabPage";
import SideDock from "@/components/ui/SideDock";
import { useMusic } from "@/lib/hooks/useSound";

const AREA_META: Record<string, { emoji: string; title: string; desc: string }> = {
  plaza: {
    emoji: "🏘️",
    title: "Plaza Kota",
    desc: "Temui warga, putar roda hadiah, dan donasi ke museum.",
  },
  fishing: {
    emoji: "🎣",
    title: "Danau Pancing",
    desc: "Lempar kail dan menangkan mini-game memancing!",
  },
  processing: {
    emoji: "🏭",
    title: "Pabrik Pengolahan",
    desc: "Ubah bahan mentah menjadi bahan baku restoran.",
  },
};

export default function TabTown() {  const music = useMusic('town');

  useEffect(() => {
    music.play();
    return () => music.stop();
  }, []);

  const {
    area,
    setArea,
    autoFisher,
    handleToggleAuto,
    selectedBaitLabel,
    fishingProps,
  } = useTown();

  const npcs = useGameStore((s) => s.npcs);
  const buildings = useGameStore((s) => s.buildings);
  const openNpcGift = useGameStore((s) => s.openNpcGift);

  return (
    <TabPage>
      <GameStage
        main={
          <div className="glass-panel p-3 sm:p-4 stage-play-area">
            <GameAreaHeader icon="🏘️" title="Alun-Alun Kota">
              <GameActionButton
                variant="toggle"
                active={area === "plaza"}
                onClick={() => setArea("plaza")}
              >
                Plaza
              </GameActionButton>
              <GameActionButton
                variant="toggle"
                active={area === "fishing"}
                onClick={() => setArea("fishing")}
              >
                Memancing
              </GameActionButton>
              <GameActionButton
                variant="toggle"
                active={area === "processing"}
                onClick={() => setArea("processing")}
              >
                Pabrik
              </GameActionButton>
              <GameActionButton
                variant="auto"
                active={autoFisher}
                onClick={handleToggleAuto}
              >
                Auto: {autoFisher ? "ON" : "OFF"}
              </GameActionButton>
            </GameAreaHeader>

            <div className="stage-play-frame flex flex-col gap-4 sm:gap-5">
              {/* ── Zona 1: Area aktif ── */}
              <section>
                <div className="flex items-center gap-2 px-1 pb-2">
                  <span className="text-xl">
                    {(AREA_META[area] || AREA_META.plaza).emoji}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-base text-[var(--text-primary)] leading-tight">
                      {(AREA_META[area] || AREA_META.plaza).title}
                    </h3>
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium truncate">
                      {(AREA_META[area] || AREA_META.plaza).desc}
                    </p>
                  </div>
                </div>
                {area === "plaza" ? (
                  <TownPlaza />
                ) : area === "processing" ? (
                  <ProcessingPlant />
                ) : (
                  <FishingLake
                    fishState={fishingProps.fishState}
                    indicatorPos={fishingProps.indicatorPos}
                    score={fishingProps.score}
                    isHolding={fishingProps.isHolding}
                    setIsHolding={fishingProps.setIsHolding}
                    startFishing={fishingProps.startFishing}
                    startMinigame={fishingProps.startMinigame}
                    activeBait={fishingProps.activeBait}
                    selectedBaitLabel={selectedBaitLabel}
                  />
                )}
              </section>

              <div className="border-t-2 border-dashed border-[var(--wood)]/30" />

              {/* ── Zona 2: Papan Pesanan ── */}
              <section>
                <OrderBoard />
              </section>
            </div>
          </div>
        }
        side={
          <SideDock
            tabs={[
              { id: "toko", label: "Toko", emoji: "🏪", content: <TownShop /> },
              {
                id: "bank",
                label: "Bank",
                emoji: "🏦",
                content: <BankPanel />,
              },
              {
                id: "museum",
                label: "Museum",
                emoji: "🏛️",
                content: <MuseumPanel />,
              },
              {
                id: "npcs",
                label: "NPC",
                emoji: "👥",
                content: (
                  <>
                    <h3 className="shop-section-title">
                      <span>👥</span> Hubungan NPC
                    </h3>
                    <div className="space-y-2 mb-3">
                      {NPC_LIST.map((npc) => {
                        const state = npcs?.[npc.id] || {
                          level: 1,
                          points: 0,
                          hearts: 1,
                        };
                        const hearts = state.hearts || 1;
                        return (
                          <div
                            key={npc.id}
                            className="glass-card p-2 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="text-lg">{npc.emoji}</span>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-[var(--text-primary)] truncate">
                                  {npc.name}
                                </div>
                                <div className="text-[9px] text-[var(--text-secondary)]">
                                  {npc.role}
                                </div>
                                <div className="text-[10px]">
                                  {"❤️".repeat(Math.min(hearts, 10))}
                                  {"🖤".repeat(
                                    Math.max(0, 10 - Math.min(hearts, 10)),
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => openNpcGift(npc.id)}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-[var(--gold)] text-[var(--text-primary)] border border-[var(--gold-deep)] shrink-0"
                            >
                              🎁
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ),
              },
              {
                id: "info",
                label: "Info",
                emoji: "📋",
                content: (
                  <div className="flex flex-col gap-5">
                    <FishCatchBoard />
                    <div className="border-t-2 border-dashed border-[var(--wood)]/30" />
                    <MarketBoard />
                    <div className="border-t-2 border-dashed border-[var(--wood)]/30" />
                    <QuestPanel />
                  </div>
                ),
              },
            ]}
          />
        }
      />
    </TabPage>
  );
}
