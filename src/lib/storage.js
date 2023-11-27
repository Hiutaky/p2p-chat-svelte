const key = 'pi-chat'
export const Storage = {
    set: (value) => localStorage.setItem(key, JSON.stringify(value)),
    get: () => JSON.parse(localStorage.getItem(key))
}