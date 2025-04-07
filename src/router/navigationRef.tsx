import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();


export function navigate(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

export function reset(routes: any[], index = 0) {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index, routes });
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack()
  }
}

export function goHome() {
  if(navigationRef.isReady()) {
    reset([{name: "logged-home-screen"}], 0)
  }
}