import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Greeting: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

export type MainTabParamList = {
  Capture: undefined;
  Receipts: undefined;
  Analysis: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
