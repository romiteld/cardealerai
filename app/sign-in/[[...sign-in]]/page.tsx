import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
            footerActionLink: "text-purple-600 hover:text-purple-700"
          }
        }}
      />
    </div>
  );
} 