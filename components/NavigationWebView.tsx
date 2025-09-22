import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

export default function NavigationWebView() {
  const [serverUrl, setServerUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string>('');

  const startLocalServer = useCallback(async () => {
    try {
      setIsLoading(true);
      setServerError('');
      
      // Try multiple URLs - localhost first, then IP address
      const urls = [
        'http://localhost:3000',
        'http://192.168.254.113:3000',
        'http://10.0.2.2:3000' // Android emulator default
      ];
      
      let workingUrl = null;
      
      for (const url of urls) {
        try {
          console.log('Testing server connection to:', url);
          const response = await fetch(`${url}/health`, { timeout: 5000 });
          console.log('Health check response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Health check data:', data);
            console.log('Found working URL:', url);
            workingUrl = url;
            break;
          }
        } catch (urlError) {
          console.log(`URL ${url} failed:`, urlError.message);
          continue;
        }
      }
      
      if (workingUrl) {
        console.log('Setting server URL:', workingUrl);
        setServerUrl(workingUrl);
        setIsLoading(false);
      } else {
        throw new Error('No working server URL found. Make sure to run: npm run serve-local');
      }
      
    } catch (error) {
      console.error('Error connecting to local server:', error);
      setServerError(`Failed to connect to local server: ${error.message}. Make sure to run: npm run serve-local`);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    startLocalServer();
  }, [startLocalServer]);

  const retryConnection = () => {
    startLocalServer();
  };

  if (isLoading) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0c0c1a" />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c0c1a' }}>
          <ActivityIndicator size="large" color="#4169E1" />
          <Text style={{ color: '#fff', marginTop: 20, fontSize: 16 }}>
            Connecting to navigation server...
          </Text>
        </SafeAreaView>
      </>
    );
  }

  if (serverError) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0c0c1a" />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0c0c1a', padding: 20 }}>
          <Text style={{ color: '#ff6b6b', fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
            Server Connection Error
          </Text>
          <Text style={{ color: '#a0a0d0', fontSize: 14, marginBottom: 30, textAlign: 'center' }}>
            {serverError}
          </Text>
          <TouchableOpacity
            onPress={retryConnection}
            style={{
              backgroundColor: '#4169E1',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Retry Connection
            </Text>
          </TouchableOpacity>
        </SafeAreaView>
      </>
    );
  }

  console.log('Rendering WebView with URL:', serverUrl);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0c0c1a" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0c0c1a' }}>
        <WebView
          source={{ uri: serverUrl }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error: ', nativeEvent);
            console.error('WebView error code: ', nativeEvent.code);
            console.error('WebView error description: ', nativeEvent.description);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView HTTP error: ', nativeEvent);
            console.error('WebView HTTP error status: ', nativeEvent.statusCode);
          }}
          onLoadEnd={() => {
            console.log('Navigation loaded successfully from localhost');
          }}
          onLoadStart={() => {
            console.log('Loading navigation from localhost...', serverUrl);
          }}
          onMessage={(event) => {
            console.log('WebView message:', event.nativeEvent.data);
          }}
          onNavigationStateChange={(navState) => {
            console.log('Navigation state change:', {
              url: navState.url,
              loading: navState.loading,
              canGoBack: navState.canGoBack,
              canGoForward: navState.canGoForward,
              title: navState.title
            });
          }}
          style={{ backgroundColor: '#0c0c1a' }}
        />
      </SafeAreaView>
    </>
  );
}
