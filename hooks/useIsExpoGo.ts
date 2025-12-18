import Constants from 'expo-constants';

const useIsExpoGo = (): boolean => {
  return Constants.executionEnvironment === "storeClient";
};

export default useIsExpoGo;
