import { randomBytes } from "node:crypto";
import { KeyedMutex, readJson, writeJsonAtomic } from "./jsonFile.js";

export interface KeyEntry {
  boardId: string;
  /** Nombre del grupo o contacto, para mostrar en la web. */
  name: string;
  createdAt: string;
}

type KeysFile = Record<string, KeyEntry>;

/** Claves de acceso al tablero web, una por chat: {clave: board} en un JSON. */
export class WebKeys {
  private mutex = new KeyedMutex();

  constructor(private readonly file: string) {}

  async resolve(key: string): Promise<KeyEntry | null> {
    if (!key) return null;
    const keys = await this.read();
    return Object.hasOwn(keys, key) ? keys[key] : null;
  }

  /** Devuelve la clave del chat, creándola si no existe. Con rotate invalida la anterior. */
  keyFor(boardId: string, name: string, { rotate = false } = {}): Promise<string> {
    return this.mutex.run("keys", async () => {
      const keys = await this.read();
      let key = Object.keys(keys).find((k) => keys[k].boardId === boardId);
      if (key && rotate) {
        delete keys[key];
        key = undefined;
      }
      if (key) {
        keys[key].name = name;
      } else {
        key = randomBytes(16).toString("base64url");
        keys[key] = { boardId, name, createdAt: new Date().toISOString() };
      }
      await writeJsonAtomic(this.file, keys);
      return key;
    });
  }

  private read(): Promise<KeysFile> {
    return readJson(this.file, () => ({}));
  }
}
