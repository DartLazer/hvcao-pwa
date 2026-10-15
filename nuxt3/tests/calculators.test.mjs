import test from 'node:test'
import assert from 'node:assert/strict'

import salaryTable from '../assets/salaris_tabel.json' with { type: 'json' }
import vrijvalStaffels from '../assets/vrijvalstaffels.json' with { type: 'json' }
import { calculatePensionContribution } from '../services/pensionCalculator.js'
import { calculateBlockProtection } from '../services/blockProtectionCalculator.js'

function calculatePension(input) {
  const result = calculatePensionContribution({
    salaryTable,
    vrijvalStaffels,
    ...input,
  })
  return Number(result.calculatedContribution.toFixed(2))
}

test('pensioen calculator returns stable representative outputs', () => {
  assert.equal(calculatePension({
    func: 'FO',
    scale: 1,
    employmentPercentage: 100,
    age: 25,
    selectedPercentage: 15,
  }), 672.47)

  assert.equal(calculatePension({
    func: 'FO',
    scale: 20,
    employmentPercentage: 75,
    age: 40,
    selectedPercentage: 12,
  }), 946.1)

  assert.equal(calculatePension({
    func: 'CPT',
    scale: 32,
    employmentPercentage: 100,
    age: 57,
    selectedPercentage: 15,
  }), 4855.94)
})

test('pensioen calculator keeps tax-boundary behavior', () => {
  assert.equal(calculatePension({
    func: 'FO',
    scale: 1,
    employmentPercentage: 100,
    age: 25,
    selectedPercentage: 10,
  }), 521.97)

  assert.equal(calculatePension({
    func: 'FO',
    scale: 9,
    employmentPercentage: 100,
    age: 33,
    selectedPercentage: 10,
  }), 764.73)
})

test('blokbescherming calculator keeps existing bracket and compensation logic', () => {
  assert.deepEqual(calculateBlockProtection({
    notificationTimestamp: '2026-01-01T00:00:00Z',
    originalReportingTimestamp: '2026-01-20T00:00:00Z',
    originalSignOutTimestamp: '2026-01-20T08:00:00Z',
    newReportingTimestamp: '2026-01-20T00:00:00Z',
    newSignOutTimestamp: '2026-01-20T08:00:00Z',
  }), { bracket: 1, permissionRequired: 'Nee', compensation: 0 })

  assert.deepEqual(calculateBlockProtection({
    notificationTimestamp: '2026-01-10T00:00:00Z',
    originalReportingTimestamp: '2026-01-20T00:00:00Z',
    originalSignOutTimestamp: '2026-01-20T08:00:00Z',
    newReportingTimestamp: '2026-01-20T05:30:00Z',
    newSignOutTimestamp: '2026-01-20T08:00:00Z',
  }), { bracket: 2, permissionRequired: 'Ja', compensation: '1 PD' })

  assert.deepEqual(calculateBlockProtection({
    notificationTimestamp: '2026-01-17T00:00:00Z',
    originalReportingTimestamp: '2026-01-20T00:00:00Z',
    originalSignOutTimestamp: '2026-01-20T08:00:00Z',
    newReportingTimestamp: '2026-01-20T02:00:00Z',
    newSignOutTimestamp: '2026-01-20T09:00:00Z',
  }), { bracket: 3, permissionRequired: 'Nee', compensation: 'Geen' })

  assert.deepEqual(calculateBlockProtection({
    notificationTimestamp: '2026-01-19T10:00:00Z',
    originalReportingTimestamp: '2026-01-20T00:00:00Z',
    originalSignOutTimestamp: '2026-01-20T08:00:00Z',
    newReportingTimestamp: '2026-01-19T23:00:00Z',
    newSignOutTimestamp: '2026-01-20T08:00:00Z',
  }), { bracket: 4, permissionRequired: 'Ja', compensation: '1 PD' })
})

test('blokbescherming calculator keeps boundary transitions at 336/168/24 hours', () => {
  assert.equal(calculateBlockProtection({
    notificationTimestamp: '2026-01-06T00:00:00Z',
    originalReportingTimestamp: '2026-01-20T00:00:00Z',
    originalSignOutTimestamp: '2026-01-20T08:00:00Z',
    newReportingTimestamp: '2026-01-20T00:00:00Z',
    newSignOutTimestamp: '2026-01-20T08:00:00Z',
  }).bracket, 2)

  assert.equal(calculateBlockProtection({
    notificationTimestamp: '2026-01-13T00:00:00Z',
    originalReportingTimestamp: '2026-01-20T00:00:00Z',
    originalSignOutTimestamp: '2026-01-20T08:00:00Z',
    newReportingTimestamp: '2026-01-20T00:00:00Z',
    newSignOutTimestamp: '2026-01-20T08:00:00Z',
  }).bracket, 3)

  assert.equal(calculateBlockProtection({
    notificationTimestamp: '2026-01-19T00:00:00Z',
    originalReportingTimestamp: '2026-01-20T00:00:00Z',
    originalSignOutTimestamp: '2026-01-20T08:00:00Z',
    newReportingTimestamp: '2026-01-20T00:00:00Z',
    newSignOutTimestamp: '2026-01-20T08:00:00Z',
  }).bracket, 3)

  assert.equal(calculateBlockProtection({
    notificationTimestamp: '2026-01-19T01:00:00Z',
    originalReportingTimestamp: '2026-01-20T00:00:00Z',
    originalSignOutTimestamp: '2026-01-20T08:00:00Z',
    newReportingTimestamp: '2026-01-20T00:00:00Z',
    newSignOutTimestamp: '2026-01-20T08:00:00Z',
  }).bracket, 4)
})
