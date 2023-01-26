export function splitBitField(permissions: number): number[] {
    const values: number[] = [];
    while (permissions) {
        const bit = permissions & (~permissions + 1);
        values.push(bit);
        permissions ^= bit;
    }
    return values;
}
