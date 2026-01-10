import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md mx-auto text-center shadow-xl">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 justify-center">
            <AlertCircle className="h-12 w-12 text-destructive opacity-80" />
          </div>

          <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            We couldn't find the page you were looking for. It might have been moved or doesn't exist.
          </p>
          
          <Link href="/">
             <Button className="w-full">Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
