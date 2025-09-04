// Firebase CRUD操作統一クラス
// 全タブのFirebaseデータ操作を統一し、コードの重複を削減

class FirebaseCRUD {
    
    // データ保存（新規作成）- 統一エラーハンドリング使用
    static async save(collection, userId, data) {
        return await UniversalErrorHandler.handleFirebase(
            async () => {
                if (!firebase || !firebase.database) {
                    throw new Error('Firebase database not initialized');
                }
                
                if (!userId) {
                    throw new Error('User ID is required');
                }
                
                const ref = firebase.database().ref(`users/${userId}/${collection}`);
                const result = await ref.push(data);
                return result;
            },
            'save',
            collection,
            'データ保存'
        );
    }
    
    // データ読み込み（リアルタイムリスナー）
    static load(collection, userId, callback) {
        if (!firebase || !firebase.database) {
            throw new Error('Firebase database not initialized');
        }
        
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        if (typeof callback !== 'function') {
            throw new Error('Callback function is required');
        }
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}`);
            const listener = ref.on('value', callback);
            console.log(`✅ FirebaseCRUD.load: ${collection} listener attached`);
            return listener;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.load error (${collection}):`, error);
            throw error;
        }
    }
    
    // データ更新（既存データ更新）
    static async update(collection, userId, entryId, data) {
        if (!firebase || !firebase.database) {
            throw new Error('Firebase database not initialized');
        }
        
        if (!userId || !entryId) {
            throw new Error('User ID and entry ID are required');
        }
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}/${entryId}`);
            await ref.update(data);
            console.log(`✅ FirebaseCRUD.update: ${collection}/${entryId} updated`);
            return true;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.update error (${collection}/${entryId}):`, error);
            throw error;
        }
    }
    
    // データ削除
    static async delete(collection, userId, entryId) {
        if (!firebase || !firebase.database) {
            throw new Error('Firebase database not initialized');
        }
        
        if (!userId || !entryId) {
            throw new Error('User ID and entry ID are required');
        }
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}/${entryId}`);
            await ref.remove();
            console.log(`✅ FirebaseCRUD.delete: ${collection}/${entryId} deleted`);
            return true;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.delete error (${collection}/${entryId}):`, error);
            throw error;
        }
    }
    
    // 一度だけ読み込み
    static async once(collection, userId) {
        if (!firebase || !firebase.database) {
            throw new Error('Firebase database not initialized');
        }
        
        if (!userId) {
            throw new Error('User ID is required');
        }
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}`);
            const snapshot = await ref.once('value');
            console.log(`✅ FirebaseCRUD.once: ${collection} data retrieved`);
            return snapshot;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.once error (${collection}):`, error);
            throw error;
        }
    }
    
    // カスタムIDでのデータ保存（メモリスト用）
    static async setWithId(collection, userId, entryId, data) {
        if (!firebase || !firebase.database) {
            throw new Error('Firebase database not initialized');
        }
        
        if (!userId || !entryId) {
            throw new Error('User ID and entry ID are required');
        }
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}/${entryId}`);
            await ref.set(data);
            console.log(`✅ FirebaseCRUD.setWithId: ${collection}/${entryId} saved`);
            return true;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.setWithId error (${collection}/${entryId}):`, error);
            throw error;
        }
    }
    
    // 特定IDの一度だけ読み込み（編集用）
    static async getById(collection, userId, entryId) {
        if (!firebase || !firebase.database) {
            throw new Error('Firebase database not initialized');
        }
        
        if (!userId || !entryId) {
            throw new Error('User ID and entry ID are required');
        }
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}/${entryId}`);
            const snapshot = await ref.once('value');
            console.log(`✅ FirebaseCRUD.getById: ${collection}/${entryId} retrieved`);
            return snapshot;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.getById error (${collection}/${entryId}):`, error);
            throw error;
        }
    }
}

// グローバルに公開
window.FirebaseCRUD = FirebaseCRUD;

console.log('🔥 Firebase CRUD統一クラス読み込み完了');