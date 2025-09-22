import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import NavigationWebView from "../../components/NavigationWebView";

export default function CampusViewer() {
  return (
    <View style={styles.container}>
      <NavigationWebView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? '12%' : '8%',
    backgroundColor: '#0c0c1a',
  },
});
