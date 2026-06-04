import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CheckEmailPage = () => {
  return (
    <div className="flex h-svh items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We’ve sent a link to your email. Please check your inbox.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6">
            <Link href="/login">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckEmailPage;
