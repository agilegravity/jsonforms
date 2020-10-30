# JSONForms - More Forms. Less Code
### Complex Forms in the blink of an eye

JSONForms eliminates the tedious task of writing fully-featured forms by hand by leveraging the capabilities of JSON, JSON Schema and Javascript.

# Vue Package
This is the JSONForms Vue package which provides the necessary bindings for Vue. It uses [JSONForms Core](https://www.npmjs.com/package/@jsonforms/core).

## Usage

Use the `json-forms` component for each form you want to render.

Mandatory props:
 * `data: any` - the data to show
 * `renderers: VueRendererEntry[]` - the Vue renderer set to use

Optional props:
 * `schema: JsonSchema` - the data schema for the given data. Will be generated when not given.
 * `uischema: UISchemaElement` - the ui schema for the given data schema. Will be generated when not given.
 * `cells: VueCellRendererEntry[]` - the Vue renderer set for table cells
 * `config: any` - form-wide options. May contain default ui schema options.
 * `readonly: boolean` - whether all controls shall be readonly.
 * `uischemas: JsonFormsUiSchemaEntry[]` - registry for dynamic ui schema dispatching
 * `validationMode: 'ValidateAndShow' | 'ValidateAndHide' | 'NoValidation'` - the validation mode for the form
 * `ajv: AJV` - custom Ajv instance for the form
 * `refParserOptions: RefParserOptions` - configuration for ref resolving

Events:
 * `change: {data: any; errors: AJVError[]}` - Whenever data and/or errors change this event is emitted.

Example:
```html
<json-forms
  v-bind:data="data"
  v-bind:renderers="renderers"
  v-bind:schema="schema"
  @change="onChange"
/>
```
```ts
export default Vue.extend<
  { renderers: VueRendererRegistryEntry[]; data: any; schema: JsonSchema },
  unknown,
  unknown,
  unknown
>({
  components: {
    JsonForms
  },
  data: function() {
    return {
      renderers: vueMaterializeRenderers,
      data: {
        number: 5
      },
      schema: {
        properties: {
          number: {
            type: 'number'
          }
        }
      }
    };
  },
  methods: {
    onChange(event: JsonFormsChangeEvent) {
      this.data = event.data;
    }
  }
});
```

## Renderer Set

The `@jsonforms/vue` package offers mixins for creating a Vue-based renderer set.
These mixins handle the default props given to the `dispatch-renderer` and use the JSON Forms core for determining the input for each renderer.

### control

Use the control mixin to make the default props for controls available in a `control` property.
These props are `data`, `description`, `errors`, `label`, `visible`, `enabled`, `id`, `path`, `required`, `uischema`, `schema`, `config`, `cells` and `rootSchema`.
Also adds the `handleChange(path, newValue)` method which can be used to dispatch changes to the JSON Forms data store.
For Typescript support we also export according types, e.g. `ControlMixin`.

Example implementation:
```html
<div>
  <input v-bind:value="control.data" @change="onChange" />
  <div class="error" v-if="control.errors">{{ control.errors }}</div>
</div>
```
```ts
import Vue, { VueConstructor } from 'vue';
import { control, ControlMixin } from '@jsonforms/vue';

interface ControlMethods {
  onChange: (event: Event) => void;
}

const controlRenderer: VueConstructor = (Vue as VueConstructor<
  Vue & ControlMixin
>).extend<unknown, ControlMethods, unknown, unknown>({
  mixins: [control],
  methods: {
    onChange(event: Event) {
      this.handleChange(
        this.control.path,
        (event.target as HTMLInputElement).value
      );
    }
  }
});
export default controlRenderer;
```

To declare the registry entry in the same file:
```ts
import { isControl, rankWith } from '@jsonforms/core';
import { VueRendererRegistryEntry } from '@jsonforms/vue';

export const entry: VueRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(1, isControl)
};
```

### layout

Similar to control we also offer a layout mixin.
The computed props are available in a `layout` property: `renderers`, `cells`, `visible`,`enabled`, `path`, `data`, `uischema`, `schema` and `direction`.
When writing a layout you'll also want to use the `dispatch-renderer` to render the layout's children.

Example implementation:

```html
<div>
  <div
    v-for="(element, index) in layout.uischema.elements"
    v-bind:key="`${layout.path}-${index}`"
  >
    <dispatch-renderer
      v-bind:schema="layout.schema"
      v-bind:uischema="element"
      v-bind:path="layout.path"
    />
  </div>
</div>
```
```ts
import { isLayout, rankWith } from '@jsonforms/core';
import Vue, { VueConstructor } from 'vue';
import { layout, DispatchRenderer, VueRendererRegistryEntry } from '@jsonforms/vue';

const layoutRenderer: VueConstructor = Vue.extend({
  components: {
    DispatchRenderer
  },
  mixins: [layout]
});

export default layoutRenderer;

export const entry: VueRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(1, isLayout)
};
```
# License
The JSONForms project is licensed under the MIT License. See the [LICENSE file](https://github.com/eclipsesource/jsonforms/blob/master/LICENSE) for more information.

# Roadmap
Our current roadmap is available [here](https://github.com/eclipsesource/jsonforms/blob/master/ROADMAP.md).

# Development
JSONForms is developed by [EclipseSource](https://eclipsesource.com).
We are always very happy to have contributions, whether for trivial cleanups or big new features.
