// Run with `bun test scripts`
import { describe, expect, it } from 'bun:test';

import { camelCaseSegment, convertKey, convertKeys } from './resxKeys.ts';

describe('camelCaseSegment', () => {
    it.each([
        ['MainLayout', 'mainLayout'],
        ['UISetupStepper', 'uiSetupStepper'],
        ['UI', 'ui'],
        ['A', 'a'],
        ['already', 'already'],
        ['Placeholder', 'placeholder'],
    ])('%s -> %s', (input, expected) => {
        expect(camelCaseSegment(input)).toBe(expected);
    });
});

describe('convertKey', () => {
    it('splits on underscores', () => {
        expect(convertKey('MainLayout_SearchTextField_Placeholder')).toBe('mainLayout.searchTextField.placeholder');
    });

    it('splits on dots', () => {
        expect(convertKey('homebook.kitchen.recipeimages')).toBe('homebook.kitchen.recipeimages');
    });

    it('rejects empty segments', () => {
        expect(() => convertKey('Foo__Bar')).toThrow();
    });
});

describe('convertKeys', () => {
    it('moves a leaf that is also a prefix to label', () => {
        const result = convertKeys(['Step_Title', 'Step_Title_Caption']);

        expect(result.get('Step_Title')).toBe('step.title.label');
        expect(result.get('Step_Title_Caption')).toBe('step.title.caption');
    });

    it('honours fixed paths', () => {
        const result = convertKeys(['StartMenuItems_Open_Text'], { StartMenuItems_Open_Text: 'ui.startMenuItem.open' });

        expect(result.get('StartMenuItems_Open_Text')).toBe('ui.startMenuItem.open');
    });

    it('aborts on two keys with the same path', () => {
        expect(() => convertKeys(['Foo_Bar', 'FOO_Bar'])).toThrow('both convert');
    });
});
