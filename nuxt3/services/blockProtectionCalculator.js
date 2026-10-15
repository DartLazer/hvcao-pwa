export function calculateBlockProtection({
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

  const timeDiff = Math.abs(notificationTime - originalReportingTime)
  const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))

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
    if (reportTimeChange > -2 && signOutTimeChange <= 2) {
      permissionRequired = 'Nee'
      compensation = 'Geen'
    } else if (reportTimeChange > -3 && signOutTimeChange < 3) {
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

  return {
    bracket,
    permissionRequired,
    compensation,
  }
}
