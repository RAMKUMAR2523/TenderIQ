"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, XCircle, Database, Clock, RefreshCw } from "lucide-react";

export function AdminConnectorsClient({ initialData }: { initialData: any }) {
  const { states, logs, newTendersToday, totalTenders, failedConnectors, successRate } = initialData;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connectors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{states.length}</div>
            <p className="text-xs text-muted-foreground">Running on schedule</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenders</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTenders}</div>
            <p className="text-xs text-muted-foreground">+{newTendersToday} today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            {failedConnectors === 0 ? (
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}% Success</div>
            <p className="text-xs text-muted-foreground">{failedConnectors} failed connectors</p>
          </CardContent>
        </Card>
      </div>

      {/* Connectors Status */}
      <Card>
        <CardHeader>
          <CardTitle>Connector Status</CardTitle>
          <CardDescription>Real-time status of all active data sources.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {states.map((state: any) => (
              <div key={state.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{state.source}</h4>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                      <Clock className="h-3 w-3" />
                      Last Run: {new Date(state.lastRun).toLocaleString()}
                    </div>
                  </div>
                </div>
                <Badge variant={state.lastRun === state.lastSuccess ? "default" : "destructive"} className="bg-emerald-500 hover:bg-emerald-600">
                  Online
                </Badge>
              </div>
            ))}
            {states.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin opacity-20" />
                No connectors have run yet. Waiting for background worker...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Logs</CardTitle>
          <CardDescription>Recent execution logs across all connectors.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{log.source}</td>
                    <td className="px-4 py-3">
                      {log.status === "SUCCESS" ? (
                        <span className="flex items-center text-emerald-500"><CheckCircle className="w-3 h-3 mr-1"/> Success</span>
                      ) : (
                        <span className="flex items-center text-destructive"><XCircle className="w-3 h-3 mr-1"/> Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-emerald-500 font-medium">+{log.tendersAdded}</td>
                    <td className="px-4 py-3 text-blue-500 font-medium">~{log.tendersUpdated}</td>
                    <td className="px-4 py-3 text-muted-foreground">{log.durationMs}ms</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(log.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No logs available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
