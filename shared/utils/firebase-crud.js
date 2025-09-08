// Firebase CRUD操作統一クラス
// 全タブのFirebaseデータ操作を統一し、コードの重複を削減

class FirebaseCRUD {
    
    // データ保存（新規作成）- 統一エラーハンドリング使用
    static async save(collection, userId, data) {
        // 事前条件：Firebaseの初期化確認
        Contract.require(firebase && firebase.database, 'Firebaseが初期化されている必要があります');
        Contract.require(firebase.auth && firebase.auth(), 'Firebase認証が初期化されている必要があります');
        
        // 事前条件：パラメータの検証
        Contract.requireType(collection, 'string', 'collection');
        Contract.require(collection.length > 0, 'コレクション名は空であってはいけません');
        Contract.requireType(userId, 'string', 'userId');
        Contract.require(userId.length > 0, 'userIdは空であってはいけません');
        Contract.require(data && typeof data === 'object', 'データはオブジェクトである必要があります');
        Contract.require(!Array.isArray(data), 'データは配列ではなくオブジェクトである必要があります');
        
        // 事前条件：認証状態の確認
        const currentUser = firebase.auth().currentUser;
        Contract.require(currentUser, 'ユーザーがログインしている必要があります');
        Contract.require(currentUser.uid === userId, 'userIdが現在のログインユーザーと一致する必要があります');
        
        return await UniversalErrorHandler.handleFirebase(
            async () => {
                const ref = firebase.database().ref(`users/${userId}/${collection}`);
                const result = await ref.push(data);
                
                // 事後条件：保存結果の検証
                Contract.ensure(result && result.key, '保存操作は有効なキーを返す必要があります');
                Contract.ensure(typeof result.key === 'string', '返されたキーは文字列である必要があります');
                
                return result;
            },
            'save',
            collection,
            'データ保存'
        );
    }
    
    // データ読み込み（リアルタイムリスナー）
    static load(collection, userId, callback) {
        // 事前条件：Firebaseの初期化確認
        Contract.require(firebase && firebase.database, 'Firebaseが初期化されている必要があります');
        
        // 事前条件：パラメータの検証
        Contract.requireType(collection, 'string', 'collection');
        Contract.require(collection.length > 0, 'コレクション名は空であってはいけません');
        Contract.requireType(userId, 'string', 'userId');
        Contract.require(userId.length > 0, 'userIdは空であってはいけません');
        Contract.requireType(callback, 'function', 'callback');
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}`);
            const listener = ref.on('value', callback);
            
            // 事後条件：リスナーが正常に設定されたことを確認
            Contract.ensure(listener !== undefined, 'リスナーが正常に設定される必要があります');
            
            console.log(`✅ FirebaseCRUD.load: ${collection} listener attached`);
            return listener;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.load error (${collection}):`, error);
            throw error;
        }
    }
    
    // データ更新（既存データ更新）
    static async update(collection, userId, entryId, data) {
        // 事前条件：Firebaseの初期化確認
        Contract.require(firebase && firebase.database, 'Firebaseが初期化されている必要があります');
        
        // 事前条件：パラメータの検証
        Contract.requireType(collection, 'string', 'collection');
        Contract.require(collection.length > 0, 'コレクション名は空であってはいけません');
        Contract.requireType(userId, 'string', 'userId');
        Contract.require(userId.length > 0, 'userIdは空であってはいけません');
        Contract.requireType(entryId, 'string', 'entryId');
        Contract.require(entryId.length > 0, 'entryIdは空であってはいけません');
        Contract.require(data && typeof data === 'object', 'データはオブジェクトである必要があります');
        Contract.require(!Array.isArray(data), 'データは配列ではなくオブジェクトである必要があります');
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}/${entryId}`);
            await ref.update(data);
            
            // 事後条件：更新が成功したことを確認（例外が投げられていない）
            Contract.ensure(true, '更新操作が正常に完了しました');
            
            console.log(`✅ FirebaseCRUD.update: ${collection}/${entryId} updated`);
            return true;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.update error (${collection}/${entryId}):`, error);
            throw error;
        }
    }
    
    // データ削除
    static async delete(collection, userId, entryId) {
        // 事前条件：Firebaseの初期化確認
        Contract.require(firebase && firebase.database, 'Firebaseが初期化されている必要があります');
        
        // 事前条件：パラメータの検証
        Contract.requireType(collection, 'string', 'collection');
        Contract.require(collection.length > 0, 'コレクション名は空であってはいけません');
        Contract.requireType(userId, 'string', 'userId');
        Contract.require(userId.length > 0, 'userIdは空であってはいけません');
        Contract.requireType(entryId, 'string', 'entryId');
        Contract.require(entryId.length > 0, 'entryIdは空であってはいけません');
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}/${entryId}`);
            await ref.remove();
            
            // 事後条件：削除が成功したことを確認（例外が投げられていない）
            Contract.ensure(true, '削除操作が正常に完了しました');
            
            console.log(`✅ FirebaseCRUD.delete: ${collection}/${entryId} deleted`);
            return true;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.delete error (${collection}/${entryId}):`, error);
            throw error;
        }
    }
    
    // 一度だけ読み込み
    static async once(collection, userId) {
        // 事前条件：Firebaseの初期化確認
        Contract.require(firebase && firebase.database, 'Firebaseが初期化されている必要があります');
        
        // 事前条件：パラメータの検証
        Contract.requireType(collection, 'string', 'collection');
        Contract.require(collection.length > 0, 'コレクション名は空であってはいけません');
        Contract.requireType(userId, 'string', 'userId');
        Contract.require(userId.length > 0, 'userIdは空であってはいけません');
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}`);
            const snapshot = await ref.once('value');
            
            // 事後条件：スナップショットが取得されたことを確認
            Contract.ensure(snapshot !== null && snapshot !== undefined, 'スナップショットが取得される必要があります');
            
            console.log(`✅ FirebaseCRUD.once: ${collection} data retrieved`);
            return snapshot;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.once error (${collection}):`, error);
            throw error;
        }
    }
    
    // カスタムIDでのデータ保存（メモリスト用）
    static async setWithId(collection, userId, entryId, data) {
        // 事前条件：Firebaseの初期化確認
        Contract.require(firebase && firebase.database, 'Firebaseが初期化されている必要があります');
        
        // 事前条件：パラメータの検証
        Contract.requireType(collection, 'string', 'collection');
        Contract.require(collection.length > 0, 'コレクション名は空であってはいけません');
        Contract.requireType(userId, 'string', 'userId');
        Contract.require(userId.length > 0, 'userIdは空であってはいけません');
        Contract.requireType(entryId, 'string', 'entryId');
        Contract.require(entryId.length > 0, 'entryIdは空であってはいけません');
        Contract.require(data !== null && data !== undefined, 'データがnullまたはundefinedであってはいけません');
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}/${entryId}`);
            await ref.set(data);
            
            // 事後条件：保存が成功したことを確認（例外が投げられていない）
            Contract.ensure(true, '保存操作が正常に完了しました');
            
            console.log(`✅ FirebaseCRUD.setWithId: ${collection}/${entryId} saved`);
            return true;
        } catch (error) {
            console.error(`❌ FirebaseCRUD.setWithId error (${collection}/${entryId}):`, error);
            throw error;
        }
    }
    
    // 特定IDの一度だけ読み込み（編集用）
    static async getById(collection, userId, entryId) {
        // 事前条件：Firebaseの初期化確認
        Contract.require(firebase && firebase.database, 'Firebaseが初期化されている必要があります');
        
        // 事前条件：パラメータの検証
        Contract.requireType(collection, 'string', 'collection');
        Contract.require(collection.length > 0, 'コレクション名は空であってはいけません');
        Contract.requireType(userId, 'string', 'userId');
        Contract.require(userId.length > 0, 'userIdは空であってはいけません');
        Contract.requireType(entryId, 'string', 'entryId');
        Contract.require(entryId.length > 0, 'entryIdは空であってはいけません');
        
        try {
            const ref = firebase.database().ref(`users/${userId}/${collection}/${entryId}`);
            const snapshot = await ref.once('value');
            
            // 事後条件：スナップショットが取得されたことを確認
            Contract.ensure(snapshot !== null && snapshot !== undefined, 'スナップショットが取得される必要があります');
            
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