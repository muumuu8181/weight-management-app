#!/usr/bin/env node

/**
 * 包括的重複検出システム
 * CSS、HTML、JavaScript、文字列、依存関係の全重複を検出
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveDuplicateChecker {
    constructor() {
        this.cssSelectors = new Map();
        this.htmlElements = new Map();
        this.jsDeclarations = new Map();
        this.stringLiterals = new Map();
        this.dependencies = new Map();
        this.functionCalls = new Map();
        this.errors = [];
    }

    async checkProject() {
        console.log('🔍 包括的重複検出システム開始');
        
        // index.htmlをチェック
        await this.checkFile('index.html', 'main');
        
        // 外部ファイルをチェック
        await this.checkDirectory('shared', 'shared');
        await this.checkDirectory('tabs', 'tabs');
        await this.checkDirectory('custom', 'custom');
        
        this.generateComprehensiveReport();
    }
    
    async checkFile(filePath, category) {
        try {
            if (!fs.existsSync(filePath)) return;
            
            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = path.basename(filePath);
            const ext = path.extname(filePath);
            
            // 1. CSS重複検出
            if (ext === '.css' || content.includes('<style>')) {
                this.checkCSSSelectors(content, filePath);
            }
            
            // 2. HTML要素重複検出
            if (ext === '.html' || filePath === 'index.html') {
                this.checkHTMLElements(content, filePath);
            }
            
            // 3. JavaScript重複検出
            if (ext === '.js' || content.includes('<script>')) {
                this.checkJSDeclarations(content, filePath);
                this.checkFunctionCalls(content, filePath);
            }
            
            // 4. 文字列重複検出
            this.checkStringDuplicates(content, filePath);
            
            // 5. 依存関係重複検出
            this.checkDependencyDuplicates(content, filePath);
            
            console.log(`✅ ${fileName}: 包括的検出完了`);
            
        } catch (error) {
            console.log(`❌ ${filePath}チェックエラー: ${error.message}`);
        }
    }
    
    checkCSSSelectors(content, filePath) {
        // CSSセレクター抽出（.class, #id, element）
        const cssRegex = /\.[\w-]+|#[\w-]+|^[\w-]+(?=\s*{)/gm;
        const matches = content.match(cssRegex) || [];
        
        matches.forEach(selector => {
            this.addDuplicate(this.cssSelectors, selector.trim(), filePath, 'CSS selector');
        });
    }
    
    checkHTMLElements(content, filePath) {
        // HTML要素・属性の重複検出
        const titleMatches = content.match(/<title[^>]*>([^<]+)<\/title>/g) || [];
        const h1Matches = content.match(/<h1[^>]*>([^<]+)<\/h1>/g) || [];
        const idMatches = content.match(/id=\"([^\"]+)\"/g) || [];
        
        titleMatches.forEach(match => {
            const title = match.replace(/<\/?title[^>]*>/g, '');
            this.addDuplicate(this.htmlElements, `title:${title}`, filePath, 'HTML title');
        });
        
        h1Matches.forEach(match => {
            const h1 = match.replace(/<\/?h1[^>]*>/g, '');
            this.addDuplicate(this.htmlElements, `h1:${h1}`, filePath, 'HTML h1');
        });
        
        idMatches.forEach(match => {
            const id = match.replace(/id=\"([^\"]+)\"/, '$1');
            this.addDuplicate(this.htmlElements, `id:${id}`, filePath, 'HTML id');
        });
    }
    
    checkJSDeclarations(content, filePath) {
        // JavaScript宣言の検出
        const varDeclarations = content.match(/(?:let|const|var)\s+(\w+)/g) || [];
        const functionDeclarations = content.match(/function\s+(\w+)/g) || [];
        const windowAssignments = content.match(/window\.(\w+)\s*=/g) || [];
        
        varDeclarations.forEach(match => {
            const varName = match.replace(/(?:let|const|var)\s+/, '');
            this.addDuplicate(this.jsDeclarations, varName, filePath, 'JS variable');
        });
        
        functionDeclarations.forEach(match => {
            const funcName = match.replace(/function\s+/, '');
            this.addDuplicate(this.jsDeclarations, funcName, filePath, 'JS function');
        });
        
        windowAssignments.forEach(match => {
            const propName = match.replace(/window\./, '').replace(/\s*=$/, '');
            this.addDuplicate(this.jsDeclarations, propName, filePath, 'window property');
        });
    }
    
    checkFunctionCalls(content, filePath) {
        // 関数呼び出しパターンの検出
        const callPatterns = [
            /(\w+Data)\(\)/g,  // loadUserWeightData(), saveSleepData()等
            /initialize(\w+)\(\)/g,  // initializeSleepManager()等
            /(load\w+)\(\)/g,  // loadCustomItems()等
            /(save\w+)\(\)/g,  // saveCustomItems()等
            /(select\w+)\(\)/g  // selectTiming()等
        ];
        
        callPatterns.forEach(pattern => {
            const matches = content.match(pattern) || [];
            matches.forEach(match => {
                this.addDuplicate(this.functionCalls, match, filePath, 'function call');
            });
        });
    }
    
    checkStringDuplicates(content, filePath) {
        // 重要な文字列の重複検出
        const importantStrings = [
            '体重管理アプリ',
            '睡眠管理',
            '部屋片付け',
            'メモリスト',
            'Firebase',
            'ログイン',
            '外部ファイルで定義済み',
            '分離済み'
        ];
        
        importantStrings.forEach(str => {
            const count = (content.match(new RegExp(str, 'g')) || []).length;
            if (count > 0) {
                this.addDuplicate(this.stringLiterals, str, filePath, `string (${count}回)`);
            }
        });
    }
    
    checkDependencyDuplicates(content, filePath) {
        // 依存関係の重複検出
        const cssLinks = content.match(/<link[^>]*href=\"([^\"]+\.css)\"/g) || [];
        const scriptSrcs = content.match(/<script[^>]*src=\"([^\"]+\.js)\"/g) || [];
        
        cssLinks.forEach(match => {
            const href = match.replace(/<link[^>]*href=\"([^\"]+\.css)\".*/, '$1');
            this.addDuplicate(this.dependencies, `CSS:${href}`, filePath, 'CSS dependency');
        });
        
        scriptSrcs.forEach(match => {
            const src = match.replace(/<script[^>]*src=\"([^\"]+\.js)\".*/, '$1');
            this.addDuplicate(this.dependencies, `JS:${src}`, filePath, 'JS dependency');
        });
    }
    
    async checkDirectory(dirPath, category) {
        try {
            if (!fs.existsSync(dirPath)) return;
            
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const file of files) {
                const fullPath = path.join(dirPath, file.name);
                
                if (file.isDirectory()) {
                    await this.checkDirectory(fullPath, category);
                } else if (file.name.match(/\.(html|css|js)$/)) {
                    await this.checkFile(fullPath, category);
                }
            }
        } catch (error) {
            console.log(`❌ ${dirPath}ディレクトリチェックエラー: ${error.message}`);
        }
    }
    
    addDuplicate(map, name, filePath, type) {
        if (!map.has(name)) {
            map.set(name, []);
        }
        map.get(name).push({ file: filePath, type });
    }
    
    generateComprehensiveReport() {
        console.log('\\n📊 包括的重複検出結果:');
        
        // CSS重複
        console.log('\\n🎨 CSS重複:');
        let cssDuplicates = 0;
        for (const [selector, locations] of this.cssSelectors.entries()) {
            if (locations.length > 1) {
                cssDuplicates++;
                console.log(`   🚨 ${selector}:`);
                locations.forEach(loc => console.log(`      - ${loc.file}`));
            }
        }
        if (cssDuplicates === 0) console.log('   ✅ CSS重複なし');
        
        // HTML重複  
        console.log('\\n🏷️ HTML重複:');
        let htmlDuplicates = 0;
        for (const [element, locations] of this.htmlElements.entries()) {
            if (locations.length > 1) {
                htmlDuplicates++;
                console.log(`   🚨 ${element}:`);
                locations.forEach(loc => console.log(`      - ${loc.file}`));
            }
        }
        if (htmlDuplicates === 0) console.log('   ✅ HTML重複なし');
        
        // JavaScript重複（重要なもののみ）
        console.log('\\n⚡ JavaScript重複（グローバル変数・重要関数）:');
        let jsDuplicates = 0;
        const importantJS = ['currentUser', 'currentMode', 'selectedTarget', 'APP_VERSION', 'firebase', 'database'];
        
        for (const [name, locations] of this.jsDeclarations.entries()) {
            if (locations.length > 1 && importantJS.some(important => name.includes(important))) {
                jsDuplicates++;
                console.log(`   🚨 ${name}:`);
                locations.forEach(loc => console.log(`      - ${loc.file} (${loc.type})`));
            }
        }
        if (jsDuplicates === 0) console.log('   ✅ 重要JavaScript重複なし');
        
        // 文字列重複
        console.log('\\n📝 文字列重複:');
        let stringDuplicates = 0;
        for (const [str, locations] of this.stringLiterals.entries()) {
            if (locations.length > 1) {
                stringDuplicates++;
                console.log(`   🚨 \"${str}\":`);
                locations.forEach(loc => console.log(`      - ${loc.file} (${loc.type})`));
            }
        }
        if (stringDuplicates === 0) console.log('   ✅ 文字列重複なし');
        
        // 依存関係重複
        console.log('\\n📦 依存関係重複:');
        let depDuplicates = 0;
        for (const [dep, locations] of this.dependencies.entries()) {
            if (locations.length > 1) {
                depDuplicates++;
                console.log(`   🚨 ${dep}:`);
                locations.forEach(loc => console.log(`      - ${loc.file}`));
            }
        }
        if (depDuplicates === 0) console.log('   ✅ 依存関係重複なし');
        
        // サマリー
        const totalDuplicates = cssDuplicates + htmlDuplicates + jsDuplicates + stringDuplicates + depDuplicates;
        console.log(`\\n📈 重複検出サマリー: ${totalDuplicates}個の重複発見`);
        
        // 結果保存
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultFile = `./tools/testing/analysis-results/comprehensive_duplicate_${timestamp}.json`;
        
        const dir = path.dirname(resultFile);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(resultFile, JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                cssSelectors: this.cssSelectors.size,
                htmlElements: this.htmlElements.size,
                jsDeclarations: this.jsDeclarations.size,
                stringLiterals: this.stringLiterals.size,
                dependencies: this.dependencies.size,
                functionCalls: this.functionCalls.size,
                totalDuplicates
            },
            details: {
                css: Array.from(this.cssSelectors.entries()).filter(([k,v]) => v.length > 1),
                html: Array.from(this.htmlElements.entries()).filter(([k,v]) => v.length > 1),
                js: Array.from(this.jsDeclarations.entries()).filter(([k,v]) => v.length > 1),
                strings: Array.from(this.stringLiterals.entries()).filter(([k,v]) => v.length > 1),
                deps: Array.from(this.dependencies.entries()).filter(([k,v]) => v.length > 1)
            }
        }, null, 2));
        
        console.log(`💾 詳細結果保存: ${resultFile}`);
    }
}

// メイン実行
if (require.main === module) {
    const checker = new ComprehensiveDuplicateChecker();
    checker.checkProject();
}

module.exports = ComprehensiveDuplicateChecker;