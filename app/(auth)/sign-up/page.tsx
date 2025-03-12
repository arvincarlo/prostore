import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { auth } from '@/auth';
import { redirect } from "next/navigation";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
    title: 'Sign Up'
}

const SignUpPage = async(props: {
    searchParams: Promise<{
        callbackUrl: string;
    }>
}) => {
    const { callbackUrl } = await props.searchParams;

    const session = await auth();

    if (session) {
        redirect(callbackUrl || '/')
    }

    return <div className="w-full max-w-md mx-auto">
        <Card>
            <CardHeader className="space-y-4">
                <Link href="/" className="flex-center">
                    <Image src="/images/logo.svg" width={100} height={100} alt="logo" priority={true}/>
                </Link>
                <CardTitle className="text-center">
                    Create an Account
                </CardTitle>
                <CardDescription className="text-center">
                    Enter your information below to sign up
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <SignUpForm/>
            </CardContent>
        </Card>
    </div>;
}

export default SignUpPage;