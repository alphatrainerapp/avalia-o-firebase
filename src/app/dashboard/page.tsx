import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Dumbbell, Users } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { evaluations, clients } from '@/lib/data';

const chartData = evaluations
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map(e => ({
    date: new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    client: e.clientName,
    "Body Fat %": e.bodyComposition.bodyFatPercentage,
    "Muscle Mass (kg)": e.bodyComposition.muscleMass,
  })).slice(-10); // show last 10 evaluations


const chartConfig = {
  "Body Fat %": {
    label: "Body Fat %",
    color: "hsl(var(--accent))",
  },
  "Muscle Mass (kg)": {
    label: "Muscle Mass (kg)",
    color: "hsl(var(--primary))",
  },
} satisfies import('@/components/ui/chart').ChartConfig;


export default function DashboardPage() {
    const avgBodyFat = (evaluations.reduce((acc, e) => acc + e.bodyComposition.bodyFatPercentage, 0) / evaluations.length).toFixed(1);

    return (
        <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clients.length}</div>
                        <p className="text-xs text-muted-foreground">Currently managing</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Evaluations</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{evaluations.length}</div>
                        <p className="text-xs text-muted-foreground">Logged in the system</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Body Fat %</CardTitle>
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {avgBodyFat}%
                        </div>
                        <p className="text-xs text-muted-foreground">Across all clients</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Evaluation Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[350px] w-full">
                        <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                            />
                            <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" tickFormatter={(value) => `${value}kg`} />
                            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" tickFormatter={(value) => `${value}%`} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend />
                            <Bar dataKey="Muscle Mass (kg)" fill="var(--color-Muscle Mass (kg))" radius={4} yAxisId="left" />
                            <Bar dataKey="Body Fat %" fill="var(--color-Body Fat %)" radius={4} yAxisId="right" />
                        </RechartsBarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    );
}
