export const ensureTrailingSlash = (path: string): string => {
    return path[path.length - 1]==='/' ? path:path + '/'
}

export const getUuid = (componentName : string) => {
    // TODO: check if component already has (on previous runs) gotten uuid - if yes, return that
    return [...Array(8).keys()].map(() => {
        let item = ""
        while (item.length < 4) {
            item += String.fromCharCode(65 + Math.random() * 10)
        }
        return item
    }).join('-')
}

export const randomIntBetween = (min:number, max:number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
