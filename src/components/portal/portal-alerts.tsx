import Link from "next/link";
import { Megaphone, Bell, MessageSquare, FolderLock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatting";
import type { PortalData } from "@/lib/portal/portal-types";

type PortalAlertsProps = {
  data: PortalData;
};

export function PortalAlerts({ data }: PortalAlertsProps) {
  const { announcements, notifications, messages, privateFiles } = data;

  const hasAlerts = 
    announcements.length > 0 || 
    notifications.length > 0 || 
    messages.length > 0 || 
    privateFiles.length > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {announcements.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                Announcements
              </h3>
              <Link 
                href="/app/announcements" 
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((announcement) => (
              <div 
                key={announcement.id} 
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{announcement.title}</p>
                  {announcement.requiresAcknowledgement && !announcement.isAcknowledged && (
                    <Badge className="bg-amber-50 text-amber-700">
                      Action required
                    </Badge>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span>{formatDate(announcement.publishedAt)}</span>
                  <Badge>{announcement.priority}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </h3>
              <Link 
                href="/app/notifications" 
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`rounded-lg border p-3 ${
                  notification.isRead ? 'border-slate-200 bg-slate-50' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{notification.title}</p>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span>{formatDate(notification.createdAt)}</span>
                  <Badge>{notification.type}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {messages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </h3>
              <Link 
                href="/app/messages" 
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className="rounded-lg border border-slate-200 p-3"
              >
                <p className="font-medium text-sm">
                  {message.title || message.participantNames.join(", ")}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span>Last active: {formatDate(message.lastMessageAt)}</span>
                  {message.unreadCount > 0 && (
                    <Badge className="bg-blue-600 text-white">
                      {message.unreadCount} unread
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {privateFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <FolderLock className="h-4 w-4" />
                Private Files
              </h3>
              <Link 
                href="/app/files" 
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {privateFiles.map((file) => (
              <div 
                key={file.id} 
                className="rounded-lg border border-slate-200 p-3"
              >
                <p className="font-medium text-sm">{file.name}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                  <span>{file.category}</span>
                  <span>{formatDate(file.uploadedAt)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
