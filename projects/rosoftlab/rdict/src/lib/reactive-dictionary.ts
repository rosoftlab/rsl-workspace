import { BehaviorSubject, Observable } from "rxjs";
import { SocketService } from "./services/socket.service";

export class ReactiveDictionary extends Map<string, any> {
    private static instance: Map<string, ReactiveDictionary> = new Map<string, ReactiveDictionary>;
    private _socketService: SocketService;
    private changes$: BehaviorSubject<any> = new BehaviorSubject(null);
    private isInitialized: boolean = false;
    private _authToken: string = null;
    private constructor(socketService: SocketService,
        authToken: string) {
        super();
        this._authToken = authToken;
        this._socketService = socketService;
        this._socketService.initSocket(authToken)
        this._socketService.getSetEvent(this)
    }

    // Method to get the singleton instance
    public static getInstance(socketService: SocketService, authToken: string, instance_key?: string): ReactiveDictionary {
        if (!instance_key)
            instance_key = 'root'
        if (!ReactiveDictionary.instance.has(instance_key)) {
            ReactiveDictionary.instance.set(instance_key, new ReactiveDictionary(socketService, authToken));
        }
        const instance = ReactiveDictionary.instance.get(instance_key);
        if (!instance) {
            throw new Error(`No instance found for key: ${instance_key}`); // Handle undefined case
        }

        return instance; // Now TypeScript knows 'instance' is not undefined
    }
    // str_keys(): string[] {
    override keys(): IterableIterator<string> {
        const excludedKeys = ['__guid', '__type']; // Key to exclude
        const iterator = super.keys();

        const filteredIterator = {
            [Symbol.iterator]: () => ({
                next: () => {
                    let result;

                    // Loop until we find a valid key or run out of keys
                    do {
                        result = iterator.next(); // Get the next entry ([key, value])
                        if (result.done) return { done: true }; // Stop if done

                        const key = result.value; // Destructure the entry
                        const value = super.get(key)
                        // Check if the key is in excludedKeys or if the value is an object
                        if (
                            !excludedKeys.includes(key) &&
                            !(typeof value === 'object' && value !== null)
                        ) {
                            return { value: key, done: false }; // Return the valid key
                        }
                    } while (true); // Continue until a valid key is found
                }
            })
        };

        return filteredIterator as IterableIterator<string>;
    }
    // Asynchronous method to get a value by key
    async asyncGet(key: string): Promise<any> {
        // console.log('Get key: ', key);
        const keys = key.split('.')
        if (keys.length === 1) {
            if (this.has(key)) {
                const value = this.get(key)
                if (value instanceof ReactiveDictionary) {
                    return value
                }
                if (typeof value === 'object' && value !== null) {
                    const dict_type = value['__type']
                    // console.log('value type : ', dict_type);
                    if (dict_type === 'dict' || dict_type === 'lazy') {
                        const lazyLoadData = await this.lazyLoadSync(this.get('__guid'), key);
                        // console.log(lazyLoadData)
                        if (lazyLoadData) {
                            const dict = new ReactiveDictionary(this._socketService, this._authToken);
                            await dict.asyncInit(lazyLoadData.data)
                            this.set(key, dict)
                            return dict
                        }
                    }
                }
                return value
            }
        } else {
            const obj = await this.asyncGet(keys[0]) as ReactiveDictionary
            if (obj)
                return await obj.asyncGet(keys.slice(1).join('.'))
            else
                return null;
        }
    }

    // Asynchronous method to set a value by key
    async asyncSet(key: string, value: any, emmit_event: boolean = true): Promise<void> {
        if (emmit_event) {
            try {
                await this._socketService.emitSet(this.get('__guid'), key, value);
            } catch (error) {
                console.error('Error emitting set event:', error);
            }
        }
        this.set(key, value)
        this.changes$.next({ key, value });
    }

    // Asynchronous method to initialize with a set of key-value pairs
    async asyncInit(initialData?: Record<string, any>) {
        if (!this.isInitialized) {
            try {
                // If initial data is not provided, fetch it
                const data = initialData || await this._socketService.getInitialData();
                // this.known_dicts.set(data.__guid,data);
                // Set the initial properties on the proxy
                for (const [key, value] of Object.entries(data)) {
                    this.set(key, value);
                }
                this.isInitialized = true
            } catch (error) {
                console.error('Error during initialization:', error);
            }
        }
    }

    async lazyLoadSync(guid: string, prop: string | symbol): Promise<any> {
        try {
            const data = await this._socketService.requestLazyLoad(guid, String(prop));
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
    public getPlainObject(): Record<string, any> {
        const plainObject: Record<string, any> = {};
        this.forEach((value, key) => {
            if (value instanceof ReactiveDictionary)
                plainObject[key] = value.getPlainObject()
            else
                plainObject[key] = value; // Add key-value pairs to the plain object
        });
        return plainObject; // Return the plain object
    }
    async getTable(key: string): Promise<any[]> {
        const data = await this.asyncGet(key); // Get rooms from the ReactiveDictionary
        if (!data) {
            return []; // Return an empty array if data is undefined
        }

        // Filter and get only entries that are instances of ReactiveDictionary
        const result = await Promise.all(Array.from(data.entries()).map(async (key: any) => await data.asyncGet(key[0])) // Get data from asyncGet
        ) || []; // Return an empty array if the above yields undefined


        return result.filter((entry: any) => entry instanceof ReactiveDictionary);
    }
    async getTableWithoutGuid(key: string): Promise<any[]> {
        const data = await this.asyncGet(key); // Get rooms from the ReactiveDictionary
        if (!data) {
            return []; // Return an empty array if data is undefined
        }

        // Filter and get only entries that are instances of ReactiveDictionary
        const result = await Promise.all(Array.from(data.entries()).map(async (key: any) => await data.asyncGet(key[0])) // Get data from asyncGet
        ) || []; // Return an empty array if the above yields undefined


        var filteredResults = result.filter((entry: any) => entry instanceof ReactiveDictionary);

        return filteredResults.map(dictionary => {
            // Convert Map to object and filter out __guid
            const filteredObject = {};
            for (const [key, value] of dictionary.entries()) {
                if (key !== '__guid') {
                    filteredObject[key] = value;
                }
            }
            return filteredObject;
        });
    }
    onChanges(): Observable<any> {
        return this.changes$.asObservable();
    }
}
