"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store";
import { RECIPES } from "@/lib/data/recipes";
import { getReputationTier } from "@/lib/data/customers";
import { getItemEmoji, getItemCategory } from "@/lib/data/item-helpers";
import { CraftingWidget } from "@/components/ui/CraftingWidget";
import { GameAreaHeader, GameActionButton } from "@/components/ui/GameAreaHeader";
import { QuestPanel } from "@/components/game/QuestPanel";
import { GAME_CONSTANTS } from "@/lib/constants";
import TabPage, { GameStage } from "@/components/ui/TabPage";
import SideDock from "@/components/ui/SideDock";
import CustomerAvatar from "@/components/ui/CustomerAvatar";
import { useRestaurant } from "@/lib/hooks/useRestaurant";
import { useMusic } from "@/lib/hooks/useSound";

function MenuBoard() {
  const dailySpecial = useGameStore((s) => s.restaurant?.dailySpecial);
  return (
    <div className="market-board p-3">
      <div className="font-display font-bold text-base mb-3 flex items-center gap-2 border-b-2 border-white/20 pb-2 text-[#F4F7E8]">
        <span className="text-xl">📋</span> Papan Menu
      </div>
      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {RECIPES.map((recipe) => (
          <div
            key={recipe.id}
            className={`market-row px-2.5 py-2 flex items-center justify-between gap-2 ${
              dailySpecial === recipe.id
                ? "ring-2 ring-yellow-300 bg-yellow-400/10"
                : ""
            }`}
          >
            <span className="text-sm font-extrabold text-[#F4F7E8] truncate">
              {dailySpecial === recipe.id && "⭐ "}
              {recipe.emoji} {recipe.name}
            </span>
            <span className="text-xs font-black text-[#FFE08A] tabular-nums whitespace-nowrap">
              {dailySpecial === recipe.id
                ? `~${recipe.price}~ ${Math.floor(recipe.price * 1.5)}💰`
                : `${recipe.price}💰`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RushBanner() {
  const rushUntil = useGameStore((s) => s.restaurant?.rushUntil || 0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!rushUntil || rushUntil <= Date.now()) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [rushUntil]);
  const left = Math.max(0, Math.ceil((rushUntil - now) / 1000));
  if (left <= 0) return null;
  return (
    <div className="flex items-center justify-center gap-2 mb-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-100 border border-orange-400 text-orange-800 animate-pulse">
      <span>🔥</span>
      <span>JAM RAMAI! Tip x2 — {left} detik lagi</span>
    </div>
  );
}

function TableGrid() {
  const activeCustomers = useGameStore((s) => s.activeCustomers || []);
  const totalTables = useGameStore((s) => s.totalTables || 4);
  const serveCustomer = useGameStore((s) => s.serveCustomer);
  const dailySpecial = useGameStore((s) => s.restaurant?.dailySpecial);
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
    <div className="w-full max-w-lg mx-auto">
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full">
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
              <div className="flex flex-col items-center gap-1 px-1">
                <div className="text-2xl opacity-40 leading-none">🪑</div>
                {tableId === totalTables && (
                  <div className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-amber-600 whitespace-nowrap shadow-md">
                    + Meja {totalTables * 1000}💰
                  </div>
                )}
              </div>
            </div>
          );
        }

        const patienceRatio = customer
          ? Math.max(0, customer.patience / customer.maxPatience)
          : 0;

        return (
          <div
            key={tableId}
            onClick={() => customer && serveCustomer(customer.id)}
            className={`relative aspect-[4/3] rounded-xl border-2 flex items-center justify-center overflow-hidden transition-all p-1 ${
              customer?.isVip ? "ring-2 ring-yellow-400" : ""
            } ${customer ? "cursor-pointer" : ""}`}
            style={{
              background: customer
                ? customer.isVip
                  ? "linear-gradient(180deg, #FEF9C3 0%, #FDE047 100%)"
                  : "linear-gradient(180deg, #FEF3C7 0%, #FDE68A 100%)"
                : "linear-gradient(180deg, #F5F0E6 0%, #EDE4D4 100%)",
              borderColor: customer ? "#F59E0B" : "#D1C7B7",
            }}
          >
            {/* Dish order badge — pinned inside top-right corner */}
            {customer && (
              <div className="absolute top-1 right-1 z-20 bg-white rounded-lg px-1 py-0.5 shadow-md border border-gray-200 flex items-center">
                <span className="text-base sm:text-lg leading-none">
                  {RECIPES.find((r) => r.id === customer.recipeId)?.emoji}
                </span>
                {dailySpecial === customer.recipeId && (
                  <span className="text-[8px] leading-none">⭐</span>
                )}
              </div>
            )}
            {/* VIP crown — pinned inside top-left corner */}
            {customer?.isVip && (
              <span className="absolute top-1 left-1 z-20 text-base sm:text-lg leading-none">
                👑
              </span>
            )}
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
                  className={`relative z-10 flex flex-col items-center min-w-0 ${
                    patienceRatio < 0.85 ? "customer-eating" : ""
                  }`}
                >
                  {/* Steam particles when eating */}
                  {patienceRatio < 0.85 && patienceRatio > 0.25 && (
                    <>
                      <span className="customer-steam" style={{ left: "35%", animationDelay: "0s" }}>~</span>
                      <span className="customer-steam" style={{ left: "55%", animationDelay: "0.7s" }}>~</span>
                    </>
                  )}

                  <div className={patienceRatio < 0.85 ? "customer-chew" : ""}>
                    <CustomerAvatar
                      customerId={customer.typeId || "bapak_kumis"}
                      size={44}
                      eating={patienceRatio < 0.85}
                      className="drop-shadow-md"
                    />
                  </div>

                  <div className="mt-1 w-14 sm:w-16 h-2 bg-black/20 rounded-full overflow-hidden border border-white/30">
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

                  <span className="text-[8px] font-bold text-amber-800 mt-0.5 max-w-full truncate px-1">
                    {customer.name}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
      </div>
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

  const reputation = useGameStore((s) => s.restaurant?.reputation || 0);
  const repTier = getReputationTier(reputation);
  const dailySpecial = useGameStore((s) => s.restaurant?.dailySpecial);
  const totalServed = useGameStore((s) => s.stats?.totalServed || 0);
  const activeCustomers = useGameStore((s) => s.activeCustomers || []);
  const totalTables = useGameStore((s) => s.totalTables || 4);
  const serveAllCustomers = useGameStore((s) => s.serveAllCustomers);

  return (
    <TabPage>
      <GameStage
        main={
          <div className="glass-panel p-3 sm:p-4 stage-play-area">
            <GameAreaHeader icon="👩‍🍳" title="Interior Restoran">
              <GameActionButton
                variant="auto"
                active={serviceOn}
                onClick={() => {
                  setServiceOn(!serviceOn);
                }}
              >
                Service: {serviceOn ? "ON" : "OFF"}
              </GameActionButton>
              <GameActionButton
                variant="auto"
                active={autoChef}
                onClick={handleToggleAuto}
              >
                Auto: {autoChef ? "ON" : "OFF"}
              </GameActionButton>
            </GameAreaHeader>

            {/* ── Zona 1: Status Restoran ── */}
            <section className="rounded-2xl border-2 border-amber-200 bg-amber-50/70 overflow-hidden mb-3 sm:mb-4">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-amber-200/70">
                <div className={`w-2 h-2 rounded-full shrink-0 ${serviceOn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-xs font-bold text-amber-900">
                  {serviceOn ? 'Buka — pelanggan berdatangan!' : 'Tutup — mode atur meja'}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-3 py-2 text-xs font-bold">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span>{repTier.emoji}</span>
                  <span className="text-amber-800 truncate">
                    {repTier.name}: {reputation}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-amber-800">
                    🍽️ {totalServed} dilayani
                  </span>
                  <span className="text-amber-600">
                    {activeCustomers.length} di meja
                  </span>
                </div>
              </div>
            </section>

            <RushBanner />

            {/* ── Zona 2: Ruang Makan ── */}
            <section className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 overflow-hidden mb-3 sm:mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 pt-3 pb-1">
                <h3 className="font-display font-bold text-base text-amber-900 flex items-center gap-1.5">
                  <span>🍽️</span> Ruang Makan
                  <span className="text-[10px] font-bold text-amber-700 bg-white/70 border border-amber-200 rounded-full px-2 py-0.5">
                    {activeCustomers.length}/{totalTables}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => serveAllCustomers()}
                  disabled={activeCustomers.length === 0}
                  className="btn-gold !px-3 !py-1.5 !text-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  🍽️ Layani Semua
                </button>
              </div>
              <p className="px-3 sm:px-4 text-[11px] text-amber-700 font-medium">
                {serviceOn
                  ? "Ketuk pelanggan untuk menyajikan hidangannya!"
                  : "Restoran tutup — tidak ada pelanggan baru."}
              </p>
              <div className="p-3 sm:p-4">
                <TableGrid />
              </div>
            </section>

            {/* ── Zona 3: Dapur ── */}
            <section className="rounded-2xl border-2 border-orange-300/70 bg-gradient-to-b from-orange-50 to-amber-50 overflow-hidden">
              <div className="p-3 sm:p-4 [&_.mb-6]:mb-0">
                <CraftingWidget
                  queueOnly
                  title="Dapur Saya"
                  icon="🍳"
                />
              </div>
            </section>
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
                          className="flex-1 !min-h-[2rem] !py-1 !px-2 !text-[10px] whitespace-nowrap"
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
                                  {dailySpecial === recipe.id && (
                                    <span
                                      className="text-xs"
                                      title="Menu Spesial hari ini — harga +50%!"
                                    >
                                      ⭐
                                    </span>
                                  )}
                                </span>
                                <span className="shop-item-name">
                                  {recipe.name}
                                </span>
                                <span className="shop-item-price">
                                  {recipe.price} 💰
                                </span>

                                {!isUnlocked && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 rounded backdrop-blur-[1px]">
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
                                  className="absolute top-1 left-1 w-8 h-8 rounded-lg bg-green-400 text-white flex items-center justify-center text-sm shadow-md z-10 transition-colors"
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
                                className={`absolute top-1 right-1 w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-md z-10 transition-colors ${
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
                    <div className="mt-5 pt-4 border-t-2 border-dashed border-[var(--wood)]/30">
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
                    </div>
                  </>
                ),
              },
              {
                id: "info",
                label: "Info",
                emoji: "📋",
                content: (
                  <div className="flex flex-col gap-4">
                    <MenuBoard />
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
