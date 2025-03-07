import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { AnalyticsData, ActivityPeriod, AnalyticsMetric } from '@/lib/analytics';
import { Loader2, TrendingUp, TrendingDown, Minus, Car, Eye, Mail, Share2, Search, FileText, BarChart3 } from 'lucide-react';

interface AnalyticsDashboardProps {
  analyticsData?: AnalyticsData;
  isLoading?: boolean;
  onPeriodChange?: (period: ActivityPeriod) => void;
  selectedPeriod?: ActivityPeriod;
}

export default function AnalyticsDashboard({
  analyticsData,
  isLoading = false,
  onPeriodChange,
  selectedPeriod = 'month'
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];
  
  // Format number with commas for thousands
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Format percentage
  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };
  
  // Render trend indicator
  const renderTrend = (metric: AnalyticsMetric) => {
    if (!metric.change) return null;
    
    const absChange = Math.abs(metric.change);
    const formattedChange = `${absChange.toFixed(1)}%`;
    
    switch (metric.changeDirection) {
      case 'up':
        return (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <TrendingUp className="mr-1 h-4 w-4" />
            <span>{formattedChange}</span>
          </div>
        );
      case 'down':
        return (
          <div className="flex items-center text-red-600 dark:text-red-400">
            <TrendingDown className="mr-1 h-4 w-4" />
            <span>{formattedChange}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <Minus className="mr-1 h-4 w-4" />
            <span>{formattedChange}</span>
          </div>
        );
    }
  };
  
  // Select period handler
  const handlePeriodChange = (value: string) => {
    if (onPeriodChange) {
      onPeriodChange(value as ActivityPeriod);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">Loading analytics data...</span>
      </div>
    );
  }
  
  if (!analyticsData) {
    return (
      <div className="flex h-[500px] w-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <BarChart3 className="mb-4 h-10 w-10 text-gray-400" />
        <h3 className="text-lg font-medium">No analytics data available</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          We couldn't find any analytics data for your dealership. Start adding vehicles and promoting them to see performance metrics.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time period:</span>
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 hours</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Car className="mr-3 h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.totalVehicles.value)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatNumber(analyticsData.activeListings.value)} active listings
                </div>
              </div>
              <div className="ml-auto">
                {renderTrend(analyticsData.activeListings)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Eye className="mr-3 h-5 w-5 text-indigo-500" />
              <div>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.totalViews.value)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Listing impressions</div>
              </div>
              <div className="ml-auto">
                {renderTrend(analyticsData.totalViews)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Mail className="mr-3 h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{formatPercent(analyticsData.leadConversion.value)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Inquiry rate</div>
              </div>
              <div className="ml-auto">
                {renderTrend(analyticsData.leadConversion)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Social Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Share2 className="mr-3 h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.socialEngagement.value)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Likes, shares, comments</div>
              </div>
              <div className="ml-auto">
                {renderTrend(analyticsData.socialEngagement)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Search Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Search className="mr-3 h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.searchImpressions.value)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Search result views</div>
              </div>
              <div className="ml-auto">
                {renderTrend(analyticsData.searchImpressions)}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Content Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-3 h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{formatNumber(analyticsData.contentGenerations)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">AI-generated content</div>
              </div>
              <div className="ml-auto">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {formatNumber(analyticsData.marketResearchQueries)} research queries
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Breakdown</TabsTrigger>
          <TabsTrigger value="listings">Top Listings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Views and inquiries over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.viewsByDay.map((dayData, i) => ({
                      date: dayData.date,
                      views: dayData.views,
                      inquiries: analyticsData.inquiriesByDay.find(d => d.date === dayData.date)?.inquiries || 0
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} name="Listing Views" />
                    <Line yAxisId="right" type="monotone" dataKey="inquiries" stroke="#82ca9d" name="Inquiries" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Types</CardTitle>
                <CardDescription>Breakdown by body style</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.vehicleTypeBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="label"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.vehicleTypeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Price Distribution</CardTitle>
                <CardDescription>Vehicles by price range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={analyticsData.priceRangeBreakdown}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Bar dataKey="value" name="Vehicles" fill="#8884d8">
                        {analyticsData.priceRangeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Trends</CardTitle>
              <CardDescription>How users are finding and interacting with your listings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.viewsByDay}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatNumber(value as number)} />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#8884d8" activeDot={{ r: 8 }} name="Daily Views" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Body Types</CardTitle>
                <CardDescription>Distribution of vehicle body styles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={analyticsData.vehicleTypeBreakdown}
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="label" />
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Bar dataKey="value" name="Vehicles" fill="#8884d8">
                        {analyticsData.vehicleTypeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Price Analysis</CardTitle>
                <CardDescription>Inventory by price points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.priceRangeBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="label"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {analyticsData.priceRangeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatNumber(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="listings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Listings</CardTitle>
              <CardDescription>Vehicles with the most views and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-2 font-medium">Vehicle</th>
                      <th className="text-left p-2 font-medium">Views</th>
                      <th className="text-left p-2 font-medium">Inquiries</th>
                      <th className="text-left p-2 font-medium">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.topPerformingListings.map((listing) => (
                      <tr key={listing.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{listing.title}</td>
                        <td className="p-2">{formatNumber(listing.views)}</td>
                        <td className="p-2">{formatNumber(listing.inquiries)}</td>
                        <td className="p-2">{formatPercent(listing.engagementRate)}</td>
                      </tr>
                    ))}
                    {analyticsData.topPerformingListings.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          No data available for top performing listings.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Feature Usage</CardTitle>
          <CardDescription>Content generation and market research activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Generation</span>
                <span className="text-sm font-medium">{analyticsData.contentGenerations} generations</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full rounded-full bg-blue-500" 
                  style={{ 
                    width: `${Math.min(100, (analyticsData.contentGenerations / (analyticsData.contentGenerations + analyticsData.marketResearchQueries)) * 100)}%` 
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Market Research</span>
                <span className="text-sm font-medium">{analyticsData.marketResearchQueries} queries</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full rounded-full bg-green-500" 
                  style={{ 
                    width: `${Math.min(100, (analyticsData.marketResearchQueries / (analyticsData.contentGenerations + analyticsData.marketResearchQueries)) * 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Your subscription includes unlimited content generation and market research.
        </CardFooter>
      </Card>
    </div>
  );
} 