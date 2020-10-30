import {
  CoreActions,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsCore,
  JsonFormsRendererRegistryEntry,
  JsonFormsState,
  JsonFormsSubStates
} from '@jsonforms/core';
import { VueConstructor } from 'vue/types/umd';

export interface VueRendererRegistryEntry
  extends JsonFormsRendererRegistryEntry {
  renderer: VueConstructor<Vue>;
}

export interface VueCellRegistryEntry
  extends JsonFormsCellRendererRegistryEntry {
  renderer: VueConstructor<Vue>;
}

export interface InjectJsonFormsState {
  jsonforms: JsonFormsVueSubStates;
}

export interface InjectJsonFormsDispatch {
  dispatch: (action: CoreActions) => void
}

export interface JsonFormsVueState extends JsonFormsState {
  jsonforms: JsonFormsVueSubStates;
}

export interface JsonFormsVueSubStates extends JsonFormsSubStates {
  core: JsonFormsCore;
  config: any;
  renderers: VueRendererRegistryEntry[];
  cells?: VueCellRegistryEntry[];
}

export type JsonFormsChangeEvent = Pick<JsonFormsCore, 'data' | 'errors'>
