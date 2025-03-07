'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Check, RefreshCw, Copy, Star, Award, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleInfo, GenerationOptions, GeneratedContent } from '@/lib/openai';
import { toast } from 'sonner';

interface ContentGeneratorProps {
  vehicleData: VehicleInfo;
  onSave?: (content: GeneratedContent) => void;
  onClose?: () => void;
}

export default function ContentGenerator({ vehicleData, onSave, onClose }: ContentGeneratorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({
    style: 'professional',
    length: 'medium',
    highlightCount: 5,
    includeCallToAction: true,
  });
  const [editingContent, setEditingContent] = useState<Partial<GeneratedContent>>({});
  const [activeTab, setActiveTab] = useState('description');

  const generateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleInfo: vehicleData,
          options: generationOptions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
      }

      const generatedContent = await response.json();
      setContent(generatedContent);
      
      // Initialize editing content with the generated content
      setEditingContent(generatedContent);
      
      toast.success('Content generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = useCallback(() => {
    if (!content || !editingContent) return;
    
    // Merge the original content with any edited fields
    const finalContent: GeneratedContent = {
      ...content,
      ...editingContent,
    };
    
    if (onSave) {
      onSave(finalContent);
    }
    
    toast.success('Content saved successfully');
    
    // Refresh the page to show updated content
    router.refresh();
    
    if (onClose) {
      onClose();
    }
  }, [content, editingContent, onSave, onClose, router]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleOptionChange = (option: keyof GenerationOptions, value: any) => {
    setGenerationOptions(prev => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleContentChange = (field: keyof GeneratedContent, value: any) => {
    setEditingContent(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {!content ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Vehicle Content</CardTitle>
              <CardDescription>
                Use AI to create engaging descriptions, highlight key features, and optimize for SEO.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="style">Writing Style</Label>
                    <select
                      id="style"
                      className="w-full rounded-md border border-gray-300 p-2"
                      value={generationOptions.style}
                      onChange={(e) => handleOptionChange('style', e.target.value)}
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="luxury">Luxury</option>
                      <option value="sporty">Sporty</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="length">Content Length</Label>
                    <select
                      id="length"
                      className="w-full rounded-md border border-gray-300 p-2"
                      value={generationOptions.length}
                      onChange={(e) => handleOptionChange('length', e.target.value)}
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="highlightCount">Number of Highlights</Label>
                    <Input
                      id="highlightCount"
                      type="number"
                      min={1}
                      max={10}
                      value={generationOptions.highlightCount}
                      onChange={(e) => handleOptionChange('highlightCount', parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="targetAudience">Target Audience (Optional)</Label>
                    <Input
                      id="targetAudience"
                      placeholder="e.g., young professionals, families, luxury buyers"
                      value={generationOptions.targetAudience || ''}
                      onChange={(e) => handleOptionChange('targetAudience', e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCallToAction"
                      checked={generationOptions.includeCallToAction}
                      onCheckedChange={(checked: boolean | 'indeterminate') => 
                        handleOptionChange('includeCallToAction', checked === true)
                      }
                    />
                    <Label htmlFor="includeCallToAction">Include call to action</Label>
                  </div>
                  
                  <div>
                    <Label htmlFor="emphasizeFeatures">Emphasized Features (Optional)</Label>
                    <Textarea
                      id="emphasizeFeatures"
                      placeholder="Enter specific features to emphasize, separated by commas"
                      value={generationOptions.emphasizeFeatures?.join(', ') || ''}
                      onChange={(e) => {
                        const features = e.target.value.split(',').map(f => f.trim()).filter(Boolean);
                        handleOptionChange('emphasizeFeatures', features.length > 0 ? features : undefined);
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={generateContent} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Content'
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium mb-2">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">Make</p>
                <p className="text-sm text-gray-500">{vehicleData.make}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Model</p>
                <p className="text-sm text-gray-500">{vehicleData.model}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Year</p>
                <p className="text-sm text-gray-500">{vehicleData.year}</p>
              </div>
              {vehicleData.trim && (
                <div>
                  <p className="text-sm font-medium">Trim</p>
                  <p className="text-sm text-gray-500">{vehicleData.trim}</p>
                </div>
              )}
              {vehicleData.price && (
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-sm text-gray-500">${vehicleData.price.toLocaleString()}</p>
                </div>
              )}
              {vehicleData.mileage && (
                <div>
                  <p className="text-sm font-medium">Mileage</p>
                  <p className="text-sm text-gray-500">{vehicleData.mileage.toLocaleString()} miles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Generated Content</h2>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateContent}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSave}
              >
                <Check className="mr-2 h-4 w-4" />
                Save Content
              </Button>
            </div>
          </div>
          
          <Tabs
            defaultValue="description"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="highlights">Highlights</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="all">All Content</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Vehicle Description</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(editingContent.description || content.description, 'Description')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editingContent.description || content.description}
                    onChange={(e) => handleContentChange('description', e.target.value)}
                    className="min-h-[200px]"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="highlights" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Key Highlights</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard((editingContent.highlights || content.highlights).join('\n'), 'Highlights')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(editingContent.highlights || content.highlights).map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={highlight}
                          onChange={(e) => {
                            const newHighlights = [...(editingContent.highlights || content.highlights)];
                            newHighlights[index] = e.target.value;
                            handleContentChange('highlights', newHighlights);
                          }}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="seo" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="seoTitle">SEO Title</Label>
                      <div className="flex gap-2">
                        <Input
                          id="seoTitle"
                          value={editingContent.seoTitle || content.seoTitle}
                          onChange={(e) => handleContentChange('seoTitle', e.target.value)}
                          maxLength={60}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(editingContent.seoTitle || content.seoTitle, 'SEO Title')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingContent.seoTitle || content.seoTitle).length}/60 characters
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="seoDescription">Meta Description</Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="seoDescription"
                          value={editingContent.seoDescription || content.seoDescription}
                          onChange={(e) => handleContentChange('seoDescription', e.target.value)}
                          maxLength={155}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(editingContent.seoDescription || content.seoDescription, 'Meta Description')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {(editingContent.seoDescription || content.seoDescription).length}/155 characters
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="social" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>Social Media Post</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(editingContent.socialMediaPost || content.socialMediaPost, 'Social Media Post')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={editingContent.socialMediaPost || content.socialMediaPost}
                    onChange={(e) => handleContentChange('socialMediaPost', e.target.value)}
                    maxLength={280}
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(editingContent.socialMediaPost || content.socialMediaPost).length}/280 characters
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="all" className="mt-4 space-y-6">
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Description
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(editingContent.description || content.description, 'Description')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm whitespace-pre-line">{editingContent.description || content.description}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center">
                      <Star className="mr-2 h-4 w-4" />
                      Key Highlights
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard((editingContent.highlights || content.highlights).join('\n'), 'Highlights')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {(editingContent.highlights || content.highlights).map((highlight, index) => (
                      <li key={index} className="text-sm">• {highlight}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium flex items-center">
                      <Award className="mr-2 h-4 w-4" />
                      SEO Optimization
                    </h3>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-xs font-medium">Title:</span>
                      <p className="text-sm">{editingContent.seoTitle || content.seoTitle}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Description:</span>
                      <p className="text-sm">{editingContent.seoDescription || content.seoDescription}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Social Media Post</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(editingContent.socialMediaPost || content.socialMediaPost, 'Social Media Post')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-2 text-sm">{editingContent.socialMediaPost || content.socialMediaPost}</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 