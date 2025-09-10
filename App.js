import React, { useState, useMemo } from 'react';
import { SafeAreaView, View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';

// Fixed digit → letter mapping
const MAPPING = {
  '1': 'B',
  '2': 'I',
  '3': 'N',
  '4': 'A',
  '5': 'S',
  '6': 'T',
  '7': 'O',
  '8': 'R',
  '9': 'E',
  '0': 'E'
};

function convertDigitsToWord(digits) {
  if (!digits || digits.trim() === '') return '';
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    const ch = digits[i];
    if (MAPPING.hasOwnProperty(ch)) out += MAPPING[ch];
  }
  return out;
}

export default function App() {
  const [input, setInput] = useState('1234567890');
  const [copiedMsg, setCopiedMsg] = useState('');

  const lines = useMemo(() => {
    return input.replace(/\r/g, '').split('\n');
  }, [input]);

  const results = useMemo(() => {
    return lines.map(line => ({
      source: line,
      word: convertDigitsToWord(line)
    }));
  }, [lines]);

  const copyToClipboard = async (text) => {
    await Clipboard.setStringAsync(text);
    setCopiedMsg('Copied to clipboard');
    setTimeout(() => setCopiedMsg(''), 1500);
  };

  const copyAll = async () => {
    const all = results.map(r => r.word).join('\n');
    await copyToClipboard(all);
  };

  const shareAll = async () => {
    try {
      const csv = results
        .map(r => `"\${r.source.replace(/"/g,'""')}","\${r.word.replace(/"/g,'""')}"`)
        .join('\n');
      await Share.share({ message: csv });
    } catch (e) {
      Alert.alert('Error', 'Unable to share');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Number → Letter Converter</Text>
        <Text style={styles.subtitle}>Mapping: 1=B, 2=I, 3=N, 4=A, 5=S, 6=T, 7=O, 8=R, 9=E, 0=E</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.label}>Enter numbers (one per line allowed):</Text>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={"1234567890\n9870"}
          multiline
          textAlignVertical="top"
          autoCapitalize="none"
          keyboardType="numeric"
        />

        <View style={styles.rowButtons}>
          <TouchableOpacity style={styles.btn} onPress={() => { setInput(''); }}>
            <Text style={styles.btnText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={() => { setInput('1234567890'); }}>
            <Text style={styles.btnText}>Example</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={copyAll}>
            <Text style={styles.btnPrimaryText}>Copy All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary} onPress={shareAll}>
            <Text style={styles.btnPrimaryText}>Share</Text>
          </TouchableOpacity>
        </View>

        {copiedMsg ? <Text style={styles.copied}>{copiedMsg}</Text> : null}
      </View>

      <View style={styles.resultsSection}>
        <Text style={styles.label}>Results</Text>
        <ScrollView style={styles.resultsList}>
          {results.map((r, idx) => (
            <View key={idx} style={styles.resultRow}>
              <View style={{flex:1}}>
                <Text style={styles.sourceText}>{r.source || '(empty)'}</Text>
                <Text style={styles.wordText}>{r.word || '(no digits)'}</Text>
              </View>
              <View style={styles.resultButtons}>
                <TouchableOpacity style={styles.smallBtn} onPress={() => copyToClipboard(r.word)}>
                  <Text style={styles.smallBtnText}>Copy</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Expo App – Share exports CSV of results</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  inputSection: { padding: 16 },
  label: { fontSize: 14, marginBottom: 8 },
  input: { height: 120, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 16 },
  rowButtons: { flexDirection: 'row', marginTop: 12, flexWrap: 'wrap' },
  btn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#f0f0f0', marginRight: 8, marginBottom: 8 },
  btnText: { color: '#333' },
  btnPrimary: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#0066cc', marginRight: 8, marginBottom: 8 },
  btnPrimaryText: { color: '#fff' },
  copied: { marginTop: 8, color: 'green' },
  resultsSection: { flex: 1, paddingHorizontal: 16 },
  resultsList: { marginTop: 8 },
  resultRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#f2f2f2', alignItems: 'center' },
  sourceText: { fontSize: 14, color: '#444' },
  wordText: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  resultButtons: { marginLeft: 12 },
  smallBtn: { backgroundColor: '#eee', padding: 6, borderRadius: 6 },
  smallBtnText: { color: '#333' },
  footer: { padding: 12, borderTopWidth: 1, borderColor: '#eee' },
  footerText: { color: '#666', fontSize: 12 }
});