'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/app/dashboard/components/sidebar';
import { Header } from '@/app/dashboard/components/header';
import { createClientComponentClient } from '@/lib/supabase/client';

export default function DashboardContent({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  // Load sidebar collapsed state from localStorage
  useEffect(() => {
    const storedState = localStorage.getItem('sidebarCollapsed');
    if (storedState) {
      setSidebarCollapsed(storedState === 'true');
    }
  }, []);
  
  // Listen for changes to sidebar state
  useEffect(() => {
    const handleStorageChange = () => {
      const storedState = localStorage.getItem('sidebarCollapsed');
      if (storedState) {
        setSidebarCollapsed(storedState === 'true');
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Create a MutationObserver to detect direct changes to localStorage
    const storageObserver = setInterval(() => {
      const storedState = localStorage.getItem('sidebarCollapsed');
      if (storedState && (storedState === 'true') !== sidebarCollapsed) {
        setSidebarCollapsed(storedState === 'true');
      }
    }, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(storageObserver);
    };
  }, [sidebarCollapsed]);
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get session from localStorage directly first
        const storedSession = localStorage.getItem('supabase.auth.token');
        console.log('Found stored auth token:', storedSession ? 'Yes' : 'No');
        
        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error.message);
          router.push('/sign-in');
          return;
        }
        
        if (!data.session) {
          console.log('No session found in client, redirecting to sign-in');
          router.push('/sign-in');
          return;
        }
        
        console.log('Session found in client component:', data.session.user.email);
        
        // Fetch user profile
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        
        if (userError) {
          console.log('User profile not found, using session data');
          setUser({ 
            id: data.session.user.id,
            email: data.session.user.email,
            name: data.session.user.user_metadata?.name || data.session.user.email
          });
        } else {
          setUser(userData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        router.push('/sign-in');
      }
    };
    
    checkSession();
  }, [router, supabase]);
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Handle sidebar toggle directly in this component
  const handleSidebarToggle = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };
  
  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar user={user} onToggle={handleSidebarToggle} />
      
      {/* Main content */}
      <main 
        className="flex flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out w-full"
        style={{ 
          paddingLeft: sidebarCollapsed ? "64px" : "256px" 
        }}
      >
        <Header user={user} />
        <div className="flex-1 overflow-auto p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
} 