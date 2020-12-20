import * as vscode from 'vscode';
import { setupCompanionServer } from './companion';
import runTestCases from './runTestCases';
import {
    editorChanged,
    editorClosed,
    checkLaunchWebview,
} from './webview/editorChange';
import { submitToCodeForces, submitToKattis } from './submit';
import { createTelemeteryReporter } from './telemetery';
import { closeWebVeiw } from './webview/webview';
import JudgeViewProvider from './webview/JudeView';

declare global {
    module NodeJS {
        interface Global {
            context: vscode.ExtensionContext;
        }
    }
}

const registerCommands = (context: vscode.ExtensionContext) => {
    console.log('Registering commands');
    const disposable = vscode.commands.registerCommand(
        'cph.runTestCases',
        () => {
            runTestCases(context);
        },
    );

    const disposable2 = vscode.commands.registerCommand(
        'extension.runCodeforcesTestcases',
        () => {
            runTestCases(context);
        },
    );

    const disposable3 = vscode.commands.registerCommand(
        'cph.submitToCodeForces',
        () => {
            submitToCodeForces();
        },
    );
    const disposable4 = vscode.commands.registerCommand(
        'cph.submitToKattis',
        () => {
            submitToKattis();
        },
    );

    const provider = new JudgeViewProvider(context.extensionUri);

    const webviewView = vscode.window.registerWebviewViewProvider(
        JudgeViewProvider.viewType,
        provider,
        {
            webviewOptions: {
                retainContextWhenHidden: true,
            },
        },
    );

    context.subscriptions.push(webviewView);
    context.subscriptions.push(disposable);
    context.subscriptions.push(disposable2);
    context.subscriptions.push(disposable3);
    context.subscriptions.push(disposable4);
};

// This method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('cph: activate() execution started');

    global.context = context;

    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left,
        1000,
    );
    statusBarItem.text = ' ▶  Run Testcases';
    statusBarItem.tooltip = 'Competitive Programming Helper';
    statusBarItem.show();
    statusBarItem.command = 'cph.runTestCases';

    registerCommands(context);
    setupCompanionServer();
    checkLaunchWebview(context);
    createTelemeteryReporter(context);

    vscode.workspace.onDidCloseTextDocument((e) => {
        editorClosed(e, context);
    });

    vscode.window.onDidChangeActiveTextEditor((e) => {
        editorChanged(e, context);
    });

    vscode.window.onDidChangeVisibleTextEditors((editors) => {
        if (editors.length === 0) {
            closeWebVeiw();
        }
    });

    return;
}
