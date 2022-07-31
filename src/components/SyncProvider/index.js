import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Client } from 'twilio-sync';

const SyncContext = createContext();

export default function SyncProvider({ tokenFunc, children }) {
  const [syncClient, setSyncClient] = useState();

  useEffect(() => {
    (async () => {
      if (!syncClient) {
        const token = await tokenFunc();
        const client = new Client(token);
        client.on('tokenAboutToExpire', async () => {
          const token = await tokenFunc();
          client.updateToken(token);
        });
        setSyncClient(client);
      }
    })();

    return () => {
      if (syncClient) {
        syncClient.shutdown();
        setSyncClient(undefined);
      }
    };
  }, [syncClient, tokenFunc]);

  return (
    <SyncContext.Provider value={{client: syncClient}}>
      {children}
    </SyncContext.Provider>
  );
};

export function useSyncState(roomId, name, initialValue) {
  const { client: syncClient } = useContext(SyncContext);
  const [doc, setDoc] = useState();
  const [data, setDataInternal] = useState();

  useEffect(() => {
    setDoc(undefined);
    setDataInternal(undefined);
  }, [syncClient]);

  useEffect(() => {
    (async () => {
      if (syncClient && !doc) {
        const newDoc = await syncClient.document({ id: `${roomId}-${name}`, mode: 'open_or_create', ttl: 3600});
        if (!newDoc.data) {
          await newDoc.set({state: initialValue});
        }
        setDoc(newDoc);
        setDataInternal(newDoc.data.state);
        newDoc.on('updated', args => setDataInternal(args.data.state));
      }
    })();
    return () => { doc && doc.close() };
  }, [syncClient, doc, name, initialValue, roomId]);

  const setData = useCallback(value => {
    (async () => {
      if (typeof value === 'function') {
        await doc.set({state: value(data)});
      }
      else {
        await doc.set({state: value});
      }
    })();
  }, [doc, data]);

  return [data, setData];
};
