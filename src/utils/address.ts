import { bech32m } from 'bech32';

export interface AddressInfo {
    hash: Uint8Array;
    prefix: string;
}

export function toAddress(hash: Uint8Array, prefix: string): string {
    return bech32m.encode(prefix, convertBits(hash, 8, 5, true));
}

export function addressInfo(address: string): AddressInfo {
    const { words, prefix } = bech32m.decode(address);
    return {
        hash: convertBits(Uint8Array.from(words), 5, 8, false),
        prefix,
    };
}

export function convertBits(
    bytes: Uint8Array,
    from: number,
    to: number,
    pad: boolean
): Uint8Array {
    let accumulate = 0;
    let bits = 0;
    let maxv = (1 << to) - 1;
    let result = [];
    for (const value of bytes) {
        const b = value & 0xff;
        if (b < 0 || b >> from > 0) throw new Error('Could not convert bits.');
        accumulate = (accumulate << from) | b;
        bits += from;
        while (bits >= to) {
            bits -= to;
            result.push((accumulate >> bits) & maxv);
        }
    }
    if (pad && bits > 0) {
        result.push((accumulate << (to - bits)) & maxv);
    } else if (bits >= from || ((accumulate << (to - bits)) & maxv) != 0) {
        throw new Error('Could not convert bits.');
    }
    return Uint8Array.from(result);
}
