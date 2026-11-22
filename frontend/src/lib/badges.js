export const BADGES_EVENT = 'geezestudy:badges-refresh'

/** Minta sidebar mengambil ulang angka lencana (mis. setelah membaca notifikasi atau membalas laporan). */
export const refreshBadges = () => window.dispatchEvent(new Event(BADGES_EVENT))
