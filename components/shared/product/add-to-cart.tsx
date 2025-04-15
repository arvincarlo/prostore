"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Plus, Minus, Loader } from "lucide-react";
import { Cart, CartItem } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useTransition } from "react";

const AddToCart = ({ cart, item }: { item: CartItem, cart?: Cart; }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAddToCart = async () => {
        startTransition(async () => {
            const response = await addItemToCart(item);
            if (!response.success) {
                toast({
                    variant: 'destructive',
                    description: response.message,
                });
                return;
            }
    
            // Handle success add to cart
            toast({
                description: response.message,
                action: (
                    <ToastAction className="bg-primary  text-white hover:bg-gray-800" altText="Go To Cart" onClick={() => router.push('/cart')}>
                        Go to Cart
                    </ToastAction>
                )
            })
        });
    }

    // Check if item is in cart
    const existItem = cart && cart.items.find((cartItem) => cartItem.productId === item.productId);

    // Handle remove from cart
    const handleRemoveFromCart = async () => {
        startTransition(async () => {
            const response = await removeItemFromCart(item.productId);

            toast({
                variant: response.success ? 'default' : 'destructive',
                description: response.message,
            });
    
            return;
        })
    }

    return existItem ? (
        <div>
            <Button type="button" variant="outline" onClick={handleRemoveFromCart} disabled={isPending}>
                { isPending ? (
                    <Loader className="w-4 h-4 animate-spin"/>
                ) : (
                    <Minus className="h-4 w-4"/>
                ) }
            </Button>
            <span className="px-2">{ existItem.qty }</span>
            <Button type="button" variant="outline" onClick={handleAddToCart} disabled={isPending}>
                { isPending ? (
                    <Loader className="w-4 h-4 animate-spin"/>
                ) : (
                    <Plus className="h-4 w-4"/>
                ) }
            </Button>
        </div>
    ) : (
        <Button className="w-full" type="button" onClick={handleAddToCart} disabled={isPending}>
            { isPending ? (
                <Loader className="w-4 h-4 animate-spin"/>
            ) : (
                <Plus className="h-4 w-4"/>
            ) } Add to Cart
        </Button>
    );
}

export default AddToCart;