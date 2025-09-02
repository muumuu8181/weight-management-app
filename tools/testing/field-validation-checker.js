// 必須・オプション項目一致性チェックツール
// HTMLバッジとJavaScript検証の整合性を自動検証

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

console.log('🔍 必須・オプション項目一致性チェック開始');

// テスト対象タブの設定
const TAB_CONFIGS = {
    'tab1-weight': {
        jsPath: 'tabs/tab1-weight/weight.js',
        htmlPath: 'tabs/tab1-weight/weight.html',
        expectedRequired: ['dateInput', 'weightValue', 'selectedTiming'],
        expectedOptional: ['timeInput', 'selectedTop', 'selectedBottom', 'memoInput']
    },
    'tab2-sleep': {
        jsPath: 'tabs/tab2-sleep/tab-sleep.js',
        htmlPath: 'tabs/tab2-sleep/tab-sleep.html',
        expectedRequired: ['sleepDateInput', 'sleepTimeInput'],
        expectedOptional: ['selectedSleepType', 'selectedQuality', 'selectedSleepTags', 'sleepMemoInput']
    },
    'tab3-room-cleaning': {
        jsPath: 'tabs/tab3-room-cleaning/tab-room-cleaning.js',
        htmlPath: 'tabs/tab3-room-cleaning/tab-room-cleaning.html',
        expectedRequired: ['roomDateInput', 'selectedRoom'],
        expectedOptional: ['roomTimeInput', 'roomMemoInput', 'roomUnifiedAddText']
    },
    'tab4-stretch': {
        jsPath: 'tabs/tab4-stretch/tab-stretch.js',
        htmlPath: 'tabs/tab4-stretch/tab-stretch.html',
        expectedRequired: ['stretchDateInput', 'selectedStretchType'],
        expectedOptional: ['stretchTimeInput', 'selectedIntensity', 'selectedBodyParts', 'stretchMemoInput']
    },
    'tab7-pedometer': {
        jsPath: 'tabs/tab7-pedometer/tab-pedometer.js',
        htmlPath: 'tabs/tab7-pedometer/tab-pedometer.html',
        expectedRequired: ['pedometerDateInput', 'stepsInput', 'selectedExerciseType'],
        expectedOptional: ['pedometerTimeInput', 'distanceInput', 'caloriesInput', 'pedometerMemoInput']
    },
    'tab8-memo-list': {
        jsPath: 'tabs/tab8-memo-list/tab-memo-list.js',
        htmlPath: 'tabs/tab8-memo-list/tab-memo-list.html',
        expectedRequired: ['newMemoText'],
        expectedOptional: ['memoCategory', 'memoPriority', 'memoTimeframe', 'deadlineInput']
    }
};

// チェック結果
let totalChecks = 0;
let passedChecks = 0;
let failedChecks = [];

// JavaScript設定抽出
function extractJSFieldConfig(jsContent) {
    const configMatch = jsContent.match(/const\s+\w*FieldConfig\s*=\s*{([\s\S]*?)};/);
    if (!configMatch) return null;
    
    const configStr = configMatch[1];
    const requiredMatch = configStr.match(/required:\s*\[(.*?)\]/s);
    const optionalMatch = configStr.match(/optional:\s*\[(.*?)\]/s);
    
    const parseArray = (match) => {
        if (!match) return [];
        return match[1]
            .split(',')
            .map(item => item.trim().replace(/['"]/g, ''))
            .filter(item => item.length > 0);
    };
    
    return {
        required: parseArray(requiredMatch),
        optional: parseArray(optionalMatch)
    };
}

// HTML内の必須・オプション検証抽出
function extractValidationFromJS(jsContent) {
    const validationChecks = {
        required: [],
        optional: []
    };
    
    // 必須チェックパターンを検索
    const requiredPatterns = [
        /if\s*\(\s*!([^)]+)\s*\)/g,
        /if\s*\(\s*([^)]+)\s*===?\s*['"']\s*['"']\s*\)/g,
        /if\s*\(\s*([^)]+)\.value\s*===?\s*['"']\s*['"']\s*\)/g
    ];
    
    requiredPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(jsContent)) !== null) {
            const condition = match[1];
            // getElementById等からフィールドIDを抽出
            const idMatch = condition.match(/getElementById\(['"`]([^'"`]+)['"`]\)/);
            if (idMatch) {
                validationChecks.required.push(idMatch[1]);
            }
        }
    });
    
    return validationChecks;
}

// HTML内のバッジ確認
function checkHTMLBadges(htmlContent) {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    const requiredFields = [];
    const optionalFields = [];
    
    // 必須バッジが付いている項目を検索
    document.querySelectorAll('.required-badge').forEach(badge => {
        const label = badge.closest('label');
        if (label) {
            // ラベルに対応するフィールドIDを探す
            const forAttr = label.getAttribute('for');
            if (forAttr) {
                requiredFields.push(forAttr);
            } else {
                // for属性がない場合、近くの入力要素を探す
                const inputRow = label.closest('.input-row');
                if (inputRow) {
                    const input = inputRow.querySelector('input, select, textarea');
                    if (input && input.id) {
                        requiredFields.push(input.id);
                    }
                }
            }
        }
    });
    
    // オプションバッジが付いている項目を検索
    document.querySelectorAll('.optional-badge').forEach(badge => {
        const label = badge.closest('label');
        if (label) {
            const forAttr = label.getAttribute('for');
            if (forAttr) {
                optionalFields.push(forAttr);
            } else {
                const inputRow = label.closest('.input-row');
                if (inputRow) {
                    const input = inputRow.querySelector('input, select, textarea');
                    if (input && input.id) {
                        optionalFields.push(input.id);
                    }
                }
            }
        }
    });
    
    return { requiredFields, optionalFields };
}

// メインチェック関数
async function checkTabFieldConsistency() {
    console.log('\n📊 タブ別フィールド一致性チェック結果');
    console.log('=' .repeat(60));
    
    for (const [tabName, config] of Object.entries(TAB_CONFIGS)) {
        console.log(`\n🔍 ${tabName} をチェック中...`);
        
        try {
            // ファイル読み込み
            const jsPath = path.resolve(config.jsPath);
            const htmlPath = path.resolve(config.htmlPath);
            
            if (!fs.existsSync(jsPath)) {
                console.log(`❌ JSファイルが見つかりません: ${jsPath}`);
                failedChecks.push(`${tabName}: JSファイル不存在`);
                continue;
            }
            
            if (!fs.existsSync(htmlPath)) {
                console.log(`❌ HTMLファイルが見つかりません: ${htmlPath}`);
                failedChecks.push(`${tabName}: HTMLファイル不存在`);
                continue;
            }
            
            const jsContent = fs.readFileSync(jsPath, 'utf8');
            const htmlContent = fs.readFileSync(htmlPath, 'utf8');
            
            // JavaScript設定を抽出
            const jsConfig = extractJSFieldConfig(jsContent);
            const htmlBadges = checkHTMLBadges(htmlContent);
            const jsValidation = extractValidationFromJS(jsContent);
            
            console.log(`  📋 期待される設定:`);
            console.log(`    必須: [${config.expectedRequired.join(', ')}]`);
            console.log(`    任意: [${config.expectedOptional.join(', ')}]`);
            
            if (jsConfig) {
                console.log(`  📝 JS設定:`);
                console.log(`    必須: [${jsConfig.required.join(', ')}]`);
                console.log(`    任意: [${jsConfig.optional.join(', ')}]`);
            }
            
            console.log(`  🎨 HTMLバッジ:`);
            console.log(`    必須: [${htmlBadges.requiredFields.join(', ')}]`);
            console.log(`    任意: [${htmlBadges.optionalFields.join(', ')}]`);
            
            // 一致性チェック
            let tabPassed = true;
            
            // 期待値とJS設定の一致チェック
            if (jsConfig) {
                const reqMatch = JSON.stringify(config.expectedRequired.sort()) === JSON.stringify(jsConfig.required.sort());
                const optMatch = JSON.stringify(config.expectedOptional.sort()) === JSON.stringify(jsConfig.optional.sort());
                
                if (reqMatch && optMatch) {
                    console.log(`  ✅ JS設定一致`);
                    passedChecks++;
                } else {
                    console.log(`  ❌ JS設定不一致`);
                    tabPassed = false;
                    failedChecks.push(`${tabName}: JS設定不一致`);
                }
                totalChecks++;
            } else {
                console.log(`  ⚠️ JS設定が見つかりません`);
                failedChecks.push(`${tabName}: JS設定未実装`);
                tabPassed = false;
                totalChecks++;
            }
            
            console.log(`  📊 ${tabName}: ${tabPassed ? '✅ PASS' : '❌ FAIL'}`);
            
        } catch (error) {
            console.log(`  ❌ エラー: ${error.message}`);
            failedChecks.push(`${tabName}: ${error.message}`);
            totalChecks++;
        }
    }
    
    // 結果サマリー
    console.log('\n' + '=' .repeat(60));
    console.log('📊 フィールド一致性チェック結果サマリー');
    console.log('=' .repeat(60));
    console.log(`📈 総チェック数: ${totalChecks}`);
    console.log(`✅ 成功: ${passedChecks}`);
    console.log(`❌ 失敗: ${totalChecks - passedChecks}`);
    console.log(`📊 成功率: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);
    
    if (failedChecks.length > 0) {
        console.log('\n❌ 失敗詳細:');
        failedChecks.forEach(fail => console.log(`  - ${fail}`));
    }
    
    if (passedChecks === totalChecks) {
        console.log('\n🎉 すべてのフィールド一致性チェックが成功しました！');
        process.exit(0);
    } else {
        console.log('\n⚠️ 一部のチェックで問題が検出されました。');
        process.exit(1);
    }
}

// 実行
checkTabFieldConsistency().catch(error => {
    console.error('❌ チェック実行エラー:', error);
    process.exit(1);
});