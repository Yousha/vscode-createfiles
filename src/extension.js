const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context) {
    // Create PHP File command.
    let phpFileDisposable = vscode.commands.registerCommand('extension.createPhpFile', async (uri) => {
        const folderPath = uri.fsPath;
        let fileName = 'untitled.php';
        let counter = 1;

        while (fs.existsSync(path.join(folderPath, fileName))) {
            fileName = `untitled${counter}.php`;
            counter++;
        }

        await createFile(
            path.join(folderPath, fileName),
            '<?php\n\n',
            'PHP file'
        );
    });

    // Create composer.json command.
    let composerJsonDisposable = vscode.commands.registerCommand('extension.createComposerJson', async (uri) => {
        const folderPath = uri.fsPath;
        const fileName = 'composer.json';
        const fullPath = path.join(folderPath, fileName);

        if (fs.existsSync(fullPath)) {
            const choice = await vscode.window.showWarningMessage(
                'composer.json already exists. Overwrite?',
                'Yes', 'No'
            );

            if (choice !== 'Yes') {
                return;
            }
        }

        const composerJsonContent = {
            "name": "vendor/package",
            "description": "",
            "type": "project",
            "license": "proprietary",
            "require": {
                "php": "^8.1"
            },
            "autoload": {
                "psr-4": {
                    "App\\": "src/"
                }
            },
            "minimum-stability": "dev",
            "prefer-stable": true
        };

        await createFile(
            fullPath,
            JSON.stringify(composerJsonContent, null, 4),
            'composer.json'
        );
    });

    context.subscriptions.push(phpFileDisposable, composerJsonDisposable);
}

async function createFile(filePath, content, fileType) {
    try {
        // Create file with specified content.
        fs.writeFileSync(filePath, content);

        // Refresh explorer to show new file.
        await vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');

        // Wait a brief moment for refresh to complete.
        await new Promise(resolve => setTimeout(resolve, 300));

        // Focus and select new file in explorer.
        const fileUri = vscode.Uri.file(filePath);
        await vscode.commands.executeCommand('revealInExplorer', fileUri);

        // Open file in editor.
        const document = await vscode.workspace.openTextDocument(fileUri);
        await vscode.window.showTextDocument(document);

        vscode.window.showInformationMessage(`Created new ${fileType}: ${path.basename(filePath)}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to create ${fileType}: ${error.message}`);
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
