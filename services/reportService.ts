import { FirebaseService } from './firebaseService'
import type { FloodReport, Location, FloodSeverity } from '~/types'

export interface ReportFilter {
  severity?: FloodSeverity
  verified?: boolean
  userIdFilter?: string
  location?: Location
  radius?: number // km
  startDate?: Date
  endDate?: Date
}

export class ReportService extends FirebaseService {
  /**
   * Get reports with filtering
   */
  async getFilteredReports(filter: ReportFilter, limit: number = 50): Promise<FloodReport[]> {
    const allReports = await this.getFloodReports(limit * 2) // Get more for filtering

    let filtered = allReports

    // Filter by severity
    if (filter.severity) {
      filtered = filtered.filter(r => r.severity === filter.severity)
    }

    // Filter by verified status
    if (filter.verified !== undefined) {
      filtered = filtered.filter(r => r.verified === filter.verified)
    }

    // Filter by user
    if (filter.userIdFilter) {
      filtered = filtered.filter(r => r.userId === filter.userIdFilter)
    }

    // Filter by location radius
    if (filter.location && filter.radius) {
      const { calculateDistance } = await import('~/stores/risk')
      const riskStore = (await import('~/stores/risk')).useRiskStore()

      filtered = filtered.filter(r => {
        const distance = riskStore.calculateDistance(filter.location!, r.location)
        return distance <= (filter.radius || 0)
      })
    }

    // Filter by date range
    if (filter.startDate) {
      filtered = filtered.filter(r => r.createdAt >= filter.startDate!)
    }
    if (filter.endDate) {
      filtered = filtered.filter(r => r.createdAt <= filter.endDate!)
    }

    return filtered.slice(0, limit)
  }

  /**
   * Get reports near location
   */
  async getReportsNearLocation(location: Location, radius: number = 5): Promise<FloodReport[]> {
    return this.getFilteredReports({ location, radius })
  }

  /**
   * Get user's reports
   */
  async getUserReports(userId: string): Promise<FloodReport[]> {
    return this.getFilteredReports({ userIdFilter: userId }, 100)
  }

  /**
   * Get verified reports only
   */
  async getVerifiedReports(limit: number = 50): Promise<FloodReport[]> {
    return this.getFilteredReports({ verified: true }, limit)
  }

  /**
   * Verify a report (admin only)
   */
  async verifyReport(reportId: string): Promise<void> {
    await this.updateFloodReport(reportId, { verified: true })
  }

  /**
   * Get report statistics
   */
  async getReportStats(): Promise<{
    total: number
    verified: number
    bySeverity: Record<FloodSeverity, number>
    recentCount: number
  }> {
    const reports = await this.getFloodReports(1000)

    const stats = {
      total: reports.length,
      verified: reports.filter(r => r.verified).length,
      bySeverity: {
        NONE: 0,
        MINOR: 0,
        MODERATE: 0,
        SEVERE: 0,
        CRITICAL: 0
      } as Record<FloodSeverity, number>,
      recentCount: 0
    }

    // Count by severity
    reports.forEach(r => {
      stats.bySeverity[r.severity]++
    })

    // Count recent (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    stats.recentCount = reports.filter(r => r.createdAt >= oneDayAgo).length

    return stats
  }
}

// Composable
export const useReportService = () => {
  const { $firebase } = useNuxtApp()
  return new ReportService($firebase.firestore)
}
