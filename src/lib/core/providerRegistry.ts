/**
 * Provider registry — manages the active IContentProvider singleton.
 *
 * Currently supports only one provider (AnimeLatinoProvider).
 * To add a new provider in the future:
 * 1. Create a class implementing IContentProvider
 * 2. Update createProvider to instantiate the new provider
 */
import { IContentProvider } from "../domain/interfaces";
import "../infrastructure/providers/AnimeLatinoProvider";
import { sessionManager } from "./infrastructure";
import { createProvider } from "./providerFactory";

let currentProvider: IContentProvider | null = null;

export const getProvider = (): IContentProvider => {
  if (!currentProvider) {
    currentProvider = createProvider("safe", sessionManager);
  }
  return currentProvider;
};

export const initProvider = () => {
  currentProvider = createProvider("safe", sessionManager);
};
