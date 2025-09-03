#!/usr/bin/env node

/**
 * 重複宣言検出ツール
 * index.htmlと外部JSファイル間の変数・関数重複を検出
 */

const fs = require('fs');
const path = require('path');

class DuplicateDeclarationChecker {
    constructor() {
        this.declarations = new Map(); // 宣言名 → ファイル名の配列
        this.errors = [];
    }

    async checkProject() {
        console.log('🔍 重複宣言チェック開始');
        
        // index.htmlをチェック
        await this.checkFile('index.html');
        
        // sharedディレクトリをチェック
        await this.checkDirectory('shared');
        
        // tabsディレクトリをチェック
        await this.checkDirectory('tabs');
        
        this.generateReport();
    }
    
    async checkFile(filePath) {
        try {
            if (!fs.existsSync(filePath)) return;
            
            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = path.basename(filePath);
            
            // 変数宣言を検出
            const varDeclarations = content.match(/(?:let|const|var)\s+(\w+)/g) || [];
            const functionDeclarations = content.match(/function\s+(\w+)/g) || [];
            const windowAssignments = content.match(/window\.(\w+)\s*=/g) || [];
            
            varDeclarations.forEach(match => {
                const varName = match.replace(/(?:let|const|var)\s+/, '');
                this.addDeclaration(varName, filePath, 'variable');
            });
            
            functionDeclarations.forEach(match => {
                const funcName = match.replace(/function\s+/, '');
                this.addDeclaration(funcName, filePath, 'function');
            });
            
            windowAssignments.forEach(match => {
                const propName = match.replace(/window\./, '').replace(/\s*=$/, '');
                this.addDeclaration(propName, filePath, 'window property');
            });
            
            console.log(`✅ ${fileName}: ${varDeclarations.length}変数, ${functionDeclarations.length}関数, ${windowAssignments.length}window`);
            
        } catch (error) {
            console.log(`❌ ${filePath}チェックエラー: ${error.message}`);
        }
    }
    
    async checkDirectory(dirPath) {
        try {
            if (!fs.existsSync(dirPath)) return;
            
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dirPath, file.name);
                
                if (file.isDirectory()) {
                    await this.checkDirectory(fullPath);
                } else if (file.name.endsWith('.js')) {
                    await this.checkFile(fullPath);
                }
            }
        } catch (error) {
            console.log(`❌ ${dirPath}ディレクトリチェックエラー: ${error.message}`);
        }
    }
    
    addDeclaration(name, filePath, type) {
        if (!this.declarations.has(name)) {
            this.declarations.set(name, []);
        }
        
        this.declarations.get(name).push({ file: filePath, type });
    }
    
    generateReport() {
        console.log('\n📊 重複宣言チェック結果:');
        
        let duplicateCount = 0;
        
        for (const [name, locations] of this.declarations.entries()) {
            if (locations.length > 1) {
                duplicateCount++;
                console.log(`\n🚨 重複検出: ${name}`);
                
                locations.forEach(location => {
                    console.log(`   - ${location.file} (${location.type})`);
                });
                
                this.errors.push({
                    name,
                    locations: locations.map(l => l.file),
                    type: locations[0].type
                });
            }
        }
        
        if (duplicateCount === 0) {
            console.log('✅ 重複宣言は見つかりませんでした');
        } else {
            console.log(`\n⚠️ ${duplicateCount}個の重複宣言が見つかりました`);
            
            // 修正提案
            console.log('\n💡 修正提案:');
            this.errors.forEach(error => {
                console.log(`\n- ${error.name}:`);
                console.log('  選択肢1: index.htmlから削除（外部JSで定義済みの場合）');
                console.log('  選択肢2: 外部JSから削除（index.htmlがメイン管理の場合）');
                console.log('  選択肢3: 名前空間使用（例: App.${error.name}）');
            });
        }
        
        // 結果保存
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultFile = `./tools/testing/analysis-results/duplicate_check_${timestamp}.json`;
        
        // ディレクトリが存在しない場合は作成
        const dir = path.dirname(resultFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(resultFile, JSON.stringify({
            timestamp: new Date().toISOString(),
            totalDeclarations: this.declarations.size,
            duplicateCount,
            errors: this.errors
        }, null, 2));
        
        console.log(`💾 詳細結果保存: ${resultFile}`);
    }
}

// メイン実行
if (require.main === module) {
    const checker = new DuplicateDeclarationChecker();
    checker.checkProject();
}

module.exports = DuplicateDeclarationChecker;