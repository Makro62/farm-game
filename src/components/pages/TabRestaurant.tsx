"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { RECIPES } from "@/lib/data/recipes";
import { getItemEmoji, getItemCategory } from "@/lib/data/item-helpers";
import { CraftingWidget } from "@/components/ui/CraftingWidget";
import { GameAreaHeader, GameActionButton } from "@/components/ui/GameAreaHeader";
import { QuestPanel } from "@/components/game/QuestPanel";
import { GAME_CONSTANTS } from "@/lib/constants";
import TabPage, { GameStage } from "@/components/ui/TabPage";
import SideDock from "@/components/ui/SideDock";
import { useRestaurant } from "@/lib/hooks/useRestaurant";
import { useMusic } from "@/lib/hooks/useSound";

function MenuBoard() {
  return (
    <div className="market-board p-3 mb-5">
      <div className="font-display font-bold text-base mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-[#F4F7E8]">
        <span className="text-xl">📋</span> Papan Menu
      </div>
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {RECIPES.map((recipe) => (
          <div
            key={recipe.id}
            className="market-row px-2.5 py-2 flex items-center justify-between gap-2"
          >
            <span className="text-sm font-extrabold text-[#F4F7E8] truncate">
              {recipe.emoji} {recipe.name}
            </span>
            <span className="text-xs font-black text-[#FFE08A] tabular-nums whitespace-nowrap">
              {recipe.price}💰
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableGrid() {
  const activeCustomers = useGameStore((s) => s.activeCustomers || []);
  const totalTables = useGameStore((s) => s.totalTables || 4);
  const serveCustomer = useGameStore((s) => s.serveCustomer);
  const upgradeTables = useGameStore((s) => s.upgradeTables);
  const openConfirm = useGameStore((s) => s.openConfirm);
  const tables = Array.from({ length: 9 }, (_, i) => i);

  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpgrade = () => {
    const cost = totalTables * 1000;
    const besiReq = totalTables * 2;
    const batuReq = totalTables * 5;
    openConfirm(
      "Beli Meja Baru",
      `Beli meja baru seharga ${cost} 💰 + ${besiReq}x Besi + ${batuReq}x Batu?`,
      () => {
        upgradeTables();
      },
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2.5 w-full max-w-lg mx-auto mb-6 mt-2">
      {tables.map((tableId) => {
        const isLocked = tableId >= totalTables;
        const customer = activeCustomers.find((c) => c.tableId === tableId);

        if (isLocked) {
          return (
            <div
              key={tableId}
              onClick={tableId === totalTables ? handleUpgrade : undefined}
              className={`relative aspect-[4/3] rounded-xl border-2 border-dashed flex items-center justify-center transition-all ${
                tableId === totalTables
                  ? "border-amber-400 bg-amber-50/50 cursor-pointer hover:bg-amber-100/60"
                  : "border-gray-300 bg-gray-100/30 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="text-2xl opacity-40">🪑</div>
              {tableId === totalTables && (
                <div className="absolute -bottom-2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border-2 border-amber-600 whitespace-nowrap shadow-md">
                  + Meja {totalTables * 1000}💰
                </div>
              )}
            </div>
          );
        }

        const patienceRatio = customer
          ? Math.max(0, customer.patience / customer.maxPatience)
          : 0;

        return (
          <div
            key={tableId}
            className="relative aspect-[4/3] rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all"
            style={{
              background: customer
                ? "linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)"
                : "linear-gradient(180deg, #F5F0E6 0%, #EDE4D4 100%)",
              borderColor: customer ? "#F59E0B" : "#D1C7B7",
            }}
          >
            {!customer && (
              <div className="relative z-10 flex flex-col items-center gap-1 opacity-30">
                <span className="text-2xl">🍽️</span>
                <span className="text-[9px] font-bold text-amber-700">Kosong</span>
              </div>
            )}

            <AnimatePresence>
              {customer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.3, y: -30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.3, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onClick={() => serveCustomer(customer.id)}
                  className="relative cursor-pointer z-10 flex flex-col items-center"
                >
                  <div className="relative">
                    <span className="text-4xl drop-shadow-md block">
                      {customer.emoji}
                    </span>

                    <div className="absolute -top-9 -right-5 bg-white rounded-lg px-1.5 py-1 shadow-md border border-gray-200 flex flex-col items-center animate-bounce">
                      <span className="text-lg leading-none">
                        {RECIPES.find((r) => r.id === customer.recipeId)?.emoji}
                      </span>
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white absolute -bottom-1 left-2" />
                    </div>
                  </div>

                  <div className="mt-1 w-16 h-2 bg-black/20 rounded-full overflow-hidden border border-white/30">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{
                        width: `${patienceRatio * 100}%`,
                        backgroundColor:
                          patienceRatio > 0.5
                            ? "#4ADE80"
                            : patienceRatio > 0.25
                              ? "#FBBF24"
                              : "#EF4444",
                      }}
                    />
                  </div>

                  <span className="text-[8px] font-bold text-amber-800 mt-0.5">
                    {customer.name}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default function TabRestaurant() {
  const music = useMusic('restaurant');

  useEffect(() => {
    music.play();
    return () => music.stop();
  }, []);

  const {
    workers,
    autoChef,
    selectedRecipe,
    level,
    menuFilter,
    serviceOn,
    recipes,
    inventory,
    setMenuFilter,
    setServiceOn,
    canCook,
    eatFood,
    handleCook,
    handleHireWorker,
    handleToggleAuto,
    handleSetTarget,
    enqueueNotification,
  } = useRestaurant();

  const restaurant = useGameStore((s) => s.restaurant);
  const totalServed = useGameStore((s) => s.stats?.totalServed || 0);
  const activeCustomers = useGameStore((s) => s.activeCustomers || []);

  return (
    <TabPage>
      <GameStage
        main={
          <div className="glass-panel p-3 sm:p-4 stage-play-area">
            <GameAreaHeader icon="👩‍🍳" title="Interior Restoran">
              <GameActionButton
                variant="edit"
                active={!serviceOn}
                onClick={() => {
                  setServiceOn(false);
                  enqueueNotification(
                    "Mode atur meja — siapkan menu di toko samping",
                    { icon: "🪑", type: "info" },
                  );
                }}
              >
                Atur Meja
              </GameActionButton>
              <GameActionButton
                variant="auto"
                active={autoChef}
                onClick={handleToggleAuto}
              >
                Auto: {autoChef ? "ON" : "OFF"}
              </GameActionButton>
            </GameAreaHeader>

            {/* Service Mode Indicator */}
            <div className={`flex items-center justify-center gap-2 mb-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              serviceOn
                ? 'bg-green-100 border border-green-300 text-green-800'
                : 'bg-gray-100 border border-gray-300 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${serviceOn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span>{serviceOn ? 'Service ON — Pelanggan datang!' : 'Service OFF — Mode atur meja'}</span>
            </div>

            <div className="flex items-center justify-between gap-2 mb-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold">
              <div className="flex items-center gap-2">
                <span>⭐</span>
                <span className="text-amber-800">
                  Reputasi: {restaurant?.reputation || 0}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>🍽️</span>
                <span className="text-amber-800">
                  {totalServed} dilayani
                </span>
                <span className="text-amber-600">
                  {activeCustomers.length} sekarang
                </span>
              </div>
            </div>

            <div className="field-frame relative stage-play-frame overflow-hidden rounded-xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100">
              <div className="relative z-10 p-4 sm:p-5 flex flex-col items-center justify-center h-full min-h-[200px] text-center gap-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-4xl">👨‍🍳</div>
                  <div>
                    <p className="font-display font-bold text-lg text-amber-900">
                      Dapur Dewi Hidangan
                    </p>
                    <p className="text-xs text-amber-700 font-medium">
                      {serviceOn
                        ? "Sajikan ke pelanggan dengan mengkliknya!"
                        : "Mode atur meja aktif"}
                    </p>
                  </div>
                </div>
                <TableGrid />
                <CraftingWidget
                  queueOnly
                  title="Dapur Saya"
                  icon="🍳"
                />
              </div>
            </div>
          </div>
        }
        side={
          <SideDock
            tabs={[
              {
                id: "menu",
                label: "Menu",
                emoji: "🍽️",
                content: (
                  <>
                    <h3 className="shop-section-title">
                      <span>🍽️</span> Menu Hidangan
                    </h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {[
                        { id: "all", label: "Semua" },
                        { id: "kitchen", label: "Dasar" },
                        { id: "fish_kitchen", label: "Ikan" },
                        { id: "restaurant", label: "Kue" },
                      ].map((f) => (
                        <GameActionButton
                          key={f.id}
                          variant="toggle"
                          active={menuFilter === f.id}
                          onClick={() => setMenuFilter(f.id)}
                          className="!min-h-0 !py-1 !px-2 !text-[10px]"
                        >
                          {f.label}
                        </GameActionButton>
                      ))}
                    </div>
                    <div className="shop-grid mb-3">
                      {recipes.map((recipe) => {
                        const isUnlocked = level >= (recipe.unlockLevel || 1);
                        const ready = isUnlocked && canCook(recipe);
                        const isSelected = selectedRecipe === recipe.id;
                        return (
                          <div key={recipe.id} className="relative group">
                            <button
                              type="button"
                              onClick={() => {
                                if (!isUnlocked) {
                                  enqueueNotification(
                                    `Resep ini butuh Level ${recipe.unlockLevel}!`,
                                    { icon: "🔒", type: "error" },
                                  );
                                  return;
                                }
                                handleCook(recipe.id);
                              }}
                              disabled={!ready && isUnlocked}
                              className={`shop-item-card text-left w-full ${
                                !isUnlocked
                                  ? "filter grayscale opacity-60 cursor-not-allowed"
                                  : ""
                              } ${
                                ready
                                  ? "ring-2 ring-[var(--primary)]"
                                  : isUnlocked
                                    ? "opacity-75"
                                    : ""
                              } ${
                                isSelected
                                  ? "ring-4 ring-yellow-400 !border-yellow-500 bg-yellow-50"
                                  : ""
                              }`}
                            >
                              <div className="shop-item-info relative">
                                <span className="shop-item-icon">
                                  {recipe.emoji}
                                </span>
                                <span className="shop-item-name">
                                  {recipe.name}
                                </span>
                                <span className="shop-item-price">
                                  {recipe.price} 💰
                                </span>

                                {!isUnlocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded backdrop-blur-[1px]">
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md border border-white/50">
                                      🔒 Lv {recipe.unlockLevel}
                                    </span>
                                  </div>
                                )}

                                <div
                                  className={`flex flex-wrap gap-0.5 justify-center mt-1 ${
                                    !isUnlocked ? "opacity-0" : ""
                                  }`}
                                >
                                  {Object.entries(recipe.req).map(
                                    ([ingredient, qty]: [string, any]) => {
                                      const parts = ingredient.split(".");
                                      const itemId =
                                        parts.length === 2
                                          ? parts[1]
                                          : ingredient;
                                      const cat =
                                        parts.length === 2 ? parts[0] : null;
                                      const available = cat
                                        ? inventory?.[cat]?.[itemId]?.qty || 0
                                        : Object.values(
                                            inventory || {},
                                          ).reduce(
                                            (sum, catInv: any) =>
                                              sum +
                                              (catInv?.[itemId]?.qty || 0),
                                            0,
                                          );
                                      return (
                                        <span
                                          key={ingredient}
                                          className={`text-[9px] px-1 rounded ${
                                            available >= qty
                                              ? "bg-[var(--primary-light)]/40"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {getItemEmoji(itemId)}
                                          {qty}
                                        </span>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            </button>
                            {(() => {
                              const recipeCat = getItemCategory(recipe.id);
                              const owned = recipeCat
                                ? inventory?.[recipeCat]?.[recipe.id]?.qty || 0
                                : 0;
                              return owned > 0 ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eatFood(recipe.id);
                                  }}
                                  className="absolute top-1 left-1 w-6 h-6 rounded-lg bg-green-400 text-white flex items-center justify-center text-xs shadow-md z-10 transition-colors"
                                  title="Makan untuk pulihkan energi"
                                >
                                  🍽️
                                </button>
                              ) : null;
                            })()}
                            {workers?.chef && isUnlocked && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetTarget(recipe, isSelected);
                                }}
                                className={`absolute -top-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-md z-10 transition-colors ${
                                  isSelected
                                    ? "bg-yellow-400 text-white"
                                    : "bg-white text-gray-400 md:opacity-0 md:group-hover:opacity-100 border"
                                }`}
                                title="Set target masak otomatis"
                              >
                                📌
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <h3 className="shop-section-title">
                      <span>👨‍🍳</span> Pekerja
                    </h3>
                    <button
                      type="button"
                      onClick={handleHireWorker}
                      className={`w-full glass-card p-2 flex justify-between items-center text-left ${
                        workers?.chef
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : ""
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[var(--text-primary)] text-sm">
                          Koki Juna
                        </div>
                        <div className="text-[10px] text-[var(--text-secondary)]">
                          Auto-Cooking
                        </div>
                      </div>
                      <span className="font-bold bg-[var(--gold)] px-2 py-0.5 rounded-lg text-xs border border-[#FFF1B8]">
                        {workers?.chef
                          ? "Dimiliki"
                          : `${GAME_CONSTANTS.COSTS.WORKER_CHEF} 💰`}
                      </span>
                    </button>
                  </>
                ),
              },
              {
                id: "info",
                label: "Info",
                emoji: "📋",
                content: (
                  <>
                    <MenuBoard />
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
