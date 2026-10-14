import test from 'node:test'
import assert from 'node:assert/strict'

import salaryTable from '../assets/salaris_tabel.json' with { type: 'json' }
import vrijvalStaffels from '../assets/vrijvalstaffels.json' with { type: 'json' }

const maxEmployerContribution = 137800
const taxOneMaxYearlySalary = 75518
const tariffOnePercentage = 0.63
const tariffTwoPercentage = 0.505

function calculatePensionContribution({ func, scale, employmentPercentage, age, selectedPercentage }) {
  const scaleEntry = salaryTable[String(scale)]
  const salaryString = func === 'FO' ? scaleEntry.fo : scaleEntry.cpt
  const monthlySalary = Number(salaryString.replace(',', '.')) * (employmentPercentage / 100)
  const retirementGivingSalary = monthlySalary * 12.84
  const staffels = vrijvalStaffels[String(age)]

  const vrijval1 = retirementGivingSalary > maxEmployerContribution
    ? (maxEmployerContribution / 12) * staffels[1]
    : (retirementGivingSalary / 12) * staffels[1]

  const vrijval2 = retirementGivingSalary > maxEmployerContribution
    ? ((retirementGivingSalary - maxEmployerContribution) / 12) * staffels[2]
    : 0

  const brutoContribution = retirementGivingSalary / 12 * 0.1
  const completedBrutoContribution = brutoContribution * (selectedPercentage / 10)
  const totalBruto = completedBrutoContribution + vrijval1 + vrijval2

  let calculatedContribution
  if (monthlySalary * 12 > taxOneMaxYearlySalary) {
    calculatedContribution = totalBruto * tariffTwoPercentage
  } else if ((monthlySalary * 12) + (totalBruto * 12) > taxOneMaxYearlySalary) {
    const tariffOneLeftOver = taxOneMaxYearlySalary - (monthlySalary * 12)
    const tariffTwoAmount = (totalBruto * 12) - tariffOneLeftOver
    const netYearly = tariffOneLeftOver * tariffOnePercentage + tariffTwoAmount * tariffTwoPercentage
    calculatedContribution = netYearly / 12
  } else {
    calculatedContribution = totalBruto * tariffOnePercentage
  }

  return Number(calculatedContribution.toFixed(2))
}

function calculateBlockProtection({
  notificationTimestamp,
  originalReportingTimestamp,
  originalSignOutTimestamp,
  newReportingTimestamp,
  newSignOutTimestamp
}) {
  const notificationTime = new Date(notificationTimestamp).getTime()
  const originalReportingTime = new Date(originalReportingTimestamp).getTime()
  const originalSignOutTime = new Date(originalSignOutTimestamp).getTime()
  const newReportingTime = new Date(newReportingTimestamp).getTime()
  const newSignOutTime = new Date(newSignOutTimestamp).getTime()

  const hoursDiff = Math.floor(Math.abs(notificationTime - originalReportingTime) / (1000 * 60 * 60))

  let bracket
  let permissionRequired = 'Nee'
  let compensation

  const reportTimeChange = (newReportingTime - originalReportingTime) / (1000 * 60 * 60)
  const signOutTimeChange = (newSignOutTime - originalSignOutTime) / (1000 * 60 * 60)

  if (hoursDiff > 336) {
    bracket = 1
    compensation = 0
  } else if (hoursDiff <= 336 && hoursDiff > 168) {
    bracket = 2
    if (Math.abs(reportTimeChange) > 3 || Math.abs(signOutTimeChange) > 3) {
      permissionRequired = 'Ja'
      compensation = '1 PD'
    }
  } else if (hoursDiff <= 168 && hoursDiff >= 24) {
    bracket = 3
    if ((reportTimeChange > -2 && signOutTimeChange <= 2)) {
      permissionRequired = 'Nee'
      compensation = 'Geen'
    } else if ((reportTimeChange > -3) && (signOutTimeChange < 3)) {
      permissionRequired = 'Nee'
      compensation = '1 PD'
    } else if (reportTimeChange <= -3 || signOutTimeChange >= 3) {
      permissionRequired = 'Ja'
      compensation = '1 PD'
    }
  } else {
    bracket = 4
    if (reportTimeChange < 0 || signOutTimeChange > 2) {
      permissionRequired = 'Ja'
      compensation = '1 PD'
    } else {
      permissionRequired = 'Nee'
      compensation = 'Geen'
    }
  }

  return { bracket, permissionRequired, compensation }
}

test('pensioen calculator returns stable representative outputs', () => {
  assert.equal(calculatePensionContribution({
    func: 'FO',
    scale: 1,
    employmentPercentage: 100,
    age: 25,
    selectedPercentage: 15,
  }), 672.47)

  assert.equal(calculatePensionContribution({
    func: 'FO',
    scale: 20,
    employmentPercentage: 75,
    age: 40,
    selectedPercentage: 12,
  }), 946.1)

  assert.equal(calculatePensionContribution({
    func: 'CPT',
    scale: 32,
    employmentPercentage: 100,
    age: 57,
    selectedPercentage: 15,
  }), 4855.94)
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
