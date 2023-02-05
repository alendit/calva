import vscode from 'vscode';
import { FormatOnTypeEditProvider } from './providers/ontype_formatter';
import { RangeEditProvider } from './providers/range_formatter';
import formatter from './format';
import inferer from './infer';
import docmirror from '../../doc-mirror/index';
import config from '../../formatter-config';
import calvaConfig from '../../config';

function getLanguageConfiguration(): vscode.LanguageConfiguration {
  const languageConfiguration = {
    onEnterRules: config.formatOnTypeEnabled()
      ? [
          // When Calva is the formatter disable all vscode default indentation
          // (By outdenting a lot, which is the only way I have found that works)
          // TODO: Make it actually consider whether Calva is the formatter or not
          {
            beforeText: /.*/,
            action: {
              indentAction: vscode.IndentAction.Outdent,
              removeText: Number.MAX_VALUE,
            },
          },
        ]
      : [],
  };
  return languageConfiguration;
}

export function activate(context: vscode.ExtensionContext) {
  docmirror.activate();
  vscode.languages.setLanguageConfiguration('clojure', getLanguageConfiguration());
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'calva-fmt.formatCurrentForm',
      formatter.formatPositionCommand
    )
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'calva-fmt.alignCurrentForm',
      formatter.alignPositionCommand
    )
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'calva-fmt.trimCurrentFormWhiteSpace',
      formatter.trimWhiteSpacePositionCommand
    )
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('calva-fmt.inferParens', inferer.inferParensCommand)
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('calva-fmt.tabIndent', (e) => {
      inferer.indentCommand(e, ' ', true);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('calva-fmt.tabDedent', (e) => {
      inferer.indentCommand(e, ' ', false);
    })
  );
  context.subscriptions.push(
    vscode.languages.registerOnTypeFormattingEditProvider(
      calvaConfig.documentSelector,
      new FormatOnTypeEditProvider(),
      '\r',
      '\n',
      ')',
      ']',
      '}'
    )
  );
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeFormattingEditProvider(
      calvaConfig.documentSelector,
      new RangeEditProvider()
    )
  );
  vscode.window.onDidChangeActiveTextEditor(inferer.updateState);
  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('calva.fmt.formatAsYouType')) {
      vscode.languages.setLanguageConfiguration('clojure', getLanguageConfiguration());
    }
  });
}
