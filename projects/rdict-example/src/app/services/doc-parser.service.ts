/* doc-parser.service.ts */
import { Injectable } from '@angular/core';

/** JSON shape you wanted */
export interface ParamDescriptor {
  key: string;
  type: string;
  props: {
    label: string;
    translate: true; // always literal true
    required: true | false;
  };
}

@Injectable({ providedIn: 'root' })
export class DocParserService {
  /** Tokens that are *not* widget types */
  private static readonly TYPE_BLACKLIST = new Set(['str', 'string', 'int', 'integer', 'bool', 'boolean', 'float', 'bytes', 'required']);

  /**
   * Convert a Google-style “Args:” block into a list of field-descriptors.
   *
   * @param doc  Whole docstring text (multi-line string)
   */
  parse(doc: string): ParamDescriptor[] {
    const pattern = /^\s*(\w+)\s*\(([^)]*)\):/gm; // param line regex
    const descriptors: ParamDescriptor[] = [];
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(doc)) !== null) {
      const [, name, blob] = match;
      const tokens = blob.split(',').map((t) => t.trim());

      /** widget “type” = first token that is not in blacklist and not a label= */
      const widget = tokens.find((t) => !DocParserService.TYPE_BLACKLIST.has(t.toLowerCase()) && !t.startsWith('label=')) || 'input';

      /** required flag */
      const required: true | false = tokens.some((t) => t.toLowerCase() === 'required') ? true : false;

      /** UI label */
      const label = tokens.find((t) => t.startsWith('label='))?.split('=', 2)[1] ?? name;

      descriptors.push({
        key: name,
        type: widget,
        props: {
          label,
          translate: true, // hard-wired literal true
          required,
        },
      });
    }
    return descriptors;
  }
}
