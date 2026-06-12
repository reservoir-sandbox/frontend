import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

import Logo from "@/assets/reservoir-logo.png"
import Cover from "@/assets/loading-logo.jpeg"

export default function Register() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <img src={Logo} className="h-6" />
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center mt-5">
                    <div className="w-full max-w-xs">
                        <form className={"flex flex-col gap-6"} >
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h1 className="text-2xl font-bold">Create your account</h1>
                                    <p className="text-sm text-balance text-muted-foreground">
                                        Fill in the form below to create your account
                                    </p>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                    <Input id="name" type="text" placeholder="John Doe" required />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input id="email" type="email" placeholder="m@example.com" required />
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="email">Character</FieldLabel>
                                    <Select required>
                                        <SelectTrigger className="w-45">
                                            <SelectValue placeholder="Select Character" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="1">Mr. White</SelectItem>
                                                <SelectItem value="2">Mr. Orange</SelectItem>
                                                <SelectItem value="3">Mr. Blonde</SelectItem>
                                                <SelectItem value="4">Mr. Pink</SelectItem>
                                                <SelectItem value="5">Mr. Brown</SelectItem>
                                                <SelectItem value="6">Mr. Blue</SelectItem>
                                                <SelectItem value="7">Nice Guy Eddie</SelectItem>
                                                <SelectItem value="8">Joe Cobol</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <Input id="password" type="password" placeholder="*********" required />
                                    {/* <FieldDescription>
                                        Must be at least 8 characters long.
                                    </FieldDescription> */}
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                                    <Input id="confirm-password" type="password" placeholder="*********" required />
                                    {/* <FieldDescription>Please confirm your password.</FieldDescription> */}
                                </Field>
                                <Field>
                                    <Button type="submit">Create Account</Button>
                                </Field>
                                <Field>
                                    <FieldDescription className="px-6 text-center">
                                        Already have an account? <Link to={"/login"}>Sign in</Link>
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
