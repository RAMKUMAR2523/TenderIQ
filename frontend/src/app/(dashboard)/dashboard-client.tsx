"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { FileText, Trophy, Activity, Target } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const monthlyData = [
  { name: 'Jan', submitted: 4, won: 1 },
  { name: 'Feb', submitted: 3, won: 2 },
  { name: 'Mar', submitted: 5, won: 1 },
  { name: 'Apr', submitted: 7, won: 3 },
  { name: 'May', submitted: 2, won: 0 },
  { name: 'Jun', submitted: 6, won: 4 },
];

const COLORS = ['#10b981', '#ef4444', '#f59e0b']; // Green for Won, Red for Lost, Amber for Pending

interface DashboardClientProps {
  stats: {
    totalActiveTenders: number;
    proposalsInProgress: number;
    submittedBids: number;
    wonBids: number;
    lostBids: number;
    winRate: number;
  };
  recentTenders: any[];
  user: any;
}

export default function DashboardClient({ stats, recentTenders, user }: DashboardClientProps) {
  const pieData = [
    { name: 'Won', value: stats.wonBids || 1 }, // Default to 1 for visual if 0
    { name: 'Lost', value: stats.lostBids || 1 },
    { name: 'In Progress', value: stats.proposalsInProgress || 1 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ""}. Here is your AI bid intelligence overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Active Tenders
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActiveTenders}</div>
            <p className="text-xs text-muted-foreground">
              Across all portals
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Proposals in Progress
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proposalsInProgress}</div>
            <p className="text-xs text-muted-foreground">
              Actively being drafted
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.winRate}%</div>
            <p className="text-xs text-muted-foreground">
              Based on submitted bids
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Submitted Bids
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submittedBids}</div>
            <p className="text-xs text-muted-foreground">
              Total bids submitted
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Submission & Win Trends</CardTitle>
            <CardDescription>
              Your bid performance over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888888" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.1)'}} 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                  <Bar dataKey="submitted" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Submitted" />
                  <Bar dataKey="won" fill="#10b981" radius={[4, 4, 0, 0]} name="Won" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Bid Outcomes</CardTitle>
            <CardDescription>
              Distribution of all your tracked bids.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recently Published Tenders</CardTitle>
            <CardDescription>
              New tenders matching your company profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentTenders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No active tenders found.
                </div>
              ) : (
                recentTenders.map((tender, i) => (
                  <div key={tender.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 last:border-0 last:pb-0">
                    <div className="space-y-1 flex-1">
                      <p className="font-medium leading-none text-lg">
                        {tender.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {tender.description || tender.executiveSummary}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-foreground">Dept:</span> {tender.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-foreground">Value:</span> ₹{(tender.tenderValue / 100000).toFixed(2)} Lakhs
                        </span>
                        {tender.closingDate && (
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-foreground">Closes:</span> {new Date(tender.closingDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium whitespace-nowrap">
                        95% Match
                      </div>
                      <Link href={`/tenders/${tender.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                        View Details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
