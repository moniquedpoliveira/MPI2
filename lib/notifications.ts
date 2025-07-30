export interface NotificationConfig {
  id: string;
  type: 'deadline_warning' | 'deadline_critical' | 'checklist_reminder' | 'system_alert';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetUsers: string[]; // emails dos usuários
  targetRoles: string[]; // roles dos usuários
  data?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  readBy: string[]; // emails dos usuários que leram
}

export class NotificationManager {
  private static instance: NotificationManager;
  private notifications: NotificationConfig[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  createNotification(config: Omit<NotificationConfig, 'id' | 'createdAt' | 'readBy'>): string {
    const notification: NotificationConfig = {
      ...config,
      id: this.generateId(),
      createdAt: new Date(),
      readBy: [],
    };

    this.notifications.push(notification);
    this.saveToStorage();
    this.showBrowserNotification(notification);

    return notification.id;
  }

  getNotificationsForUser(userEmail: string, userRole: string): NotificationConfig[] {
    return this.notifications
      .filter(notification =>
        (notification.targetUsers.includes(userEmail) ||
          notification.targetRoles.includes(userRole)) &&
        (!notification.expiresAt || notification.expiresAt > new Date())
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  markAsRead(notificationId: string, userEmail: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.readBy.includes(userEmail)) {
      notification.readBy.push(userEmail);
      this.saveToStorage();
    }
  }

  markAllAsRead(userEmail: string): void {
    for (const notification of this.notifications) {
      if (!notification.readBy.includes(userEmail)) {
        notification.readBy.push(userEmail);
      }
    }
    this.saveToStorage();
  }

  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveToStorage();
  }

  getUnreadCount(userEmail: string, userRole: string): number {
    return this.getNotificationsForUser(userEmail, userRole)
      .filter(notification => !notification.readBy.includes(userEmail))
      .length;
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
      } catch (error) {
        console.warn('Failed to save notifications to localStorage:', error);
      }
    }
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('notifications');
        if (stored) {
          const parsed = JSON.parse(stored);
          this.notifications = parsed.map((notification: any) => ({
            ...notification,
            createdAt: new Date(notification.createdAt),
            expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
          }));
        }
      } catch (error) {
        console.warn('Failed to load notifications from localStorage:', error);
      }
    }
  }

  private showBrowserNotification(notification: NotificationConfig): void {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  }

  requestNotificationPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.requestPermission().then(permission => permission === 'granted');
    }
    return Promise.resolve(false);
  }

  // Limpar notificações expiradas
  cleanupExpiredNotifications(): void {
    const now = new Date();
    this.notifications = this.notifications.filter(
      notification => !notification.expiresAt || notification.expiresAt > now
    );
    this.saveToStorage();
  }
}

// Funções utilitárias para criar notificações específicas
export function createDeadlineWarningNotification(
  contratoId: string,
  contratoNumero: string,
  daysUntilDeadline: number,
  targetEmails: string[]
): string {
  const notificationManager = NotificationManager.getInstance();

  return notificationManager.createNotification({
    type: 'deadline_warning',
    title: 'Prazo de Contrato se Aproximando',
    message: `O contrato ${contratoNumero} vence em ${daysUntilDeadline} dias. Verifique o status da fiscalização.`,
    priority: daysUntilDeadline <= 7 ? 'high' : 'medium',
    targetUsers: targetEmails,
    targetRoles: ['FISCAL_ADMINISTRATIVO', 'FISCAL_TECNICO'],
    data: { contratoId, daysUntilDeadline },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
  });
}

export function createChecklistReminderNotification(
  contratoId: string,
  contratoNumero: string,
  fiscalEmail: string,
  progressPercentage: number
): string {
  const notificationManager = NotificationManager.getInstance();

  return notificationManager.createNotification({
    type: 'checklist_reminder',
    title: 'Checklist Incompleto',
    message: `O checklist do contrato ${contratoNumero} está ${progressPercentage}% completo. Continue o preenchimento.`,
    priority: progressPercentage < 50 ? 'high' : 'medium',
    targetUsers: [fiscalEmail],
    targetRoles: [],
    data: { contratoId, progressPercentage },
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 dias
  });
}

export function createSystemAlertNotification(
  title: string,
  message: string,
  targetRoles: string[],
  priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): string {
  const notificationManager = NotificationManager.getInstance();

  return notificationManager.createNotification({
    type: 'system_alert',
    title,
    message,
    priority,
    targetUsers: [],
    targetRoles,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
  });
}

// Hook para gerenciar notificações no React
export function useNotifications(userEmail: string, userRole: string) {
  const notificationManager = NotificationManager.getInstance();

  return {
    notifications: notificationManager.getNotificationsForUser(userEmail, userRole),
    unreadCount: notificationManager.getUnreadCount(userEmail, userRole),
    markAsRead: (notificationId: string) => notificationManager.markAsRead(notificationId, userEmail),
    markAllAsRead: () => notificationManager.markAllAsRead(userEmail),
    deleteNotification: (notificationId: string) => notificationManager.deleteNotification(notificationId),
    requestPermission: () => notificationManager.requestNotificationPermission(),
  };
} 