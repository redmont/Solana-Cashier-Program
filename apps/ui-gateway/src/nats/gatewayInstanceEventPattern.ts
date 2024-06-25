export function GatewayInstanceEventPattern(pattern: string) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('NATS_SUBJECT_METADATA', pattern, descriptor.value);
  };
}
