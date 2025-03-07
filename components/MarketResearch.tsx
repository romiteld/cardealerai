"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter } from 'recharts';
import { PlusCircle, Loader2, DollarSign, BarChart as BarChartIcon, LineChart as LineChartIcon, Search, RefreshCw } from 'lucide-react';
import { VehicleListing, PriceAnalysis, VehicleSearchParams } from '@/lib/firecrawl';

interface MarketResearchProps {
  initialMake?: string;
  initialModel?: string;
  initialYear?: number;
  initialTrim?: string;
  onSave?: (recommendation: number) => void;
}

export default function MarketResearch({
  initialMake = '',
  initialModel = '',
  initialYear,
  initialTrim = '',
  onSave
}: MarketResearchProps) {
  // State for search form
  const [searchParams, setSearchParams] = useState<VehicleSearchParams>({
    make: initialMake,
    model: initialModel,
    year: initialYear,
    trim: initialTrim,
    radius: 50,
    zipCode: '',
    maxResults: 20,
  });

  // State for results
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<PriceAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for trending vehicles
  const [trendingCategory, setTrendingCategory] = useState<string>('all');
  const [trendingVehicles, setTrendingVehicles] = useState<any[]>([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState<boolean>(false);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value ? parseInt(value, 10) : undefined,
    });
  };

  // Handle search submission
  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/market-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch market data');
      }
      
      setAnalysisResults(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during the search');
      console.error('Market research error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get trending vehicles
  const fetchTrendingVehicles = async (category: string = 'all') => {
    setIsTrendingLoading(true);
    try {
      const response = await fetch(`/api/market-research${category !== 'all' ? `?category=${category}` : ''}`);
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch trending vehicles');
      }
      
      setTrendingVehicles(result.data);
    } catch (err) {
      console.error('Error fetching trending vehicles:', err);
    } finally {
      setIsTrendingLoading(false);
    }
  };

  // Save the recommended price
  const handleSaveRecommendation = () => {
    if (analysisResults && onSave) {
      onSave(analysisResults.competitivePriceRecommendation);
    }
  };

  // React to trending category changes
  React.useEffect(() => {
    fetchTrendingVehicles(trendingCategory !== 'all' ? trendingCategory : undefined);
  }, [trendingCategory]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Market Research & Price Analysis</CardTitle>
        <CardDescription>
          Research similar vehicles and get competitive pricing recommendations
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="search">
          <TabsList className="mb-4">
            <TabsTrigger value="search">Price Analysis</TabsTrigger>
            <TabsTrigger value="trending">Trending Vehicles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    name="make"
                    value={searchParams.make}
                    onChange={handleInputChange}
                    placeholder="e.g. Toyota"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    value={searchParams.model}
                    onChange={handleInputChange}
                    placeholder="e.g. Camry"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    value={searchParams.year || ''}
                    onChange={handleNumberChange}
                    placeholder="e.g. 2022"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trim">Trim</Label>
                  <Input
                    id="trim"
                    name="trim"
                    value={searchParams.trim}
                    onChange={handleInputChange}
                    placeholder="e.g. SE"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={searchParams.zipCode}
                    onChange={handleInputChange}
                    placeholder="e.g. 90210"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="radius">Search Radius (miles)</Label>
                  <Input
                    id="radius"
                    name="radius"
                    type="number"
                    value={searchParams.radius}
                    onChange={handleNumberChange}
                    placeholder="50"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSearch} 
                className="w-full"
                disabled={isLoading || !searchParams.make || !searchParams.model}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Market...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze Market Prices
                  </>
                )}
              </Button>
              
              {error && (
                <div className="p-4 my-4 bg-red-100 text-red-800 rounded-md">
                  {error}
                </div>
              )}
              
              {analysisResults && (
                <div className="mt-6 space-y-6">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Price Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-card p-3 rounded-md">
                        <div className="text-sm text-muted-foreground">Average Price</div>
                        <div className="text-xl font-bold">${analysisResults.averagePrice.toLocaleString()}</div>
                      </div>
                      <div className="bg-card p-3 rounded-md">
                        <div className="text-sm text-muted-foreground">Median Price</div>
                        <div className="text-xl font-bold">${analysisResults.medianPrice.toLocaleString()}</div>
                      </div>
                      <div className="bg-card p-3 rounded-md">
                        <div className="text-sm text-muted-foreground">Minimum Price</div>
                        <div className="text-xl font-bold">${analysisResults.minPrice.toLocaleString()}</div>
                      </div>
                      <div className="bg-card p-3 rounded-md">
                        <div className="text-sm text-muted-foreground">Maximum Price</div>
                        <div className="text-xl font-bold">${analysisResults.maxPrice.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-semibold mb-2 text-green-800 dark:text-green-400">Recommended Price</h3>
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600 dark:text-green-500 mr-2" />
                      <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                        ${analysisResults.competitivePriceRecommendation.toLocaleString()}
                      </div>
                    </div>
                    {onSave && (
                      <Button 
                        variant="outline" 
                        className="mt-2" 
                        onClick={handleSaveRecommendation}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Use This Price
                      </Button>
                    )}
                    <p className="text-sm mt-2 text-green-700 dark:text-green-400">
                      This price is competitive in your market and likely to attract buyers while maximizing your profit.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Price Distribution</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={analysisResults.priceDistribution}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" name="Number of Listings" fill="#8884d8">
                            {analysisResults.priceDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Price vs. Mileage</h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart
                          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            type="number" 
                            dataKey="mileage" 
                            name="Mileage" 
                            unit=" mi"
                            domain={['dataMin', 'dataMax']} 
                          />
                          <YAxis 
                            type="number" 
                            dataKey="price" 
                            name="Price" 
                            unit="$"
                            domain={['dataMin', 'dataMax']} 
                          />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value: any) => `$${value.toLocaleString()}`} />
                          <Scatter 
                            name="Vehicle Listings" 
                            data={analysisResults.priceVsMileageData} 
                            fill="#8884d8"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Similar Listings</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Vehicle</th>
                            <th className="text-left p-2">Price</th>
                            <th className="text-left p-2">Mileage</th>
                            <th className="text-left p-2">Location</th>
                            <th className="text-left p-2">Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResults.similarListings.map((listing) => (
                            <tr key={listing.id} className="border-b">
                              <td className="p-2">
                                <div className="font-medium">{listing.title}</div>
                                <div className="text-xs text-muted-foreground">{listing.dealerName}</div>
                              </td>
                              <td className="p-2 font-medium">${listing.price.toLocaleString()}</td>
                              <td className="p-2">{listing.mileage?.toLocaleString()} mi</td>
                              <td className="p-2">{listing.location}</td>
                              <td className="p-2">
                                <a
                                  href={listing.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {listing.source}
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button 
                  variant={trendingCategory === 'all' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTrendingCategory('all')}
                >
                  All
                </Button>
                <Button 
                  variant={trendingCategory === 'suv' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTrendingCategory('suv')}
                >
                  SUVs
                </Button>
                <Button 
                  variant={trendingCategory === 'sedan' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTrendingCategory('sedan')}
                >
                  Sedans
                </Button>
                <Button 
                  variant={trendingCategory === 'truck' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTrendingCategory('truck')}
                >
                  Trucks
                </Button>
                <Button 
                  variant={trendingCategory === 'luxury' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTrendingCategory('luxury')}
                >
                  Luxury
                </Button>
                <Button 
                  variant={trendingCategory === 'electric' ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setTrendingCategory('electric')}
                >
                  Electric
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchTrendingVehicles(trendingCategory !== 'all' ? trendingCategory : undefined)}
                  disabled={isTrendingLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isTrendingLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              
              {isTrendingLoading ? (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Popularity Ranking</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={trendingVehicles}
                            margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[60, 100]} />
                            <YAxis 
                              dataKey="model" 
                              type="category" 
                              tickFormatter={(value, index) => 
                                `${trendingVehicles[index]?.make} ${value}`
                              } 
                            />
                            <Tooltip 
                              formatter={(value: number) => [`${value} / 100`, 'Popularity']}
                              labelFormatter={(label: string, payload: any) => {
                                if (payload && payload.length) {
                                  const data = payload[0].payload;
                                  return `${data.make} ${data.model}`;
                                }
                                return label;
                              }}
                            />
                            <Legend />
                            <Bar dataKey="popularity" name="Popularity Score" fill="#00C49F">
                              {trendingVehicles.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Average Prices</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={trendingVehicles}
                            margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="model" 
                              tickFormatter={(value, index) => value}
                              angle={-45}
                              textAnchor="end"
                              height={70}
                            />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Average Price']}
                              labelFormatter={(label: string, payload: any) => {
                                if (payload && payload.length) {
                                  const data = payload[0].payload;
                                  return `${data.make} ${data.model}`;
                                }
                                return label;
                              }}
                            />
                            <Legend />
                            <Bar dataKey="averagePrice" name="Average Price" fill="#8884D8">
                              {trendingVehicles.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Trending Vehicles List</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-2">Rank</th>
                            <th className="text-left p-2">Vehicle</th>
                            <th className="text-left p-2">Average Price</th>
                            <th className="text-left p-2">Popularity Score</th>
                            <th className="text-left p-2">Research</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trendingVehicles.map((vehicle, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{index + 1}</td>
                              <td className="p-2">
                                <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                              </td>
                              <td className="p-2">${vehicle.averagePrice.toLocaleString()}</td>
                              <td className="p-2">{vehicle.popularity}/100</td>
                              <td className="p-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSearchParams({
                                      ...searchParams,
                                      make: vehicle.make,
                                      model: vehicle.model,
                                    });
                                    // Switch to search tab
                                    const searchTab = document.querySelector('[data-state="inactive"][data-value="search"]');
                                    if (searchTab && searchTab instanceof HTMLElement) {
                                      searchTab.click();
                                    }
                                  }}
                                >
                                  <Search className="h-4 w-4 mr-1" />
                                  Analyze
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Data provided by Fire Crawl market analysis
        </p>
      </CardFooter>
    </Card>
  );
} 