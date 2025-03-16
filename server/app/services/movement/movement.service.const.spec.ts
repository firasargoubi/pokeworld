import { keyToPos } from './movement.service.const';

describe('keyToPos', () => {
    it('should convert a key to a position object', () => {
        const key = '3-4';
        const position = keyToPos(key);
        expect(position).toEqual({ x: 3, y: 4 });
    });

    it('should handle negative coordinates', () => {
        const key = '-1-2';
        const position = keyToPos(key);
        expect(position).toEqual({ x: -1, y: 2 });
    });

    it('should handle zero coordinates', () => {
        const key = '0-0';
        const position = keyToPos(key);
        expect(position).toEqual({ x: 0, y: 0 });
    });

    it('should handle large coordinates', () => {
        const key = '12345-67890';
        const position = keyToPos(key);
        expect(position).toEqual({ x: 12345, y: 67890 });
    });

    it('should return NaN for invalid keys', () => {
        const key = 'invalid-key';
        const position = keyToPos(key);
        expect(position).toEqual({ x: NaN, y: NaN });
    });
});
