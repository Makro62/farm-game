import type { StoreSet, StoreGet } from '@/types/game'
import { GAME_CONSTANTS } from '@/lib/constants'

export const createSeasonSlice = (set: StoreSet, get: StoreGet) => ({
  advanceSeasonTick: () => {
    const ticksPerDay = GAME_CONSTANTS.SYSTEM.SEASON_TICKS_PER_DAY
    const eventChanceThreshold = GAME_CONSTANTS.SYSTEM.RANDOM_EVENT_CHANCE
    set(state => {
      if (!state.season) return state
      let { tick, day, current } = state.season
      let activeEvent = state.activeEvent
      tick += 1
      if (tick >= ticksPerDay) {
        tick = 0
        day += 1
        const eventChance = Math.random()
        if (eventChance < eventChanceThreshold) {
          const events = [
            {
              id: 'panen',
              name: '🎊 Festival Panen',
              desc: 'Harga jual semua tanaman x2 hari ini!',
            },
            {
              id: 'bahari',
              name: '🎣 Hari Bahari',
              desc: 'Ikan terjual dengan harga x2!',
            },
            {
              id: 'tambang',
              name: '💎 Demam Emas',
              desc: 'Peluang mendapat Emas & Berlian meningkat!',
            },
            {
              id: 'kebun',
              name: '🌻 Hari Berkebun',
              desc: 'Semua tanaman tumbuh 2x lebih cepat!',
            },
            {
              id: 'rakyat',
              name: '🎉 Pasar Rakyat',
              desc: 'Semua penjualan +50% hari ini!',
            },
          ]
          activeEvent = events[Math.floor(Math.random() * events.length)]
        } else {
          activeEvent = null
        }
        if (day > 7) {
          day = 1
          const seasons = ['spring', 'summer', 'autumn', 'winter']
          const idx = seasons.indexOf(current)
          current = seasons[(idx + 1) % 4]
        }
        setTimeout(() => get().updateMarket?.(), 0)
        setTimeout(() => {
          get().enqueueNotification(`🌅 Hari ke-${day} sudah dimulai!`, {
            id: 'new-day',
            type: 'success',
            sfx: 'newday',
          })
        }, 300)

        // --- WORKER WAGES & MORALE ---
        let currentCoins = state.coins
        const newWorkers = { ...state.workers }
        const wageNotifications: string[] = []

        Object.keys(newWorkers).forEach(type => {
          if (newWorkers[type]) {
            newWorkers[type] = { ...newWorkers[type] }
          }
          const worker = newWorkers[type]
          if (worker?.hired) {
            if (currentCoins >= worker.wagePerDay) {
              currentCoins -= worker.wagePerDay
              worker.daysEmployed += 1
              worker.totalWagesPaid += worker.wagePerDay
              // Random event: worker morale drops if they work too many days without bonus
              if (Math.random() < 0.2) {
                worker.happiness = Math.max(0, worker.happiness - 5)
              }
              if (worker.happiness < 30) {
                wageNotifications.push(
                  `⚠️ ${worker.name} tidak bahagia! Performanya menurun.`
                )
              }
              // Worker strike recovery: gaji terbayar lagi → kembali bekerja
              if (!worker.isWorking) {
                worker.isWorking = true
                worker.happiness = Math.min(100, worker.happiness + 10)
                wageNotifications.push(`✅ ${worker.name} kembali bekerja!`)
              }
            } else {
              // Not enough money to pay wage
              worker.isWorking = false
              worker.happiness = Math.max(0, worker.happiness - 30)
              worker.loyalty = Math.max(0, worker.loyalty - 20)
              wageNotifications.push(
                `🚨 ${worker.name} mogok kerja! Gaji harian (${worker.wagePerDay}💰) tidak terbayar.`
              )
            }
          }
        })

        setTimeout(() => {
          wageNotifications.forEach(msg =>
            get().enqueueNotification(msg, { type: 'error' })
          )
        }, 100)

        // --- BANK INTEREST (Fase 3) ---
        const bankBalance = state.town?.bankSavings || 0
        let newBankSavings = bankBalance
        if (bankBalance > 0) {
          const interest = Math.floor(
            bankBalance * (state.town?.bankInterestRate || 0.02)
          )
          if (interest > 0) {
            newBankSavings = bankBalance + interest
            setTimeout(() => {
              get().enqueueNotification(
                `🏦 Bunga bank +${interest} 💰 (saldo ${newBankSavings})`,
                { type: 'success' }
              )
            }, 150)
          }
        }

        // --- PEST & SPRINKLER (Fase 2) ---
        const newPlots = state.plots.map(p => ({ ...p }))
        const hasScarecrow = !!state.buildings?.scarecrow?.unlocked
        const hasSprinkler = !!state.buildings?.sprinkler?.unlocked
        const pestNotifications: string[] = []

        if (hasSprinkler) {
          newPlots.forEach(p => {
            if (p.status === 'growing') p.watered = true
          })
        }

        if (!hasScarecrow && Math.random() < 0.2) {
          const growing = newPlots.filter(
            p => p.status === 'growing' && !p.pestInfestation
          )
          if (growing.length > 0) {
            const target = growing[Math.floor(Math.random() * growing.length)]
            target.pestInfestation = true
            pestNotifications.push(
              '🐛 Hama menyerang ladang! Tanaman kena hama tumbuh lebih lambat.'
            )
          }
        }

        setTimeout(() => {
          pestNotifications.forEach(msg =>
            get().enqueueNotification(msg, { type: 'error' })
          )
        }, 200)

        return {
          season: { current, day, tick },
          activeEvent,
          energy: state.maxEnergy || 100,
          coins: currentCoins,
          workers: newWorkers,
          plots: newPlots,
          ...(newBankSavings !== bankBalance
            ? { town: { ...state.town, bankSavings: newBankSavings } }
            : {}),
          ...(activeEvent?.id === 'kebun'
            ? {
                growthMultiplier: 2,
                growthMultiplierExpireAt: Date.now() + ticksPerDay * 1000,
              }
            : {}),
        }
      }
      return { season: { current, day, tick }, activeEvent }
    })
  },

  changeWeather: () => {
    const state = get()
    if (!state.weather) return
    let { nextChangeIn } = state.weather
    nextChangeIn -= 1
    if (nextChangeIn <= 0) {
      const season = state.season?.current || 'spring'
      let weathers = [
        '☀️ Cerah',
        '⛅ Berawan',
        '🌧️ Hujan',
        '⛈️ Badai',
        '🌫️ Berkabut',
        '🌬️ Berangin',
      ]
      if (season === 'winter') {
        weathers = [
          '☀️ Cerah',
          '⛅ Berawan',
          '☃️ Bersalju',
          '🌬️ Berangin',
          '🌫️ Berkabut',
        ]
      }
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)]
      const effects = {
        cropGrowth: newWeather === '🌬️ Berangin' ? 1.1 : 1.0,
        miningRegen: newWeather === '⛈️ Badai' ? 0.5 : 1.0,
        animalProduce: newWeather === '⛈️ Badai' ? 0.8 : 1.0,
        fishingRare:
          newWeather === '🌧️ Hujan'
            ? 1.15
            : newWeather === '🌫️ Berkabut'
              ? 0.7
              : 1.0,
        customerRate: newWeather === '🌫️ Berkabut' ? 1.2 : 1.0,
      }
      if (newWeather === '🌧️ Hujan' || newWeather === '⛈️ Badai') {
        const plots = state.plots || []
        set({ plots: plots.map(p => ({ ...p, watered: true })) })
        get().enqueueNotification(
          'Cuaca memburuk! Semua tanaman tersiram otomatis 🌧️',
          { icon: '☔', type: 'info' }
        )
      }
      if (newWeather === '☃️ Bersalju') {
        const plots = state.plots || []
        set({
          plots: plots.map(p => {
            if (p.crop && p.status === 'growing')
              return { ...p, status: 'dead', growTime: null }
            return p
          }),
        })
        get().enqueueNotification(
          'Salju turun! Tanaman yang tumbuh menjadi layu ❄️',
          { icon: '⛄', type: 'info' }
        )
      }
      set({
        weather: { current: newWeather, nextChangeIn: 300 },
        weatherEffects: effects,
      })
    } else {
      set({ weather: { ...state.weather, nextChangeIn } })
    }
  },
})
