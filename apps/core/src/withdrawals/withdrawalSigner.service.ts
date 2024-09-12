import { Injectable, Logger, OnModuleInit, Param } from '@nestjs/common';
import {
  KMSClient,
  SignCommand,
  GetPublicKeyCommand,
} from '@aws-sdk/client-kms';
import { publicKeyToAddress, toAccount } from 'viem/accounts';
import { ConfigService } from '@nestjs/config';
import {
  hashMessage,
  hashTypedData,
  keccak256,
  recoverAddress,
  serializeTransaction,
  serializeSignature,
  Hex,
  toHex,
  hexToBytes,
  signatureToHex,
} from 'viem';
import { getRecoveredSignature, publicKeyFromDer } from './utils';
import { secp256k1 } from '@noble/curves/secp256k1';

@Injectable()
export class WithdrawalSignerService implements OnModuleInit {
  private readonly logger = new Logger(WithdrawalSignerService.name);

  private kms: KMSClient;
  private keyId: string;

  constructor(configService: ConfigService) {
    this.kms = new KMSClient({
      region: 'ap-southeast-1',
      endpoint: configService.get<boolean>('isKmsLocal')
        ? 'http://localhost:8089'
        : undefined,
    });
    this.keyId =
      configService.getOrThrow<string>('withdrawalSignerKmsKeyId') ?? '';
  }

  async onModuleInit() {
    const publicKey = await this.getPublicKey();
    const address = publicKeyToAddress(publicKey);

    this.logger.log(`Withdrawal signer initialized with address ${address}`);
  }

  async getAccount() {
    const publicKey = await this.getPublicKey();
    const address = publicKeyToAddress(publicKey);

    return toAccount({
      address,
      signMessage: async ({ message }) => {
        const signature = await this.sign(publicKey, hashMessage(message));
        return signatureToHex(signature);
      },
      signTransaction: async (
        transaction,
        { serializer = serializeTransaction } = {},
      ) => {
        const signableTransaction = (() => {
          if (transaction.type === 'eip4844') {
            return {
              ...transaction,
              sidecars: false,
            };
          }
          return transaction;
        })();

        const hash = keccak256(serializer(signableTransaction));
        const signature = await this.sign(publicKey, hash);

        return serializer(transaction, signature);
      },
      signTypedData: async (typedData) => {
        const signature = await this.sign(publicKey, hashTypedData(typedData));
        return signatureToHex(signature);
      },
    });
  }

  async getPublicKey() {
    const result = await this.kms.send(
      new GetPublicKeyCommand({
        KeyId: this.keyId,
      }),
    );

    return publicKeyFromDer(result.PublicKey);
  }

  async sign(publicKey: Hex, messageHash: Hex) {
    const hash = hexToBytes(messageHash);
    const signature = await this.signWithKms(hash);
    const { r, s, recovery } = await getRecoveredSignature(
      signature,
      publicKey,
      hash,
    );

    return {
      r: toHex(r),
      s: toHex(s),
      v: BigInt(recovery) + 27n,
      yParity: recovery,
    };
  }

  async signWithKms(hash: Uint8Array) {
    const result = await this.kms.send(
      new SignCommand({
        KeyId: this.keyId,
        Message: hash,
        MessageType: 'DIGEST',
        SigningAlgorithm: 'ECDSA_SHA_256',
      }),
    );

    const { Signature } = result;

    return secp256k1.Signature.fromDER(Signature).normalizeS();
  }

  async determineV(message: Buffer, r: bigint, s: bigint, address: string) {
    let v = 27;
    const publicKey = await this.recoverPublicKeyFromSignature(
      message,
      r,
      s,
      v,
    );
    if (publicKey.toLowerCase() !== address.toLowerCase()) {
      v = 28;
    }
    return v;
  }

  async recoverPublicKeyFromSignature(
    message: Buffer,
    r: bigint,
    s: bigint,
    v: number,
  ) {
    return recoverAddress({
      hash: `0x${message.toString('hex')}`,
      signature: serializeSignature({
        r: `0x${r.toString(16)}`,
        s: `0x${s.toString(16)}`,
        v: BigInt(v),
      }),
    });
  }
}
