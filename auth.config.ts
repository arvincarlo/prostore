import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
    providers: [],
    callbacks: {
        authorized({ request, auth }: any) {
            // Check for session cart cookie
            if (!request.cookies.get('sessionCartId')) {
                // Generate new session cart ID cookie
                const sessionCartId = crypto.randomUUID();
                console.log(sessionCartId)

                // Clone the request headers
                const newRequestHeaders = new Headers(request.headers);

                // Create the response and add the headers
                const response = NextResponse.next({
                    request: {
                        headers: newRequestHeaders,
                    }
                })
                
                // Generate the cookie, set newly generated sessionCartId in the response cookies
                response.cookies.set('sessionCartId', sessionCartId);
                return response;
                return true;
            } else {
                console.log(request.cookies.get('sessionCartId'))
                return true;
            }
        }
    }
} satisfies NextAuthConfig; 
// Satifies - ensure that the object structure config object is compatible with this type