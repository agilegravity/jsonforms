import {
  ControlElement,
  JsonSchema,
  Layout,
  mapStateToControlProps,
  mapStateToLayoutProps,
  UISchemaElement,
  LayoutProps as JsonFormsLayoutProps,
  StatePropsOfControl,
  Actions
} from '@jsonforms/core';
import Vue, { VueConstructor } from 'vue';
import { InjectJsonFormsDispatch, InjectJsonFormsState } from './types';

export interface RendererProps {
  schema: JsonSchema;
  uischema: UISchemaElement;
  path: string;
}

export interface RendererMixin extends RendererProps {}

export const rendererProps = Vue.extend({
  props: {
    schema: {
      required: true
    },
    uischema: {
      required: true
    },
    path: {
      required: true
    }
  }
});

export interface ControlProps extends RendererProps {
  uischema: ControlElement;
}

export interface ControlComputed {
  control: StatePropsOfControl;
}

export interface ControlMethods {
  handleChange(path: string, value: any): void;
}

export interface ControlMixin
  extends ControlProps,
    ControlComputed,
    ControlMethods {}

export const control = (Vue as VueConstructor<
  Vue & InjectJsonFormsState & InjectJsonFormsDispatch
>).extend<unknown, ControlMethods, unknown, ControlProps>({
  mixins: [rendererProps],
  inject: ['jsonforms', 'dispatch'],
  computed: {
    control() {
      return mapStateToControlProps(
        { jsonforms: this.jsonforms },
        {
          schema: this.schema,
          uischema: this.uischema,
          path: this.path
        }
      );
    }
  },
  methods: {
    handleChange(path, value) {
      this.dispatch(Actions.update(path, () => value));
    }
  }
});

export interface LayoutProps extends RendererProps {
  uischema: Layout;
}

export interface LayoutComputed {
  layout: JsonFormsLayoutProps;
}

export interface LayoutMixin extends LayoutProps, LayoutComputed {}

export const layout = (Vue as VueConstructor<
  Vue & InjectJsonFormsState
>).extend<unknown, unknown, LayoutComputed, LayoutProps>({
  mixins: [rendererProps],
  inject: ['jsonforms'],
  computed: {
    layout() {
      return mapStateToLayoutProps(
        { jsonforms: this.jsonforms },
        {
          schema: this.schema,
          uischema: this.uischema,
          path: this.path
        }
      );
    }
  }
});
