import { StyleSheet } from 'react-native';

export const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
  spinner: {
    marginTop: 40,
  },
  message: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});
