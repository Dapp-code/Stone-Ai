"use client";

import * as React from "react";
import { useState, useId, useEffect } from "react";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, UserCheck } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Typewriter } from "./typewriter";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2rem] text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#6B705C] text-white hover:bg-[#4A4A40]",
        destructive: "bg-red-500 text-white hover:bg-red-500/90",
        outline: "border border-[#D6D6CC] bg-[#E5E5DC]/50 hover:bg-[#D6D6CC] text-[#2C2C28]",
        secondary: "bg-[#E5E5DC] text-[#2C2C28] hover:bg-[#D6D6CC]",
        ghost: "hover:bg-[#E5E5DC]/70 hover:text-[#2C2C28]",
        link: "text-[#6B705C] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[1.5rem] border border-[#D6D6CC] bg-white px-4 py-3 text-sm text-[#2C2C28] shadow-sm shadow-black/5 transition-colors placeholder-[#8A8A7C] focus-visible:bg-[#F2F2EB] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id} className="text-neutral-700 dark:text-neutral-300">{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

function SignInForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    onSuccess(email || "user@example.com");
  };
  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-serif italic font-bold tracking-tight text-[#4A4A40]">Sign in to Stone AI</h1>
        <p className="text-balance text-sm text-[#8A8A7C]">Enter your details to construct your context</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-[#4A4A40] font-medium">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="••••••••" />
        <Button type="submit" variant="default" className="mt-2 text-white bg-[#6B705C] hover:bg-[#4A4A40] cursor-pointer rounded-full h-11 font-bold shadow-md">Sign In</Button>
      </div>
    </form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: (email: string) => void }) {
  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    onSuccess(email || "user@example.com");
  };
  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-serif italic font-bold tracking-tight text-[#4A4A40]">Create an account</h1>
        <p className="text-balance text-sm text-[#8A8A7C] font-normal">Begin your intelligent journey with Stone AI</p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="name" className="text-[#4A4A40] font-medium font-sans">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-[#4A4A40] font-medium">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="••••••••" />
        <Button type="submit" variant="default" className="mt-2 text-white bg-[#6B705C] hover:bg-[#4A4A40] cursor-pointer rounded-full h-11 font-bold shadow-md">Sign Up</Button>
      </div>
    </form>
  );
}

function AuthFormContainer({ isSignIn, onToggle, onLoginSuccess }: { isSignIn: boolean; onToggle: () => void; onLoginSuccess: (email: string) => void; }) {
    return (
        <div className="mx-auto grid w-[350px] gap-2">
            {isSignIn ? <SignInForm onSuccess={onLoginSuccess} /> : <SignUpForm onSuccess={onLoginSuccess} />}
            <div className="text-center text-sm pt-2 text-[#8A8A7C]">
                {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
                <Button variant="link" className="pl-1 text-[#6B705C] font-semibold cursor-pointer h-auto py-0 inline-flex" onClick={onToggle}>
                    {isSignIn ? "Sign up" : "Sign in"}
                </Button>
            </div>
            <div className="relative text-center text-xs py-2 after:absolute after:inset-x-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-[#D6D6CC]">
                <span className="relative z-10 bg-[#F2F2EB] px-2 text-[#8A8A7C]">Or continue with</span>
            </div>
            <Button variant="outline" type="button" className="cursor-pointer rounded-full border border-[#D6D6CC] bg-white hover:bg-[#E5E5DC] text-[#2C2C28]" onClick={() => onLoginSuccess("guest@google.com")}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google icon" className="mr-2 h-4 w-4" />
                Continue with Google
            </Button>
            <Button variant="default" type="button" className="cursor-pointer rounded-full bg-[#6B705C] hover:bg-[#4A4A40] text-white font-bold h-10 shadow-sm mt-1" onClick={() => onLoginSuccess("tamu@stone.ai")}>
                <UserCheck className="mr-2 h-4.5 w-4.5 text-[#E5E5DC]" />
                Masuk sebagai Tamu (Guest Mode)
            </Button>
        </div>
    )
}

interface AuthContentProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    }
}

interface AuthUIProps {
    signInContent?: AuthContentProps;
    signUpContent?: AuthContentProps;
    onLoginSuccess: (email: string) => void;
}

const defaultSignInContent = {
    image: {
        src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
        alt: "A minimalist modern concrete design representing Stone AI"
    },
    quote: {
        text: "Solid as stone, fluid as water. Stone AI blends durability with intellect.",
        author: "Stone AI System"
    }
};

const defaultSignUpContent = {
    image: {
        src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
        alt: "A smooth stone garden showcasing pure elegant architecture"
    },
    quote: {
        text: "A structured, reliable cognitive companion waiting for your spark.",
        author: "Stone AI Architecture"
    }
};

export function AuthUI({ signInContent = {}, signUpContent = {}, onLoginSuccess }: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const finalSignInContent = {
      image: { ...defaultSignInContent.image, ...signInContent.image },
      quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  const finalSignUpContent = {
      image: { ...defaultSignUpContent.image, ...signUpContent.image },
      quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="w-full min-h-screen bg-[#F2F2EB] text-[#2C2C28] md:grid md:grid-cols-2">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      <div className="flex h-screen items-center justify-center p-6 md:h-auto md:p-0 md:py-12 bg-[#F2F2EB]">
        <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} onLoginSuccess={onLoginSuccess} />
      </div>

      <div
        className="hidden md:block relative bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${currentContent.image.src})` }}
        key={currentContent.image.src}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-neutral-950 to-transparent" />
        
        <div className="relative z-10 flex h-full flex-col items-center justify-end p-8 pb-12">
            <blockquote className="space-y-2 text-center text-white max-w-md">
              <p className="text-xl font-medium leading-relaxed">
                “<Typewriter
                    key={currentContent.quote.text}
                    text={currentContent.quote.text}
                    speed={60}
                  />”
              </p>
              <cite className="block text-sm font-light text-neutral-300 not-italic">
                  — {currentContent.quote.author}
              </cite>
            </blockquote>
        </div>
      </div>
    </div>
  );
}
