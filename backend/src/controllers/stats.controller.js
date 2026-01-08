/**
 * Statistics Controller
 * Provides admin analytics endpoints
 */

import prisma from '../config/database.js';
import { SubscriptionPlan } from '@prisma/client';

/**
 * Get quota usage per user
 * GET /api/stats/usage
 */
export const getUsageStats = async (req, res) => {
  try {
    // Get token usage per user
    const tokenUsage = await prisma.tokenUsage.groupBy({
      by: ['userId'],
      _sum: {
        tokensUsed: true
      },
      orderBy: {
        _sum: {
          tokensUsed: 'desc'
        }
      },
      take: 50 // Top 50 users
    });

    // Get user details for each user
    const userIds = tokenUsage.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    // Map users to their token usage
    const usageData = tokenUsage.map(usage => {
      const user = users.find(u => u.id === usage.userId);
      return {
        userId: usage.userId,
        email: user?.email || 'Unknown',
        name: user?.name || null,
        tokensUsed: usage._sum.tokensUsed || 0
      };
    });

    return res.status(200).json({
      success: true,
      data: usageData
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve usage statistics'
      }
    });
  }
};

/**
 * Get plan adoption rates
 * GET /api/stats/plans
 */
export const getPlanStats = async (req, res) => {
  try {
    // Get subscription counts by plan
    const planCounts = await prisma.subscription.groupBy({
      by: ['plan'],
      _count: {
        id: true
      },
      where: {
        status: 'ACTIVE' // Only count active subscriptions
      }
    });

    // Also get total users (including those without subscriptions)
    const totalUsers = await prisma.user.count();

    // Format data for charts
    const planData = [
      {
        name: 'Free',
        value: planCounts.find(p => p.plan === SubscriptionPlan.FREE)?._count.id || 0,
        color: '#94a3b8' // gray
      },
      {
        name: 'Pro',
        value: planCounts.find(p => p.plan === SubscriptionPlan.PRO)?._count.id || 0,
        color: '#3b82f6' // blue
      },
      {
        name: 'Enterprise',
        value: planCounts.find(p => p.plan === SubscriptionPlan.ENTERPRISE)?._count.id || 0,
        color: '#8b5cf6' // purple
      }
    ];

    // Calculate users without subscriptions (default to FREE)
    const usersWithSubscriptions = planData.reduce((sum, plan) => sum + plan.value, 0);
    planData[0].value += (totalUsers - usersWithSubscriptions);

    return res.status(200).json({
      success: true,
      data: {
        plans: planData,
        total: totalUsers
      }
    });
  } catch (error) {
    console.error('Error getting plan stats:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve plan statistics'
      }
    });
  }
};

/**
 * Get failed generation attempts
 * GET /api/stats/failures
 * 
 * Query params:
 * - days: Number of days to look back (default: 30)
 * - period: 'daily' or 'weekly' (default: 'daily')
 */
export const getFailureStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const period = req.query.period || 'daily';
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get feedback with low ratings (indicating failures/errors)
    const negativeFeedback = await prisma.feedback.findMany({
      where: {
        createdAt: {
          gte: startDate
        },
        OR: [
          { rating: { lte: 2 } }, // Low ratings indicate failures
          { comment: { contains: 'error', mode: 'insensitive' } },
          { comment: { contains: 'failed', mode: 'insensitive' } },
          { comment: { contains: 'retry', mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        createdAt: true,
        rating: true,
        contentType: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date period
    const groupedData = {};
    
    negativeFeedback.forEach(feedback => {
      const date = new Date(feedback.createdAt);
      let key;
      
      if (period === 'weekly') {
        // Get week start (Monday)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        weekStart.setHours(0, 0, 0, 0);
        key = weekStart.toISOString().split('T')[0];
      } else {
        // Daily
        key = date.toISOString().split('T')[0];
      }
      
      if (!groupedData[key]) {
        groupedData[key] = 0;
      }
      groupedData[key]++;
    });

    // Convert to array format for charts
    const failureData = Object.entries(groupedData)
      .map(([date, count]) => ({
        date,
        failures: count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Fill in missing dates with 0
    const filledData = [];
    const endDate = new Date();
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + (period === 'weekly' ? 7 : 1))) {
      const dateKey = d.toISOString().split('T')[0];
      const existing = failureData.find(f => f.date === dateKey);
      filledData.push({
        date: dateKey,
        failures: existing ? existing.failures : 0
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        failures: filledData,
        period,
        days,
        total: negativeFeedback.length
      }
    });
  } catch (error) {
    console.error('Error getting failure stats:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve failure statistics'
      }
    });
  }
};
