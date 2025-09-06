import { AssetWhitelistPort } from '@/ports/AssetWhitelistPort';

export class JsonWhitelistAdapter implements AssetWhitelistPort {
  private readonly allowedSymbols: string[];

  constructor(data: { symbols: string[] }) {
    this.allowedSymbols = data.symbols.map((s) => s.toUpperCase());
  }

  async listAllowedSymbols(): Promise<string[]> {
    return this.allowedSymbols;
  }
}

