export class LayoutRegistry {
  private static layouts: Record<string, string> = {
    ListLayout: `
import React from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';

export const ListLayout = ({ data, renderItem }) => (
  <FlatList
    data={data}
    keyExtractor={(item) => item.id.toString()}
    renderItem={renderItem}
    contentContainerStyle={styles.container}
  />
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
  }
});
`
  };

  static get(layoutName: string): string {
    return this.layouts[layoutName] || this.layouts['ListLayout'];
  }
}
