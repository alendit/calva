import {
  format_text_at_idx_bridge,
  format_text_at_idx_on_type_bridge,
} from '../../../out/cljs-lib/calva.fmt.formatter';
import { jsify } from '../../../out/cljs-lib/calva.js_utils';

export function formatIndex(
  allText: string,
  range: [number, number],
  index: number,
  eol: string,
  onType: boolean = false,
  config = {}
): { 'range-text': string; range: number[]; 'new-index': number; idx: number } {
  const d = {
    'all-text': allText,
    idx: index,
    eol,
    range,
    config,
  };
  const result = jsify((onType ? format_text_at_idx_on_type_bridge : format_text_at_idx_bridge)(d));
  if (!result['error']) {
    return result;
  } else {
    console.error('Error in `formatIndex`:', result['error']);
    throw result['error'];
  }
}
