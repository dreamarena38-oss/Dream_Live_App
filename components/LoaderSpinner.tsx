import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface LoaderProps {
  connectionStatus?: "checking" | "connected" | "disconnected";
  msgText?: string;
}

const LoaderSpinner = ({ connectionStatus, msgText='Loading...' }: LoaderProps) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#3c3a3a" style={styles.spinner} />
      <Text style={styles.loadingText}>{msgText}</Text>
      {connectionStatus === "checking" && (
        <Text style={styles.connectionText}>Checking server connection...</Text>
      )}
    </View>
  );
};

export default LoaderSpinner;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  connectionText: {
    fontSize: 14,
    color: "#8B5CF6",
  },
});
