import test from 'node:test';
import assert from 'node:assert/strict';
import { editorialStatus } from '../src/lib/editorial-status.js';
const client = (error: any) => ({from:()=>({select:()=>({limit:async()=>({error})})})}) as any;
test('editor readiness distinguishes missing migration, unavailable DB and ready schema',async()=>{
 assert.deepEqual(await editorialStatus(client({code:'42703'}),false),{schemaReady:false,databaseAvailable:true,rebuildConfigured:false});
 assert.deepEqual(await editorialStatus(client({code:'NETWORK'}),true),{schemaReady:false,databaseAvailable:false,rebuildConfigured:true});
 assert.deepEqual(await editorialStatus(client(null),true),{schemaReady:true,databaseAvailable:true,rebuildConfigured:true});
});
