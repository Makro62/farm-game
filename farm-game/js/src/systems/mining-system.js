/**
 * Mining System - Pertambangan Mineral
 * Grid-based mining dengan 5 jenis mineral dan alat upgradeable
 */

import { S } from '../core/state.js';
import { notificationManager } from '../managers/notification-manager.js';
import { addXP } from '../utils/helpers.js';

// Konfigurasi Mining
export const MINING_CONFIG = {
  GRID_SIZE: { rows: 4, cols: 6 }, // 24 nodes total
  REGEN_TIME: 300, // 5 menit dalam detik
  BASE_DROP_CHANCE: 0.8
};

// Definisi Mineral
export const MINERALS = {
  stone: {
    id: 'stone',
    name: 'Batu',
    emoji: '🪨',
    sellPrice: 5,
    xpReward: 1,
    dropChance: 1.0, // Selalu drop
    minNodeLevel: 0
  },
  copper: {
    id: 'copper',
    name: 'Tembaga',
    emoji: '🔶',
    sellPrice: 30,
    xpReward: 5,
    dropChance: 0.5,
    minNodeLevel: 1
  },
  iron: {
    id: 'iron',
    name: 'Besi',
    emoji: '⚫',
    sellPrice: 80,
    xpReward: 12,
    dropChance: 0.3,
    minNodeLevel: 2
  },
  gold: {
    id: 'gold',
    name: 'Emas',
    emoji: '🟡',
    sellPrice: 300,
    xpReward: 30,
    dropChance: 0.15,
    minNodeLevel: 3
  },
  diamond: {
    id: 'diamond',
    name: 'Berlian',
    emoji: '💎',
    sellPrice: 1000,
    xpReward: 100,
    dropChance: 0.05,
    minNodeLevel: 4
  }
};

// Definisi Alat Tambang
export const MINING_TOOLS = {
  wooden_pickaxe: {
    id: 'wooden_pickaxe',
    name: 'Cangkul Kayu',
    emoji: '🪓',
    speed: 1.0,
    bonusDrop: 0,
    regenReduction: 0,
    requirement: null
  },
  copper_pickaxe: {
    id: 'copper_pickaxe',
    name: 'Cangkul Tembaga',
    emoji: '🔶',
    speed: 1.5,
    bonusDrop: 0.1,
    regenReduction: 60,
    requirement: { copper: 5 }
  },
  iron_pickaxe: {
    id: 'iron_pickaxe',
    name: 'Cangkul Besi',
    emoji: '⚫',
    speed: 2.5,
    bonusDrop: 0.25,
    regenReduction: 60,
    requirement: { iron: 5, copper: 3 }
  },
  gold_pickaxe: {
    id: 'gold_pickaxe',
    name: 'Cangkul Emas',
    emoji: '🟡',
    speed: 4.0,
    bonusDrop: 0.5,
    regenReduction: 120,
    requirement: { gold: 3, iron: 10 }
  },
  diamond_pickaxe: {
    id: 'diamond_pickaxe',
    name: 'Cangkul Diamond',
    emoji: '💎',
    speed: 6.0,
    bonusDrop: 1.0, // ×2 drop
    regenReduction: 180,
    requirement: { diamond: 2, gold: 5 }
  }
};

/**
 * Inisialisasi sistem mining
 */
export function initMiningSystem() {
  if (!S.mining) {
    S.mining = {
      grid: [],
      currentTool: 'wooden_pickaxe',
      unlockedTools: ['wooden_pickaxe'],
      miningInProgress: false
    };

    // Generate grid awal
    generateMiningGrid();
  }
}

/**
 * Generate grid mining dengan node acak
 */
export function generateMiningGrid() {
  S.mining.grid = [];

  for (let row = 0; row < MINING_CONFIG.GRID_SIZE.rows; row++) {
    for (let col = 0; col < MINING_CONFIG.GRID_SIZE.cols; col++) {
      const nodeType = rollNodeType();
      S.mining.grid.push({
        id: `node-${row}-${col}`,
        row,
        col,
        type: nodeType,
        depleted: false,
        lastMined: null,
        progress: 0
      });
    }
  }
}

/**
 * Roll tipe node berdasarkan weighted random
 */
function rollNodeType() {
  const rand = Math.random();
  
  // Weighted probabilities
  if (rand < 0.40) return 'stone';      // 40%
  if (rand < 0.70) return 'copper';     // 30%
  if (rand < 0.88) return 'iron';       // 18%
  if (rand < 0.97) return 'gold';       // 9%
  return 'diamond';                      // 3%
}

/**
 * Dapatkan alat tambang saat ini
 */
export function getCurrentTool() {
  return MINING_TOOLS[S.mining.currentTool] || MINING_TOOLS.wooden_pickaxe;
}

/**
 * Cek apakah bisa upgrade ke alat tertentu
 */
export function canUpgradeTool(toolId) {
  const tool = MINING_TOOLS[toolId];
  if (!tool || !tool.requirement) return false;

  // Cek apakah sudah unlocked
  if (S.mining.unlockedTools.includes(toolId)) return false;

  // Cek material requirement
  for (const [material, qty] of Object.entries(tool.requirement)) {
    const invItem = S.inventory.find(inv => inv.id === material);
    if (!invItem || invItem.qty < qty) {
      return false;
    }
  }

  return true;
}

/**
 * Upgrade alat tambang
 */
export function upgradeTool(toolId) {
  if (!canUpgradeTool(toolId)) {
    notificationManager.show('❌ Material tidak cukup!', 'error');
    return false;
  }

  const tool = MINING_TOOLS[toolId];

  // Deduct materials
  for (const [material, qty] of Object.entries(tool.requirement)) {
    const invIndex = S.inventory.findIndex(inv => inv.id === material);
    if (invIndex !== -1) {
      S.inventory[invIndex].qty -= qty;
      if (S.inventory[invIndex].qty <= 0) {
        S.inventory.splice(invIndex, 1);
      }
    }
  }

  // Unlock tool
  S.mining.unlockedTools.push(toolId);
  S.mining.currentTool = toolId;

  notificationManager.show(
    `✅ ${tool.emoji} ${tool.name} terbuka! Speed: ×${tool.speed}`,
    'success'
  );

  return true;
}

/**
 * Mulai mining pada node
 */
export function startMining(nodeIndex) {
  const node = S.mining.grid[nodeIndex];
  if (!node) return false;

  // Cek apakah node depleted
  if (node.depleted) {
    // Cek apakah sudah regenerate
    if (node.lastMined) {
      const elapsed = Date.now() - node.lastMined;
      const regenTime = (MINING_CONFIG.REGEN_TIME - getCurrentTool().regenReduction) * 1000;
      
      if (elapsed < regenTime) {
        const remaining = Math.ceil((regenTime - elapsed) / 1000);
        notificationManager.show(`⏳ Node masih kosong (${remaining}s lagi)`, 'info');
        return false;
      } else {
        // Regenerate node
        node.depleted = false;
        node.type = rollNodeType();
        node.lastMined = null;
      }
    } else {
      notificationManager.show('❌ Node sudah habis!', 'error');
      return false;
    }
  }

  // Set mining in progress
  S.mining.miningInProgress = true;
  S.mining.currentNode = nodeIndex;
  node.progress = 0;

  notificationManager.show('⛏️ Menambang...', 'info');
  return true;
}

/**
 * Update progress mining (dipanggil setiap game tick)
 */
export function updateMiningProgress() {
  if (!S.mining.miningInProgress || S.mining.currentNode === undefined) return;

  const node = S.mining.grid[S.mining.currentNode];
  if (!node) return;

  const tool = getCurrentTool();
  const baseProgress = 10; // Base progress per tick
  node.progress += baseProgress * tool.speed;

  if (node.progress >= 100) {
    completeMining(node);
  }
}

/**
 * Selesai mining - dapatkan reward
 */
function completeMining(node) {
  const tool = getCurrentTool();
  const mineral = MINERALS[node.type];

  // Reset node
  S.mining.miningInProgress = false;
  S.mining.currentNode = undefined;
  node.depleted = true;
  node.lastMined = Date.now();
  node.progress = 0;

  // Roll drops
  const drops = [];
  
  // Stone selalu drop
  drops.push({ ...MINERALS.stone, qty: 1 });

  // Roll mineral utama
  const dropChance = mineral.dropChance + tool.bonusDrop;
  if (Math.random() < dropChance) {
    const existingDrop = drops.find(d => d.id === mineral.id);
    if (existingDrop) {
      existingDrop.qty++;
    } else {
      drops.push({ ...mineral, qty: 1 });
    }
  }

  // Bonus drop dari tool (diamond pickaxe = ×2)
  if (tool.bonusDrop >= 1.0 && Math.random() < 0.5) {
    const randomMineral = Object.values(MINERALS)[Math.floor(Math.random() * Object.keys(MINERALS).length)];
    drops.push({ ...randomMineral, qty: 1 });
  }

  // Tambahkan ke inventory
  drops.forEach(drop => {
    const existingItem = S.inventory.find(inv => inv.id === drop.id);
    if (existingItem) {
      existingItem.qty += drop.qty;
    } else {
      S.inventory.push({ id: drop.id, qty: drop.qty });
    }
    
    addXP(drop.xpReward * drop.qty);
  });

  // Notifikasi hasil
  const dropText = drops.map(d => `${d.emoji} x${d.qty}`).join(', ');
  notificationManager.show(`⛏️ Mendapat: ${dropText}`, 'success');
}

/**
 * Render UI mining grid
 */
export function renderMiningGrid() {
  const container = document.getElementById('mining-grid');
  if (!container) return;

  if (!S.mining || !S.mining.grid.length) {
    container.innerHTML = '<div class="empty-state">⛏️ Tab Tambang belum tersedia (butuh Level 5)</div>';
    return;
  }

  const tool = getCurrentTool();

  container.innerHTML = `
    <div class="mining-header">
      <div class="current-tool">
        🔧 Alat: ${tool.emoji} ${tool.name}
        <span class="tool-stats">
          Speed: ×${tool.speed} | Drop: +${tool.bonusDrop * 100}% | Regen: -${tool.regenReduction}s
        </span>
      </div>
      <div class="mining-tools">
        ${Object.values(MINING_TOOLS).map(t => {
          const unlocked = S.mining.unlockedTools.includes(t.id);
          const canUpgrade = !unlocked && canUpgradeTool(t.id);
          return `
            <button 
              class="tool-btn ${t.id === S.mining.currentTool ? 'active' : ''} ${unlocked ? 'unlocked' : ''}"
              onclick="window.handleSelectTool('${t.id}')"
              ${!unlocked && !canUpgrade ? 'disabled' : ''}
            >
              ${t.emoji} ${t.name}
              ${!unlocked ? '(🔒)' : ''}
            </button>
          `;
        }).join('')}
      </div>
    </div>
    <div class="mining-grid-board" style="grid-template-columns: repeat(${MINING_CONFIG.GRID_SIZE.cols}, 1fr)">
      ${S.mining.grid.map((node, index) => {
        const mineral = MINERALS[node.type];
        const isDepleted = node.depleted;
        const isMining = S.mining.currentNode === index;
        
        let nodeClass = 'mining-node';
        if (isDepleted) nodeClass += ' depleted';
        if (isMining) nodeClass += ' mining';
        
        // Warna berdasarkan tipe mineral
        const typeColors = {
          stone: '#8B8B8B',
          copper: '#B87333',
          iron: '#4A4A4A',
          gold: '#FFD700',
          diamond: '#B9F2FF'
        };

        return `
          <div 
            class="${nodeClass}" 
            data-node-id="${node.id}"
            onclick="window.handleMineNode(${index})"
            style="border-color: ${typeColors[node.type]}"
          >
            <div class="node-content">
              ${isDepleted ? '🪨' : mineral.emoji}
              ${isMining ? `<div class="mining-progress-bar"><div class="progress" style="width: ${node.progress}%"></div></div>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Expose ke window untuk onclick handlers
window.handleSelectTool = (toolId) => {
  if (S.mining.unlockedTools.includes(toolId)) {
    S.mining.currentTool = toolId;
    renderMiningGrid();
    notificationManager.show(`🔧 Menggunakan ${MINING_TOOLS[toolId].name}`, 'info');
  } else if (canUpgradeTool(toolId)) {
    if (upgradeTool(toolId)) {
      renderMiningGrid();
    }
  }
};

window.handleMineNode = (nodeIndex) => {
  if (!S.mining.miningInProgress) {
    startMining(nodeIndex);
    renderMiningGrid();
  }
};

export default {
  initMiningSystem,
  generateMiningGrid,
  startMining,
  updateMiningProgress,
  upgradeTool,
  canUpgradeTool,
  getCurrentTool,
  renderMiningGrid,
  MINERALS,
  MINING_TOOLS,
  MINING_CONFIG
};
