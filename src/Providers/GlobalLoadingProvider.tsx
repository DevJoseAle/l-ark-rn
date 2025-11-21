import { Modal } from 'react-native';
import { useLoadingStore } from '../stores/LoadingStore';
import { LoadingScreen } from '../components/common/LoadingScreen';

export function GlobalLoadingProvider() {
  const { isLoading, loadingMessage } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <Modal visible={isLoading} transparent={false} animationType="fade" statusBarTranslucent>
      <LoadingScreen message={loadingMessage} />
    </Modal>
  );
}
