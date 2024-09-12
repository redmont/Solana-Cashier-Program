import * as asn1 from 'asn1js';
import { Hex, toHex } from 'viem';
import {
  SignatureType,
  RecoveredSignatureType,
} from '@noble/curves/abstract/weierstrass';

const UNCOMPRESSED_PUBLIC_KEY_HEX_LENGTH = 132;

export function pemToDer(pem: string): Uint8Array {
  const base64 = pem.split('\n').slice(1, -2).join('').trim();
  return Buffer.from(base64, 'base64');
}

export function publicKeyFromDer(bytes: Uint8Array): Hex {
  const { result } = asn1.fromBER(bytes);
  const values = (result as asn1.Sequence).valueBlock.value;
  if (values.length < 2) {
    throw new Error('Cannot get public key from ASN.1: invalid sequence');
  }
  const value = values[1] as asn1.BitString;
  return toHex(value.valueBlock.valueHexView);
}

export async function getRecoveredSignature(
  signature: SignatureType,
  publicKey: Hex,
  hash: Uint8Array,
): Promise<RecoveredSignatureType> {
  for (let i = 0; i < 4; i++) {
    const recoveredSignature = signature.addRecoveryBit(i);
    const compressed = publicKey.length < UNCOMPRESSED_PUBLIC_KEY_HEX_LENGTH;
    const recoveredPublicKey = `0x${recoveredSignature.recoverPublicKey(hash).toHex(compressed)}`;
    if (publicKey === recoveredPublicKey) {
      return recoveredSignature;
    }
  }

  throw new Error('Cannot get recovered signature');
}
