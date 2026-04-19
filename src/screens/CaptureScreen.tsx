import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Crypto from 'expo-crypto';
import { StatusBar } from 'expo-status-bar';

import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radius, spacing } from '../config/theme';
import { uploadReceiptToBackend } from '../services/receiptApi';
import { saveReceiptImage } from '../services/receiptImage';
import { useAuthStore } from '../store/useAuthStore';
import { useReceiptStore } from '../store/useReceiptStore';
import type { Receipt } from '../types';

export function CaptureScreen() {
  const navigation = useNavigation();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [pendingReceipt, setPendingReceipt] = useState<Receipt | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const addReceipt = useReceiptStore((s) => s.addReceipt);
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => signOut()} hitSlop={12}>
          <Text style={styles.headerBtn}>Sign out</Text>
        </Pressable>
      ),
    });
  }, [navigation, signOut]);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || !ready) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: Platform.OS === 'android',
      });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        const id = Crypto.randomUUID();
        const date = new Date().toISOString();
        const savedUri = await saveReceiptImage(photo.uri, id);
        const receipt: Receipt = { id, imageUri: savedUri, date };
        setPendingReceipt(receipt);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not capture photo';
      Alert.alert('Camera', msg);
    }
  }, [ready]);

  const resetCapture = () => {
    setCapturedUri(null);
    setPendingReceipt(null);
  };

  const saveLocally = async () => {
    if (!pendingReceipt) return;
    setSaving(true);
    try {
      addReceipt(pendingReceipt);
      Alert.alert('Saved', 'Receipt stored on this device.');
      resetCapture();
    } finally {
      setSaving(false);
    }
  };

  const saveAndUpload = async () => {
    if (!pendingReceipt) return;
    setUploading(true);
    try {
      addReceipt(pendingReceipt);
      const result = await uploadReceiptToBackend(pendingReceipt, null);
      if (result.ok) {
        Alert.alert('Uploaded', 'Receipt queued for your backend (check API URL).');
      } else {
        Alert.alert(
          'Upload',
          result.message ??
            'Saved locally. Upload failed — configure EXPO_PUBLIC_API_BASE_URL.'
        );
      }
      resetCapture();
    } finally {
      setUploading(false);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.centered}>
        <Text style={styles.webMsg}>
          Camera capture runs on iOS and Android. Use Expo Go on a device to try
          the full flow.
        </Text>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permText}>
          We need camera access to scan receipts.
        </Text>
        <PrimaryButton title="Allow camera" onPress={requestPermission} />
      </View>
    );
  }

  if (capturedUri && pendingReceipt) {
    return (
      <View style={styles.previewRoot}>
        <StatusBar style="light" />
        <Image source={{ uri: capturedUri }} style={styles.previewImg} />
        <View style={styles.previewBar}>
          <Text style={styles.previewMeta}>
            {new Date(pendingReceipt.date).toLocaleString()}
          </Text>
          <View style={styles.previewActions}>
            <PrimaryButton
              title="Retake"
              variant="outline"
              onPress={resetCapture}
              style={styles.flexBtn}
            />
            <PrimaryButton
              title="Save receipt"
              onPress={() => void saveLocally()}
              loading={saving}
              style={styles.flexBtn}
            />
          </View>
          <PrimaryButton
            title="Save & send to backend"
            onPress={() => void saveAndUpload()}
            loading={uploading}
          />
          {user ? (
            <Text style={styles.signedInAs} numberOfLines={1}>
              Signed in as {user.email}
            </Text>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        onCameraReady={() => setReady(true)}
      />
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame} />
      </View>
      <View style={styles.bottom}>
        <Text style={styles.hint}>Align the receipt within the frame</Text>
        <Pressable
          style={[styles.shutter, !ready && styles.shutterDisabled]}
          onPress={() => void takePicture()}
          disabled={!ready}
        >
          <View style={styles.shutterInner} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  camera: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: '86%',
    aspectRatio: 3 / 4,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.85)',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  hint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  shutterDisabled: { opacity: 0.5 },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  webMsg: { textAlign: 'center', fontSize: 16, color: colors.textSecondary },
  permText: {
    marginBottom: spacing.lg,
    textAlign: 'center',
    color: colors.text,
    fontSize: 16,
  },
  previewRoot: { flex: 1, backgroundColor: '#000' },
  previewImg: { flex: 1, resizeMode: 'contain' },
  previewBar: {
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  previewMeta: { color: colors.textSecondary, fontSize: 13 },
  previewActions: { flexDirection: 'row', gap: spacing.md },
  flexBtn: { flex: 1 },
  signedInAs: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  headerBtn: { color: colors.primary, fontWeight: '700', fontSize: 16 },
});
