/**
 * scirender — React Native component
 *
 * Renders LaTeX, math, SMILES chemistry, tables, and all supported content
 * inside a self-sizing WebView. Works with Expo & bare React Native.
 *
 * Requires: react-native-webview as a peer dependency.
 *
 * Usage:
 *   import { SciContentNative } from 'scirender/native';
 *   <SciContentNative content="<smiles>CCO</smiles> is ethanol" />
 */

import React, { useState } from 'react';
import { getHtml, GetHtmlOptions } from '../getHtml';

// Types only — react-native-webview is a peer dep
type WebViewProps = any;

export interface SciContentNativeProps extends Omit<GetHtmlOptions, 'title'> {
  /** The content string containing LaTeX, SMILES, etc. */
  content: string;
  /** Minimum height of the WebView (default: 100) */
  minHeight?: number;
  /** Extra padding added to auto-measured height (default: 60) */
  extraPadding?: number;
  /** Style for the outer container */
  containerStyle?: any;
  /** Style for the WebView */
  webViewStyle?: any;
  /** Whether scrolling is enabled inside the WebView (default: false) */
  scrollEnabled?: boolean;
}

const SciContentNative: React.FC<SciContentNativeProps> = ({
  content,
  minHeight = 100,
  extraPadding = 60,
  containerStyle,
  webViewStyle,
  scrollEnabled = false,
  ...htmlOptions
}) => {
  const [webViewHeight, setWebViewHeight] = useState(200);

  if (!content || typeof content !== 'string') {
    return null;
  }

  // Dynamically require react-native and react-native-webview
  // This allows the package to be imported without crashing on web
  let View: any;
  let StyleSheet: any;
  let WebView: any;

  try {
    const RN = require('react-native');
    View = RN.View;
    StyleSheet = RN.StyleSheet;
    WebView = require('react-native-webview').WebView;
  } catch {
    // Not in a React Native environment
    return null;
  }

  const html = getHtml(content, htmlOptions);

  const styles = StyleSheet.create({
    container: {
      width: '100%',
      minHeight,
    },
    webView: {
      backgroundColor: 'transparent',
      minHeight,
    },
  });

  return React.createElement(
    View,
    { style: [styles.container, containerStyle] },
    React.createElement(WebView, {
      originWhitelist: ['*'],
      source: { html },
      style: [styles.webView, { height: webViewHeight }, webViewStyle],
      scrollEnabled,
      showsVerticalScrollIndicator: false,
      showsHorizontalScrollIndicator: false,
      nestedScrollEnabled: false,
      androidLayerType: 'hardware',
      onMessage: (event: any) => {
        try {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.height) {
            setWebViewHeight(Math.max(data.height + extraPadding, minHeight));
          }
        } catch {
          // Ignore parsing errors
        }
      },
    })
  );
};

export default SciContentNative;
