# Mocking Inertia.js in Vue 3 Component Tests

When testing Vue pages or components that use `@inertiajs/vue3` (`<Link>`, `useForm`, `usePage`, `router`), stub or mock them to prevent network or routing errors in unit tests.

## 1. Stubbing `<Link>` and `<Head>`
Pass stubs in `global.stubs`:
```javascript
import { mount } from '@vue/test-utils';
import SurahListItem from '@/components/SurahListItem.vue';

const wrapper = mount(SurahListItem, {
    props: {
        surah: { id: 1, name_simple: 'Al-Fatihah' },
    },
    global: {
        stubs: {
            Link: {
                template: '<a><slot /></a>',
                props: ['href'],
            },
        },
    },
});
```

## 2. Mocking `usePage()` Props
```javascript
import { vi } from 'vitest';

vi.mock('@inertiajs/vue3', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        usePage: () => ({
            props: {
                auth: { user: { id: 1, name: 'Ahmad' } },
                flash: {},
            },
        }),
    };
});
```

## 3. Mocking `router.visit` or `router.post`
```javascript
import { router } from '@inertiajs/vue3';
import { vi } from 'vitest';

vi.spyOn(router, 'visit').mockImplementation(() => {});

// In test:
expect(router.visit).toHaveBeenCalledWith('/surah/1');
```
