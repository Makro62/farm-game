"use client";

import { useGameStore } from "@/lib/store";
import { useTown } from "@/lib/hooks/useTown";
import { NPC_LIST } from "@/lib/data/npcs";
import { GameAreaHeader, GameActionButton } from "./ui/GameAreaHeader";
import { MarketBoard } from "./game/MarketBoard";
import { QuestPanel } from "./game/QuestPanel";
import { TownShop } from "./game/TownShop";
import { TownPlaza, FishingLake, FishCatchBoard } from "./game/TownPlaza";
import { ProcessingPlant } from "./game/ProcessingPlant";
import { OrderBoard } from "./game/OrderBoard";
import TabPage, { GameStage } from "./ui/TabPage";
import SideDock from "./ui/SideDock";

export default function TabTown() {
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

            <div className="stage-play-frame flex flex-col gap-3">
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
              <OrderBoard />
            </div>
          </div>
        }
        side={
          <SideDock
            tabs={[
              { id: "toko", label: "Toko", emoji: "🏪", content: <TownShop /> },
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
                              className="text-[10px] font-bold px-2 py-1 rounded-full bg-[var(--gold)] text-[var(--text-primary)] border border-[var(--gold-deep)] shrink-0"
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
                  <>
                    <FishCatchBoard />
                    <MarketBoard />
                    <QuestPanel />
                  </>
                ),
              },
            ]}
          />
        }
      />
    </TabPage>
  );
}
