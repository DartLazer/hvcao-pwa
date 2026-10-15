export const maxEmployerContribution = 137800
export const taxOneMaxYearlySalary = 75518
export const tariffOnePercentage = 0.63
export const tariffTwoPercentage = 0.505

export function getSalaryByFunctionAndScale(salaryTable, func, scale, employmentPercentage) {
  const scaleEntry = salaryTable[scale.toString()]
  if (!scaleEntry) {
    return 0
  }
  const salaryString = func === 'FO' ? scaleEntry.fo : scaleEntry.cpt
  return Number(salaryString.replace(',', '.')) * (employmentPercentage / 100)
}

export function getVrijvalStaffelsByAge(vrijvalStaffels, age) {
  return vrijvalStaffels[age.toString()] || {}
}

export function calculatePensionContribution({
  salaryTable,
  vrijvalStaffels,
  func,
  scale,
  employmentPercentage,
  age,
  selectedPercentage,
}) {
  const monthlySalary = getSalaryByFunctionAndScale(salaryTable, func, scale, employmentPercentage)
  const retirementGivingSalary = monthlySalary * 12.84
  const staffels = getVrijvalStaffelsByAge(vrijvalStaffels, age)

  const staffel1 = retirementGivingSalary > maxEmployerContribution
    ? (maxEmployerContribution / 12) * (staffels[1] || 0)
    : (retirementGivingSalary / 12) * (staffels[1] || 0)

  const staffel2 = retirementGivingSalary > maxEmployerContribution
    ? ((retirementGivingSalary - maxEmployerContribution) / 12) * (staffels[2] || 0)
    : 0

  const brutoContribution = retirementGivingSalary / 12 * 0.1
  const completedBrutoContribution = brutoContribution * (selectedPercentage / 10)
  const totalBruto = completedBrutoContribution + staffel1 + staffel2

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

  return {
    monthlySalary,
    retirementGivingSalary,
    staffel1,
    staffel2,
    brutoContribution,
    completedBrutoContribution,
    totalBruto,
    calculatedContribution,
  }
}
