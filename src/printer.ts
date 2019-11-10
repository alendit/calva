import * as state from './state';

export type PrettyPrintingOptions = {
    enabled: boolean,
    printEngine?: 'calva' | 'pprint' | 'fipp' | 'puget' | 'zprint',
    width: number,
    maxLength?: number,
    maxDepth?: number
};

export const disabledPrettyPrinter: PrettyPrintingOptions = {
    enabled: false,
    printEngine: undefined,
    width: undefined,
    maxLength: undefined,
    maxDepth: undefined
};

function getPrinter(pprintOptions: PrettyPrintingOptions, printerFn: string, widthSlug: string, lengthSlug: string, depthsSlug: string, moreOptions = {}) {
    const PRINTER_FN = 'nrepl.middleware.print/print',
        OPTIONS = 'nrepl.middleware.print/options';
    let printer = {};
    printer[OPTIONS] = moreOptions;
    printer[PRINTER_FN] = printerFn;
    printer[OPTIONS][widthSlug] = pprintOptions.width;
    if (pprintOptions.maxLength && lengthSlug !== undefined) {
        printer[OPTIONS][lengthSlug] = pprintOptions.maxLength;
    }
    if (pprintOptions.maxDepth && depthsSlug !== undefined) {
        printer[OPTIONS][depthsSlug] = pprintOptions.maxDepth;
    }
    return printer;
}

const zprintExtraOptions = {
    // Can't do this, because `bencode` translates `false` to 0, and `zprint` does not approve (yet, Kim is looking into relaxing this)
    // "record": { 
    //     "to-string?": true
    // }
}

export function getServerSidePrinter(pprintOptions: PrettyPrintingOptions) {
    if (pprintOptions.enabled && pprintOptions.printEngine !== 'calva') {
        switch (pprintOptions.printEngine) {
            case "pprint":
                return getPrinter(pprintOptions, 'cider.nrepl.pprint/pprint', 'right-margin', 'length', 'level');
            case "fipp":
                return getPrinter(pprintOptions, 'cider.nrepl.pprint/fipp-pprint', 'width', 'print-length', 'print-level');
            case "puget":
                return getPrinter(pprintOptions, 'cider.nrepl.pprint/puget-pprint', 'width', 'seq-limit', undefined);
            case "zprint":
                return getPrinter(pprintOptions, 'cider.nrepl.pprint/zprint-pprint', 'width', 'max-length', 'print-depth', zprintExtraOptions);
            default:
                return undefined;
        }
    }
    return undefined;
}

export function prettyPrintingOptions(): PrettyPrintingOptions {
    return state.config().prettyPrintingOptions;
}

export const zprintDependencies = {
    "zprint": "0.4.16"
}

export function getServerSidePrinterDependencies() {
    if (prettyPrintingOptions().printEngine === 'zprint') {
        return zprintDependencies;
    } else {
        return {}
    }
}