"use server"
import { cookies } from "next/headers";
import { CartItem } from "@/types";
import { convertToPlainObject, formatError, round2 } from "../utils";
import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import { cartItemSchema, insertCartSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Calculate cart prices
const calcPrice = (items: CartItem[]) => {
    const itemsPrice = round2(
        items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)
    ),
        shippingPrice = round2(itemsPrice > 1000 ? 0 : 100),
        taxPrice = round2(0.15 * itemsPrice),
        totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

    return {
        itemsPrice: itemsPrice.toFixed(2),
        shippingPrice: shippingPrice.toFixed(2),
        taxPrice: taxPrice.toFixed(2),
        totalPrice: totalPrice.toFixed(2),
    }
}

export async function addItemToCart(data: CartItem) {
    try {
        // Check for the cart cookie
        const sessionCartId = (await cookies()).get('sessionCartId')?.value;

        if (!sessionCartId) throw new Error('Cart session not found');

        // Get session and user ID
        const session = await auth();

        // Get the user id
        const userId = session?.user?.id ? (session.user.id as string) : undefined;

        // Get cart
        const cart = await getMyCart();

        // Parse and validate item
        const item = cartItemSchema.parse(data);

        // Find product in database
        const product = await prisma.product.findFirst({
            where: {id: item.productId}
        })

        if (!product) throw new Error('Product not found');

        if (!cart) {
            // Create a new cart object
            const newCart = insertCartSchema.parse({
                userId: userId,
                items: [item],
                sessionCartId: sessionCartId,
                ...calcPrice([item])
            });

            // Add to database
            await prisma.cart.create({
                data: newCart,
            });

            // Revalidate the product page
            revalidatePath(`/products/${product.slug}`);

            return {
                success: true,
                message: `${product.name} added to cart`
            };
        } else {
            // Check if the item is already in cart
            const existItem = (cart.items as CartItem[]).find(x => x.productId === item.productId);

            if (existItem) { 
                // Check the stock
                if (product.stock < existItem.qty + 1) {
                    throw new Error('Not enough stock available')
                }

                // Increase the quantity
                (cart.items as CartItem[]).find(x => x.productId === item.productId)!.qty = existItem.qty + 1;
            } else {
                // If item does not exist in cart
                // Check the stock
                if (product.stock < 1) throw new Error('Not enough stock available')

                // Add item to cart.items
                cart.items.push(item);
            }

            // Save to database
            await prisma.cart.update({
                where: { id: cart.id },
                data: {
                    items: cart.items as Prisma.CartUpdateitemsInput[], // as Prisma.CartUpdateitemsInput[],
                    ...calcPrice(cart.items as CartItem[])
                }
            });

            revalidatePath(`/products/${product.slug}`);

            return {
                success: true,
                message: `${product.name} ${existItem ? 'updated in' : 'added to'} cart`
            }

        }
    } catch (error) {
        console.log('error')
        return {
            success: false,
            message: formatError(error)
        }
    }
    
}

export async function getMyCart() {
    // Check for the cart cookie
    const sessionCartId = (await cookies()).get('sessionCartId')?.value;
    if (!sessionCartId) throw new Error('Cart session not found');

    // Get session and user ID
    const session = await auth();

    // Get the user id
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    // Get user cart from database
    const cart = await prisma.cart.findFirst({
        where: userId ? { userId: userId } : { sessionCartId: sessionCartId }
    });

    if (!cart) return undefined;

    // Convert decimals and return
    return convertToPlainObject({
        ...cart,
        items: cart.items as CartItem[],
        itemsPrice: cart.itemsPrice.toString(),
        totalPrice: cart.totalPrice.toString(),
        shippingPrice: cart.shippingPrice.toString(),
        taxPrice: cart.taxPrice.toString(),
    })
}

export async function removeItemFromCart(productId: string) {
    try {
        // Check for the cart cookie
        const sessionCartId = (await cookies()).get('sessionCartId')?.value;

        // Get product 
        const product = await prisma.product.findFirst({
            where: { id: productId }
        });

        if (!product) throw new Error('Product not found');

        // Get user cart
        const cart = await getMyCart();
        if (!cart) throw new Error('Cart not found');

        // Check for item
        const exist = (cart.items as CartItem[]).find(x => x.productId === productId);
        if (!exist) throw new Error('Item not found in cart');

        // Check if only 1 in quantity
        if (exist?.qty === 1) {
            // Remove item from cart
            cart.items = (cart.items as CartItem[]).filter(x => x.productId !== exist?.productId);
        } else {
            // Decrease the quantity
            (cart.items as CartItem[]).find(x => x.productId === productId)!.qty = exist!.qty - 1;
        }
        
        // Update the cart in the database
        await prisma.cart.update({
            where: {id: cart.id},
            data: {
                items: cart.items as Prisma.CartUpdateitemsInput[], // as Prisma.CartUpdateitemsInput[],
                ...calcPrice(cart.items as CartItem[])
            }
        });

        revalidatePath(`/products/${product.slug}`);

        return {
            success: true,
            message: `${product.name} was removed from the cart`
        }
    } catch (error) {
        return {
            success: false,
            message: formatError(error)
        }
    }
}