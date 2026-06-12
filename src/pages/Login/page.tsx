import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

import Logo from "@/assets/reservoir-logo.png"
import Cover from "@/assets/loading-logo.jpeg"

export default function Login() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <img src={Logo} className="h-6"/>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <form className={cn("flex flex-col gap-6")}>
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-2xl font-bold">Login to your account</h1>
                                    <p className="text-sm text-balance text-muted-foreground">
                                        Enter your email below to login to your account
                                    </p>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input id="email" type="email" placeholder="m@example.com" required />
                                </Field>
                                <Field>
                                    <div className="flex items-center">
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                    </div>
                                    <Input id="password" type="password" placeholder="*********" required />
                                </Field>
                                <Field>
                                    <Button type="submit">Login</Button>
                                </Field>
                                <Field>
                                    <FieldDescription className="text-center">
                                        Don&apos;t have an account?{" "}
                                        <Link to="/register" className="underline underline-offset-4">
                                            Sign up
                                        </Link>
                                    </FieldDescription>
                                </Field>
                            </FieldGroup>
                        </form>
                    </div>
                </div>
            </div>
            <div className="hidden bg-[#d50d0d] lg:flex lg:justify-center lg:items-center">
                <img
                    src={Cover}
                    alt="Image"
                    className="h-100 inline-flex rounded-2xl 2xl:h-125"
                />
            </div>
        </div>
    )
}
