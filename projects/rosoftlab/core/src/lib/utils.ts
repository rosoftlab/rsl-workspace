export function readFileAsync(file: File): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event: any) => {
            resolve(event.target.result);
        };

        reader.onerror = (event: any) => {
            reject(event.target.error);
        };

        reader.readAsArrayBuffer(file);
    });
}

export function getValueFromJsonData(jsonData: any, key: string): any {
    // Convert the key and all JSON keys to lowercase
    const lowercaseKey = key.toLowerCase();
    const lowercaseKeys = Object.keys(jsonData).map(k => k.toLowerCase());

    // Find the lowercase key in the lowercase keys array
    const index = lowercaseKeys.indexOf(lowercaseKey);

    // If found, use the original (proper case) key to access the value
    if (index !== -1) {
        const originalKey = Object.keys(jsonData)[index];
        return jsonData[originalKey];
    }

    // Key not found
    return undefined;
}