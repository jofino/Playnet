/**
 * MOCK: simula o envio da foto de perfil ao servidor e devolve a URL final.
 * Trocar pela chamada real quando houver backend.
 */
export async function uploadProfilePhoto(localUri: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return localUri;
}
