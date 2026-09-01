# Vue 3 Component Testing with Vitest & Vue Test Utils

## Mounting Components

Use `mount` from `@vue/test-utils` to test Vue 3 SFC (Single File Components).

```javascript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '@/components/ui/button/Button.vue';

describe('Button component', () => {
    it('renders slot content', () => {
        const wrapper = mount(Button, {
            slots: {
                default: 'Bismillah',
            },
        });

        expect(wrapper.text()).toContain('Bismillah');
    });

    it('emits click event on click', async () => {
        const wrapper = mount(Button);

        await wrapper.trigger('click');

        expect(wrapper.emitted()).toHaveProperty('click');
        expect(wrapper.emitted('click')).toHaveLength(1);
    });

    it('applies variant classes via props', () => {
        const wrapper = mount(Button, {
            props: {
                variant: 'destructive',
            },
        });

        expect(wrapper.classes()).toContain('bg-destructive');
    });
});
```

## Best Practices
1. **Always `await` user actions**: `await wrapper.trigger('click')` or `await wrapper.setValue('query')` to ensure Vue DOM updates flush before assertions.
2. **Use data-testid or text selectors**: Avoid coupling assertions to fragile CSS class names unless testing styling variants.
