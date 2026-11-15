import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert({
        projectId: "manchester-triagem",
        clientEmail: "firebase-adminsdk-fbsvc@manchester-triagem.iam.gserviceaccount.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCtHqAGIs9rins6\n8jDE9+2hlry2JXuVekDh/yJhu6ITLIOcunvTMT/wJ7gfX3kjw4YvrA1qvqHb7lyy\nzoN7z8m0MkAcCzKRS+jrnPZNRh+AoOKFHrrjbQXSNPJ81u6ZBSO4AAoDnrC/Nj+B\nFTUqJc8GZYt/reDjXE6Pk2c7QZc/GdT5rqQcdMXh01pmG7Mo+6ZBHcEjK9bJMO/C\nebVEZsC68OGbMnTFYHMoKzskhaW6v2mVYcPxishdR3DM73fBCt69mFCyIdurTZiE\nlziD/FAm/fkw0BTOlxK3jH2gHAZO9lfqcskKu3npBlRjiOhbFGNVS+FLCpyVf1Do\nC/X6w0jRAgMBAAECggEABBjYcqy6OfJSDkgTDWZMsmlN2AW1EgmNpYuTNbrqEAga\nqUfkjE/7EmTuP5fT1xvWfiRVQPR4Ait2+ChZBkIZpPEXgVJmhPfF8GWLkrKZJkMo\neTwL8jvvSlVEc93mUarEeKNPmVxVFIFlKVnmIzQ33Q/kKEZmLxtNJKq5Y7aerLiW\nztrey1ZYvC49ADpOQ8iFHaVkPQXbaYSfIudoBoID+z5RNsI8lHm6G2l8TI0g2XLy\nsvz6lAAXO9X8vMTgBh7ZJgPhcei9xeQNRx5k/r+mjhEzG5tH41ORslphhC7Pfx3x\nltvyczKNY4gdCfDIR80HCLHA7V5uOZMqVULqtjhQwQKBgQDc8Nj00skvJ5LrjMX/\ncklCXFZee7gufIKkDJL0odP/xJEl5bgBhTNHJF4zBhJg0gGAyFNkx2F1WZXds6im\nJEqXoWUHBX97DQKF3lTlsaoqCK7tVQ0deTyy+H52dHYjqYYzlJJLbaBXjDaH6zjc\nyAM0JXD0r5pNiDyupU6PK00IeQKBgQDIlypAK+/o1nr/XCwxI/+nCyci3+KAn9zl\n8zZSD/9xsX8u55SjVEMxcE8kgJZcFipTb9pzeEl4qLZEPiXXjhUSUK7WgDQsW09W\nIPLp0rWgeHgdt2KoVkSVPKYQpo9TZADxh/cNWkIny6VJE9LlrkAWT0AqUUUhqSwz\nmoH8fhXdGQKBgQDcjLw2oJfeL4X1BwC7f81rphs9lAkGtpn+wuKLu2OSJRmzl/43\n3kySztYN3xjHd7uyX8cHihRafYQh3O8UcpPXi2/7M1zPa+xBz/A1nkW8UhC0r7s4\n2cZi7bXn71fjP53MrZngG938puXkhkWr9ylji6CXURgaH05cFH44YsQyGQKBgFuw\npZKBwv9WkxCJDHZF80VjFredSUbsTCgcfXcTcvuAXBePqeTizngZ00NnN9POGfjb\nxypDEKqDzBTzp46Zls4xbUoFflPMRT6kfwUc2QMKLjW/LuytylnBSFOSHy/KJZhC\nQ06qNFVGhD4cPqnYddj8zuLJFWWmk9rexI4rAEl5AoGBAINaFBxSv0nPT+3wFBFK\n+24URDDJaqdCX5XWaeMpS+8GBV/CX3haO3ZFOBTBXwY5btOiljjuvZCCgFvazJ+i\noog7+lG6637FD8oz/NlIO59pPxpBs2ywYITnJ485QFYksdcAsqMKRfoAx3G4lpTh\nn0Xu+2M1QwQWj+oe4VjCdomC\n-----END PRIVATE KEY-----\n",
      }),
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);