import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { atom } from 'recoil';
import { Client, SyncDocument } from 'twilio-sync';

const SyncContext = createContext<Client | undefined>(undefined);

export default function SyncProvider({ tokenFunc, children }) {
  const [syncClient, setSyncClient] = useState<Client>();

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
    <SyncContext.Provider value={syncClient!}>
      {children}
    </SyncContext.Provider>
  );
};

export function useSyncState<T>(roomId: string, name: string, initialValue: T | undefined): [ T | undefined, (value: T) => void | undefined ] {
  const syncClient = useContext(SyncContext);
  const [doc, setDoc] = useState<SyncDocument>();
  const [data, setDataInternal] = useState<T>();

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
        setDataInternal((newDoc.data as any).state);
        newDoc.on('updated', args => setDataInternal(args.data.state));
      }
    })();
    return () => { doc && doc.close() };
  }, [syncClient, doc, name, initialValue, roomId]);

  const setData = useCallback((value: T) => {
    (async () => {
      if (typeof value === 'function') {
        await doc?.set({state: value(data)});
      }
      else {
        await doc?.set({state: value});
      }
    })();
  }, [doc, data]);

  return [data, setData];
};
