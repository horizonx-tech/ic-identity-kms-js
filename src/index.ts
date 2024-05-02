import {
  GetPublicKeyCommand,
  KMSClient,
  SignCommand,
} from '@aws-sdk/client-kms'
import { PublicKey, Signature, SignIdentity } from '@dfinity/agent'
import { uint8ToBuf } from '@dfinity/candid'
import { Secp256k1PublicKey } from '@dfinity/identity-secp256k1'
import { secp256k1 } from '@noble/curves/secp256k1'
import { sha256 } from '@noble/hashes/sha256'

export class KmsIdentity extends SignIdentity {
  constructor(
    private readonly kmsClient: KMSClient,
    private readonly kmsKeyId: string,
    private readonly publicKey: PublicKey,
  ) {
    super()
  }

  static async from(
    kmsClient: KMSClient,
    kmsKeyId: string,
  ): Promise<KmsIdentity> {
    const out = await kmsClient.send(
      new GetPublicKeyCommand({ KeyId: kmsKeyId }),
    )
    if (!out.PublicKey) throw new Error('No public key found')

    const publicKey = Secp256k1PublicKey.fromDer(out.PublicKey)
    return new KmsIdentity(kmsClient, kmsKeyId, publicKey)
  }

  getPublicKey(): PublicKey {
    return this.publicKey
  }

  async sign(blob: ArrayBuffer): Promise<Signature> {
    const hash = sha256.create()
    hash.update(new Uint8Array(blob))
    const out = await this.kmsClient.send(
      new SignCommand({
        KeyId: this.kmsKeyId,
        Message: new Uint8Array(hash.digest()),
        MessageType: 'DIGEST',
        SigningAlgorithm: 'ECDSA_SHA_256',
      }),
    )
    if (!out.Signature) throw new Error('No signature found')

    const signature = secp256k1.Signature.fromDER(out.Signature)
    return uint8ToBuf(signature.toCompactRawBytes()) as Signature
  }
}
